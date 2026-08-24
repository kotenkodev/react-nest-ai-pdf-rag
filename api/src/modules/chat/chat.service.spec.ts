import { Test, TestingModule } from '@nestjs/testing';
import { ChatService } from './chat.service';
import { AiService } from 'src/infrastructure/ai/ai.service';
import { PineconeService } from 'src/infrastructure/pinecone/pinecone.service';
import { DocumentsService } from 'src/modules/documents/documents.service';

describe('ChatService', () => {
  let service: ChatService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatService,
        { provide: AiService, useValue: {} },
        { provide: PineconeService, useValue: {} },
        { provide: DocumentsService, useValue: {} },
      ],
    }).compile();

    service = module.get<ChatService>(ChatService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
