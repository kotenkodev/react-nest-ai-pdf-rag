import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { S3Event, S3EventRecord } from "aws-lambda";
import pdfParse from "pdf-parse";
import { FileStatus } from "./constants";

const s3 = new S3Client({});

export interface PipelineEvent {
  Records: S3EventRecord[];

  text?: string;

  chunks?: string[];

  embeddings?: Array<{
    id: string;
    values: number[];
    metadata: Record<string, any>;
  }>;

  indexedCount?: number;

  status?: FileStatus;
  error?: any;
}

export const extractText = async (
  event: PipelineEvent,
): Promise<PipelineEvent> => {
  const s3 = new S3Client();

  const bucket = event.Records[0].s3.bucket.name;
  const key = event.Records[0].s3.object.key;

  const getObjectParams = {
    Bucket: bucket,
    Key: key,
  };

  const object = await s3.send(new GetObjectCommand(getObjectParams));

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
  };
};

export const chunkText = async (
  event: PipelineEvent,
): Promise<PipelineEvent> => {
  console.log("Step 2: Chunking text - input:", JSON.stringify(event, null, 2));

  const text = event.text;

  const chunkSize = 500;
  const chunks: string[] = [];
  if (text) {
    for (let i = 0; i < text.length; i += chunkSize) {
      chunks.push(text.slice(i, i + chunkSize));
    }
  }

  return {
    ...event,
    chunks,
  };
};

export const embedChunks = async (
  event: PipelineEvent,
): Promise<PipelineEvent> => {
  console.log(
    "Step 3: Embedding chunks - input:",
    JSON.stringify(event, null, 2),
  );

  return {
    ...event,
    embeddingsCount: event.chunks?.length || 0,
  };
};

export const indexChunks = async (
  event: PipelineEvent,
): Promise<PipelineEvent> => {
  console.log(
    "Step 4: Indexing chunks - input:",
    JSON.stringify(event, null, 2),
  );

  return {
    ...event,
    indexedCount: event.embeddingsCount || 0,
  };
};

export const updateStatus = async (
  event: PipelineEvent,
): Promise<PipelineEvent> => {
  console.log(
    "Step 5: Updating status - input:",
    JSON.stringify(event, null, 2),
  );

  return {
    ...event,
    message: "PDF Processing Pipeline completed successfully",
  };
};
