import { registerAs, ConfigType } from '@nestjs/config';

export const pineconeConfig = registerAs('pinecone', () => ({
  apiKey: process.env.PINECONE_API_KEY ?? '',
  index: process.env.PINECONE_INDEX ?? '',
}));

export type PineconeConfig = ConfigType<typeof pineconeConfig>;
