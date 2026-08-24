import { z } from "zod";

const envSchema = z.object({
  GEMINI_API_KEY: z.string().optional().default(""),
  PINECONE_API_KEY: z.string().optional().default(""),
  PINECONE_INDEX: z.string().default("pdf-documents"),
  JINA_API_KEY: z.string().optional().default(""),
  DOCUMENTS_TABLE: z.string().default("UserDocuments"),
  AWS_REGION: z.string().default("us-east-1"),
});

export const env = envSchema.parse(process.env);
