import { z } from "zod";

const envSchema = z.object({
  GEMINI_API_KEY: z.string().optional().default(""),
  PINECONE_API_KEY: z.string().optional().default(""),
  PINECONE_INDEX: z.string().default("pdf-documents"),
  DOCUMENTS_TABLE: z.string().default("UserDocuments"),
  API_URL: z.string().url().default("http://localhost:3000"),
  AWS_REGION: z.string().default("us-east-1"),
});

export const env = envSchema.parse(process.env);
