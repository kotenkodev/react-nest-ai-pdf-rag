import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { S3Service } from 'src/infrastructure/s3/s3.service';
import { PineconeService } from 'src/infrastructure/pinecone/pinecone.service';
import { DocumentRepository } from './documents.repository';
import { CreateDocumentDto } from './dto/create-document.dto';
import { DocumentEntity, DocumentStatus } from './entities/document.entity';

@Injectable()
export class DocumentsService {
  constructor(
    private readonly s3Service: S3Service,
    private readonly pineconeService: PineconeService,
    private readonly repository: DocumentRepository,
  ) {}

  async getDocumentByEmail(email: string): Promise<DocumentEntity> {
    const document = await this.repository.getByEmail(email);

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    return document;
  }

  async getDocumentStatus(email: string): Promise<{
    status: DocumentStatus;
    errorMessage?: string | null;
  }> {
    const document = await this.getDocumentByEmail(email);

    return {
      status: document.status,
      errorMessage: document.errorMessage,
    };
  }

  async createDocument(email: string, data: CreateDocumentDto) {
    const existingDocument = await this.repository.getByEmail(email);

    if (existingDocument) {
      throw new BadRequestException(
        'Document already exists. Please delete existing document first.',
      );
    }

    const objectKey = `documents/${email}/document.pdf`;

    const presignedPostUrl = await this.s3Service.getPresignedUploadUrl(
      objectKey,
      data.mimeType,
      data.size,
    );

    const document = await this.repository.create({
      userEmail: email,
      fileName: data.userFilename,
      fileStorageKey: objectKey,
      status: DocumentStatus.PENDING,
    });

    return {
      presignedPostUrl,
      document,
    };
  }

  async getDownloadUrl(email: string) {
    const document = await this.getDocumentByEmail(email);
    return await this.s3Service.getDownloadUrl(
      document.fileStorageKey,
      document.fileName,
    );
  }

  async deleteDocument(email: string): Promise<boolean> {
    const document = await this.getDocumentByEmail(email);

    try {
      await this.pineconeService.deleteByUserEmail(email);
      await this.s3Service.deleteObject(document.fileStorageKey);
      await this.repository.delete(email);

      return true;
    } catch (error) {
      console.error('Failed to delete document', error);

      throw new InternalServerErrorException(
        `Failed to delete document: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
}
