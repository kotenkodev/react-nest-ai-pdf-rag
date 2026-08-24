import { Test, TestingModule } from '@nestjs/testing';
import { DocumentsService } from './documents.service';
import { S3Service } from 'src/infrastructure/s3/s3.service';
import { PineconeService } from 'src/infrastructure/pinecone/pinecone.service';
import { DocumentRepository } from './documents.repository';

describe('DocumentsService', () => {
  let service: DocumentsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DocumentsService,
        { provide: S3Service, useValue: {} },
        { provide: PineconeService, useValue: {} },
        { provide: DocumentRepository, useValue: {} },
      ],
    }).compile();

    service = module.get<DocumentsService>(DocumentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
