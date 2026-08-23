import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { S3EventRecord } from "aws-lambda";
import pdfParse from "pdf-parse";
import { DocumentStatus } from "./constants.js";
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
  Records?: S3EventRecord[];
  userEmail?: string;
  fileKey?: string;
  text?: string;
  chunks?: string[];
  indexedCount?: number;
  status?: DocumentStatus;
  error?: any;
  data?: any;
}

function safeJsonParse(val: any) {
  if (typeof val !== "string") return val;
  try {
    return JSON.parse(val);
  } catch {
    return val;
  }
}

function extractErrorMessage(rawError: any): string | undefined {
  if (!rawError) return undefined;
  const parsed = safeJsonParse(rawError.Cause || rawError);
  return (
    parsed?.errorMessage ||
    parsed?.message ||
    parsed?.Error ||
    (typeof parsed === "string" ? parsed : JSON.stringify(parsed))
  );
}

async function generateEmbeddings(
  chunks: string[],
  fileKey: string,
  userEmail: string,
) {
  const response = await ai.models.embedContent({
    model: "gemini-embedding-001",
    contents: chunks,
    config: {
      outputDimensionality: 1024,
    },
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
  console.log(
    "Step 1: Extracting text - input:",
    JSON.stringify(event, null, 2),
  );

  try {
    const eventDetail = (event as any).detail;
    const s3Record = event.Records?.[0]?.s3;

    const bucket = eventDetail?.bucket?.name || s3Record?.bucket?.name;
    const rawKey = eventDetail?.object?.key || s3Record?.object?.key;

    if (!bucket || !rawKey) {
      throw new Error(
        "Invalid S3 event payload: bucket name or object key missing",
      );
    }

    const key = decodeURIComponent(rawKey.replace(/\+/g, " "));

    const keyParts = key.split("/");
    const userEmail =
      event.userEmail || (keyParts.length > 2 ? keyParts[1] : keyParts[0]);

    const object = await s3.send(
      new GetObjectCommand({
        Bucket: bucket,
        Key: key,
      }),
    );

    if (!object.Body) {
      throw new Error("Failed to download PDF object from S3");
    }

    const pdfBuffer = Buffer.from(await object.Body.transformToByteArray());
    const parseResult = await pdfParse(pdfBuffer);

    if (!parseResult.text || !parseResult.text.trim()) {
      throw new Error(
        "No readable text found in PDF document (may be empty or image-only)",
      );
    }

    return {
      ...event,
      text: parseResult.text,
      userEmail,
      fileKey: key,
    };
  } catch (err: any) {
    console.error("extractText step failed:", err);
    throw new Error(
      err.message && !err.message.includes("at ")
        ? err.message
        : "Failed to extract text from PDF document",
    );
  }
};

export const chunkText = async (
  event: PipelineEvent,
): Promise<PipelineEvent> => {
  console.log("Step 2: Chunking text - input:", JSON.stringify(event, null, 2));

  try {
    const text = event.text;
    if (!text || !text.trim()) {
      throw new Error("No readable text found to chunk");
    }

    const chunks = text.match(/[\s\S]{1,500}(?!\w)/g) || [];
    if (chunks.length === 0) {
      throw new Error("Document content could not be split into valid chunks");
    }

    return {
      ...event,
      chunks,
    };
  } catch (err: any) {
    console.error("chunkText step failed:", err);
    throw new Error(err.message || "Failed to split document into text chunks");
  }
};

export const processAndIndexChunks = async (
  event: PipelineEvent,
): Promise<PipelineEvent> => {
  console.log(
    "Step 3: Embedding chunks - input:",
    JSON.stringify(event, null, 2),
  );

  try {
    const chunks = event.chunks || [];
    const fileKey = event.fileKey;
    const userEmail = event.userEmail;

    if (!fileKey || !userEmail) {
      throw new Error(
        "Document key or user email missing for embedding processing",
      );
    }

    const records = await generateEmbeddings(chunks, fileKey, userEmail);

    if (records.length > 0) {
      await upsertToPinecone(records, userEmail);
    }

    return {
      ...event,
      userEmail,
      fileKey,
      indexedCount: records.length,
    };
  } catch (err: any) {
    console.error("processAndIndexChunks step failed:", err);
    throw new Error("Failed to generate AI embeddings or index vector records");
  }
};

export const updateStatus = async (
  event: PipelineEvent,
): Promise<PipelineEvent> => {
  console.log(
    "Step 5: Updating status - input:",
    JSON.stringify(event, null, 2),
  );

  const data = event.data || event;
  const eventDetail = (data as any).detail || (event as any).detail;

  const rawS3Key =
    eventDetail?.object?.key || data.Records?.[0]?.s3?.object?.key;

  const s3Key = rawS3Key
    ? decodeURIComponent(rawS3Key.replace(/\+/g, " "))
    : undefined;
  const s3Email = s3Key
    ? s3Key.split("/").length > 2
      ? s3Key.split("/")[1]
      : s3Key.split("/")[0]
    : undefined;

  const userEmail = event.userEmail || data.userEmail || s3Email;
  const fileKey = event.fileKey || data.fileKey || s3Key;

  if (!userEmail) {
    throw new Error("User email could not be resolved in updateStatus payload");
  }

  const rawError = event.error || data.error;
  const status =
    event.status || (rawError ? DocumentStatus.ERROR : DocumentStatus.SUCCESS);

  const userErrorMessage = extractErrorMessage(rawError);

  await docClient.send(
    new UpdateCommand({
      TableName: tableName,
      Key: { userEmail },
      UpdateExpression: userErrorMessage
        ? "SET #status = :status, errorMessage = :errorMessage"
        : "SET #status = :status",
      ExpressionAttributeNames: { "#status": "status" },
      ExpressionAttributeValues: {
        ":status": status,
        ...(userErrorMessage ? { ":errorMessage": userErrorMessage } : {}),
      },
    }),
  );

  return {
    ...event,
    userEmail,
    fileKey,
    status,
    ...(userErrorMessage ? { error: userErrorMessage } : {}),
  };
};
