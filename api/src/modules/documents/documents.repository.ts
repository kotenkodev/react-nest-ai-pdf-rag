import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DynamodbService } from 'src/infrastructure/dynamodb/dynamodb.service';
import { DocumentEntity, DocumentStatus } from './entities/document.entity';

@Injectable()
export class DocumentRepository {
  private readonly logger = new Logger(DocumentRepository.name);
  private readonly tableName: string;

  constructor(
    private readonly dynamodbService: DynamodbService,
    private readonly configService: ConfigService,
  ) {
    this.tableName = this.configService.get<string>('TABLE_NAME', 'documents');
  }

  async getByEmail(userEmail: string): Promise<DocumentEntity | null> {
    return this.dynamodbService.get<DocumentEntity>(this.tableName, {
      userEmail,
    });
  }

  async create(
    documentData: Omit<DocumentEntity, 'createdAt' | 'status'> & {
      status?: DocumentStatus;
    },
  ): Promise<DocumentEntity> {
    const document: DocumentEntity = {
      userEmail: documentData.userEmail,
      fileName: documentData.fileName,
      fileStorageKey: documentData.fileStorageKey,
      status: documentData.status ?? DocumentStatus.PENDING,
      errorMessage: documentData.errorMessage,
      createdAt: new Date().toISOString(),
    };

    return this.dynamodbService.put<DocumentEntity>(this.tableName, document);
  }

  async setStatus(
    userEmail: string,
    status: DocumentStatus,
    errorMessage?: string,
  ): Promise<DocumentEntity | null> {
    return this.dynamodbService.update<DocumentEntity>(
      this.tableName,
      { userEmail },
      'SET #status = :status, #errorMessage = :errorMessage',
      {
        '#status': 'status',
        '#errorMessage': 'errorMessage',
      },
      {
        ':status': status,
        ':errorMessage': errorMessage ?? null,
      },
    );
  }

  async delete(userEmail: string): Promise<void> {
    await this.dynamodbService.delete(this.tableName, { userEmail });
  }
}
