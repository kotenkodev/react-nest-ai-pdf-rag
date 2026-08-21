import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Pinecone, RecordMetadata } from '@pinecone-database/pinecone';

export interface ChunkMetadata extends RecordMetadata {
  userEmail: string;
  text: string;
  chunkIndex: number;
}

export interface QueryMatch {
  id: string;
  score?: number;
  text: string;
}

@Injectable()
export class PineconeService {
  private readonly logger = new Logger(PineconeService.name);
  private readonly index: ReturnType<Pinecone['Index']>;

  constructor(private readonly configService: ConfigService) {
    const pinecone = new Pinecone({
      apiKey: this.configService.get<string>('PINECONE_API_KEY', ''),
    });

    this.index = pinecone.Index({
      name: this.configService.get<string>('PINECONE_INDEX', 'rag-index'),
    });
  }

  async querySimilarChunks(
    embedding: number[],
    userEmail: string,
    topK: number = 5,
  ): Promise<QueryMatch[]> {
    try {
      const response = await this.index.namespace(userEmail).query({
        vector: embedding,
        topK,
        includeMetadata: true,
      });

      return (response.matches || []).map((match) => ({
        id: match.id,
        score: match.score,
        text: (match.metadata as ChunkMetadata)?.text ?? '',
      }));
    } catch (error) {
      this.logger.error(`Error querying vectors for user ${userEmail}:`, error);
      throw error;
    }
  }

  async deleteByUserEmail(userEmail: string): Promise<void> {
    try {
      await this.index.namespace(userEmail).deleteAll();
      this.logger.log(`Deleted all vectors for user ${userEmail}`);
    } catch (error) {
      this.logger.error(`Error deleting vectors for user ${userEmail}:`, error);
      throw error;
    }
  }
}
