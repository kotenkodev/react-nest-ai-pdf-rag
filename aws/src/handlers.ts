import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { S3EventRecord } from "aws-lambda";
import pdfParse from "pdf-parse";
import { DocumentStatus, MAX_FILE_SIZE } from "./constants.js";
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
  textKey?: string;
  chunksKey?: string;
  bucket?: string;
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
  const apiKey = env.JINA_API_KEY;
  if (!apiKey) {
    throw new Error("JINA_API_KEY is missing from environment variables");
  }

  const batchSize = 100;
  const records: Array<{
    id: string;
    values: number[];
    metadata: Record<string, any>;
  }> = [];

  for (let i = 0; i < chunks.length; i += batchSize) {
    const chunkBatch = chunks.slice(i, i + batchSize);

    const res = await fetch("https://api.jina.ai/v1/embeddings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "jina-embeddings-v3",
        task: "retrieval.passage",
        dimensions: 1024,
        input: chunkBatch,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(
        `Jina AI embedding API failed (${res.status}): ${errText}`,
      );
    }

    const data = (await res.json()) as {
      data: Array<{ index: number; embedding: number[] }>;
    };

    if (data?.data) {
      for (const item of data.data) {
        const globalIndex = i + item.index;
        if (item.embedding && item.embedding.length > 0) {
          const safeKey = fileKey.replace(/[^a-zA-Z0-9_.-]/g, "_");
          records.push({
            id: `${safeKey}_chunk_${globalIndex}`,
            values: item.embedding,
            metadata: {
              userEmail,
              fileKey,
              chunkIndex: globalIndex,
              text: chunks[globalIndex],
            },
          });
        }
      }
    }
  }

  return records;
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

    if (key.startsWith("temp_extracted/") || key.startsWith("temp_chunks/")) {
      console.warn(`Skipping text extraction for temporary key: ${key}`);
      return {
        userEmail: event.userEmail || "",
        fileKey: key,
        bucket,
      };
    }

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

    const maxSizeBytes = MAX_FILE_SIZE;
    if (object.ContentLength && object.ContentLength > maxSizeBytes) {
      throw new Error("File size exceeds 10MB limit");
    }

    const pdfBuffer = Buffer.from(await object.Body.transformToByteArray());
    const parseResult = await pdfParse(pdfBuffer);

    if (!parseResult.text || !parseResult.text.trim()) {
      throw new Error(
        "No readable text found in PDF document (may be empty or image-only)",
      );
    }

    const textKey = `temp_extracted/${key}.txt`;
    await s3.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: textKey,
        Body: parseResult.text,
        ContentType: "text/plain; charset=utf-8",
      }),
    );

    return {
      userEmail,
      fileKey: key,
      textKey,
      bucket,
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
    const bucket = event.bucket;
    const textKey = event.textKey;
    const fileKey = event.fileKey;

    if (!bucket || !textKey || !fileKey) {
      throw new Error(
        "Missing S3 bucket, fileKey, or textKey for chunking step",
      );
    }

    const object = await s3.send(
      new GetObjectCommand({
        Bucket: bucket,
        Key: textKey,
      }),
    );

    if (!object.Body) {
      throw new Error("Failed to read extracted text from S3");
    }

    const text = await object.Body.transformToString();
    if (!text || !text.trim()) {
      throw new Error("No readable text found to chunk");
    }

    const chunks = text.match(/[\s\S]{1,1000}(?!\w)/g) || [];
    if (chunks.length === 0) {
      throw new Error("Document content could not be split into valid chunks");
    }

    const chunksKey = `temp_chunks/${fileKey}.json`;
    await s3.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: chunksKey,
        Body: JSON.stringify(chunks),
        ContentType: "application/json",
      }),
    );

    return {
      userEmail: event.userEmail,
      fileKey,
      chunksKey,
      textKey,
      bucket,
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
    const bucket = event.bucket;
    const chunksKey = event.chunksKey;
    const fileKey = event.fileKey;
    const userEmail = event.userEmail;

    if (!fileKey || !userEmail || !chunksKey || !bucket) {
      throw new Error(
        "Document key, user email, bucket, or chunksKey missing for embedding processing",
      );
    }

    const object = await s3.send(
      new GetObjectCommand({
        Bucket: bucket,
        Key: chunksKey,
      }),
    );

    if (!object.Body) {
      throw new Error("Failed to read chunks JSON from S3");
    }

    const chunksJson = await object.Body.transformToString();
    const chunks: string[] = JSON.parse(chunksJson);

    const records = await generateEmbeddings(chunks, fileKey, userEmail);

    if (records.length > 0) {
      await upsertToPinecone(records, userEmail);
    }

    try {
      if (event.textKey) {
        await s3.send(
          new DeleteObjectCommand({ Bucket: bucket, Key: event.textKey }),
        );
      }
      await s3.send(
        new DeleteObjectCommand({ Bucket: bucket, Key: chunksKey }),
      );
    } catch (cleanupErr) {
      console.warn("Failed to clean up temporary S3 files:", cleanupErr);
    }

    return {
      userEmail,
      fileKey,
      indexedCount: records.length,
      bucket,
    };
  } catch (err: any) {
    console.error("processAndIndexChunks step failed:", err);
    throw new Error(
      `Failed to generate AI embeddings or index vector records: ${err.message || err}`,
    );
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

  try {
    await docClient.send(
      new UpdateCommand({
        TableName: tableName,
        Key: { userEmail },
        UpdateExpression: userErrorMessage
          ? "SET #status = :status, errorMessage = :errorMessage"
          : "SET #status = :status",
        ConditionExpression: "attribute_exists(userEmail)",
        ExpressionAttributeNames: { "#status": "status" },
        ExpressionAttributeValues: {
          ":status": status,
          ...(userErrorMessage ? { ":errorMessage": userErrorMessage } : {}),
        },
      }),
    );
  } catch (err: any) {
    if (
      err.name === "ConditionalCheckFailedException" ||
      err.code === "ConditionalCheckFailedException"
    ) {
      console.warn(
        `Skipped updateStatus for user ${userEmail}: Document record was deleted before processing completed.`,
      );
      return {
        ...event,
        userEmail,
        fileKey,
        status: DocumentStatus.ERROR,
        error: "Document record was deleted prior to pipeline completion",
      };
    }
    throw err;
  }

  return {
    ...event,
    userEmail,
    fileKey,
    status,
    ...(userErrorMessage ? { error: userErrorMessage } : {}),
  };
};
