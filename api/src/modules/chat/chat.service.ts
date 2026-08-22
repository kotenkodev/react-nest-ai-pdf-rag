import { Injectable } from '@nestjs/common';
import { AiService } from 'src/infrastructure/ai/ai.service';
import { PineconeService } from 'src/infrastructure/pinecone/pinecone.service';

@Injectable()
export class ChatService {
  constructor(
    private readonly aiService: AiService,
    private readonly pineconeService: PineconeService,
  ) {}

  async answerQuestion(userEmail: string, data: { question: string }) {
    const embedding = await this.aiService.generateEmbeddings([data.question]);

    const matches = await this.pineconeService.querySimilarChunks(
      embedding,
      userEmail,
    );

    const texts = matches.map((match) => match.text);

    console.log(texts);

    const response = await this.aiService.generateResponse(
      data.question,
      texts,
    );

    return { answer: response };
  }
}
