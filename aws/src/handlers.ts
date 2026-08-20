import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { S3EventRecord } from "aws-lambda";
import pdfParse from "pdf-parse";
import { FileStatus } from "./constants.js";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { Pinecone } from "@pinecone-database/pinecone";
import { GoogleGenAI } from "@google/genai";
import { env } from "./env.js";

const ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
const s3 = new S3Client({});
const docClient = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const tableName = env.DOCUMENTS_TABLE;

const pinecone = new Pinecone({ apiKey: env.PINECONE_API_KEY });
const index = pinecone.Index({ name: env.PINECONE_INDEX });

export interface PipelineEvent {
  Records: S3EventRecord[];
  userEmail?: string;
  fileKey?: string;
  text?: string;
  chunks?: string[];
  indexedCount?: number;
  status?: FileStatus;
  error?: any;
}

async function generateEmbeddings(
  chunks: string[],
  fileKey: string,
  userEmail: string,
) {
  const response = await ai.models.embedContent({
    model: "gemini-embedding-001",
    contents: chunks,
  });

  return (
    response?.embeddings?.map((emb, index) => ({
      id: `${fileKey}_chunk_${index}`,
      values: emb.values || [],
      metadata: {
        userEmail,
        fileKey,
        chunkIndex: index,
        text: chunks[index],
      },
    })) || []
  );
}

async function upsertToPinecone(
  records: Array<{
    id: string;
    values: number[];
    metadata: Record<string, any>;
  }>,
  userEmail: string,
) {
  const namespace = index.namespace(userEmail);
  const batchSize = 100;
  for (let i = 0; i < records.length; i += batchSize) {
    const batch = records.slice(i, i + batchSize);
    await namespace.upsert({ records: batch });
  }
}

export const extractText = async (
  event: PipelineEvent,
): Promise<PipelineEvent> => {
  const bucket = event.Records[0].s3.bucket.name;
  const key = event.Records[0].s3.object.key;
  const userEmail = event.userEmail || key.split("/")[0];

  const object = await s3.send(
    new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    }),
  );

  if (!object.Body) {
    throw new Error("No body found in the S3 object");
  }

  const pdfBuffer = Buffer.from(await object.Body.transformToByteArray());
  const parseResult = await pdfParse(pdfBuffer);

  console.log(
    "Step 1: Extracting text - input:",
    JSON.stringify(event, null, 2),
  );

  return {
    ...event,
    text: parseResult.text,
    userEmail,
    fileKey: key,
  };
};

export const chunkText = async (
  event: PipelineEvent,
): Promise<PipelineEvent> => {
  console.log("Step 2: Chunking text - input:", JSON.stringify(event, null, 2));

  const text = event.text;

  if (!text) {
    throw new Error("Text not found");
  }

  const chunks = text.match(/[\s\S]{1,500}(?!\w)/g) || [];

  return {
    ...event,
    chunks,
  };
};

export const embedChunks = async (
  event: PipelineEvent,
): Promise<PipelineEvent> => {
  console.log(
    "Step 3: Embedding and indexing chunks - input:",
    JSON.stringify(event, null, 2),
  );

  const chunks = event.chunks || [];
  const fileKey = event.fileKey;
  const userEmail = event.userEmail;

  if (!fileKey || !userEmail) {
    throw new Error("File key or user email not found");
  }

  const records = await generateEmbeddings(chunks, fileKey, userEmail);

  if (records.length > 0) {
    await upsertToPinecone(records, userEmail);
  }

  return {
    Records: event.Records,
    userEmail,
    fileKey,
    indexedCount: records.length,
  };
};

export const indexChunks = async (
  event: PipelineEvent,
): Promise<PipelineEvent> => {
  console.log(
    "Step 4: Indexing step completed - input:",
    JSON.stringify(event, null, 2),
  );

  return {
    ...event,
  };
};

export const updateStatus = async (
  event: PipelineEvent,
): Promise<PipelineEvent> => {
  console.log(
    "Step 5: Updating status - input:",
    JSON.stringify(event, null, 2),
  );

  const userEmail = event.userEmail;
  const fileKey = event.fileKey;
  const status =
    event.status || (event.error ? FileStatus.ERROR : FileStatus.SUCCESS);

  if (!userEmail || !fileKey) {
    throw new Error("User email or file key not found");
  }

  await docClient.send(
    new UpdateCommand({
      TableName: tableName,
      Key: { userEmail },
      UpdateExpression: "SET #status = :status, updatedAt = :updatedAt",
      ExpressionAttributeNames: { "#status": "status" },
      ExpressionAttributeValues: {
        ":status": status,
        ":updatedAt": new Date().toISOString(),
      },
    }),
  );

  const apiUrl = env.API_URL || "http://localhost:3000";
  try {
    await fetch(`${apiUrl}/api/documents/status-webhook`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userEmail,
        fileKey,
        status,
        error: event.error,
      }),
    });
  } catch (err) {
    console.error("Failed to notify backend API via HTTP:", err);
  }

  return {
    ...event,
    status,
  };
};
