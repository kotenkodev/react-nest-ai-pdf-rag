import { Module } from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { DocumentsController } from './documents.controller';
import { DocumentRepository } from './documents.repository';
import { DynamodbModule } from 'src/infrastructure/dynamodb/dynamodb.module';
import { S3Module } from 'src/infrastructure/s3/s3.module';
import { PineconeModule } from 'src/infrastructure/pinecone/pinecone.module';

@Module({
  imports: [DynamodbModule, S3Module, PineconeModule],
  providers: [DocumentsService, DocumentRepository],
  controllers: [DocumentsController],
  exports: [DocumentsService, DocumentRepository],
})
export class DocumentsModule {}
