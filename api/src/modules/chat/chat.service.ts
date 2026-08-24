import { Injectable, BadRequestException } from '@nestjs/common';
import { AiService } from 'src/infrastructure/ai/ai.service';
import { PineconeService } from 'src/infrastructure/pinecone/pinecone.service';
import { DocumentsService } from 'src/modules/documents/documents.service';
import { DocumentStatus } from 'src/modules/documents/entities/document.entity';

@Injectable()
export class ChatService {
  constructor(
    private readonly aiService: AiService,
    private readonly pineconeService: PineconeService,
    private readonly documentsService: DocumentsService,
  ) {}

  async answerQuestion(userEmail: string, data: { question: string }) {
    const document = await this.documentsService.getDocumentByEmail(userEmail);

    if (document.status !== DocumentStatus.SUCCESS) {
      throw new BadRequestException(
        'Document is not ready for chat processing',
      );
    }

    const embedding = await this.aiService.generateEmbeddings([data.question]);

    const matches = await this.pineconeService.querySimilarChunks(
      embedding,
      userEmail,
    );

    const texts = matches.map((match) => match.text);

    const response = await this.aiService.generateResponse(
      data.question,
      texts,
    );

    return { answer: response };
  }
}
