import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  UpdateCommand,
  DeleteCommand,
  QueryCommand,
} from '@aws-sdk/lib-dynamodb';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class DynamodbService implements OnModuleDestroy {
  private readonly logger = new Logger(DynamodbService.name);
  private readonly rawClient: DynamoDBClient;
  public readonly docClient: DynamoDBDocumentClient;

  constructor(private readonly configService: ConfigService) {
    const region = this.configService.get<string>('AWS_REGION', 'us-east-1');
    const endpoint = this.configService.get<string>('DYNAMODB_ENDPOINT');
    const accessKeyId = this.configService.get<string>('AWS_ACCESS_KEY_ID');
    const secretAccessKey = this.configService.get<string>(
      'AWS_SECRET_ACCESS_KEY',
    );

    this.rawClient = new DynamoDBClient({
      region,
      ...(endpoint ? { endpoint } : {}),
      ...(accessKeyId && secretAccessKey
        ? { credentials: { accessKeyId, secretAccessKey } }
        : {}),
    });

    this.docClient = DynamoDBDocumentClient.from(this.rawClient, {
      marshallOptions: {
        removeUndefinedValues: true,
        convertEmptyValues: true,
      },
      unmarshallOptions: {
        wrapNumbers: false,
      },
    });
  }

  onModuleDestroy() {
    this.docClient.destroy();
    this.rawClient.destroy();
  }

  async get<T>(tableName: string, key: Record<string, any>): Promise<T | null> {
    try {
      const result = await this.docClient.send(
        new GetCommand({ TableName: tableName, Key: key }),
      );
      return (result.Item as T) || null;
    } catch (error) {
      this.logger.error(`Error fetching item from ${tableName}:`, error);
      throw error;
    }
  }

  async put<T extends Record<string, any>>(
    tableName: string,
    item: T,
  ): Promise<T> {
    try {
      await this.docClient.send(
        new PutCommand({ TableName: tableName, Item: item }),
      );
      return item;
    } catch (error) {
      this.logger.error(`Error putting item into ${tableName}:`, error);
      throw error;
    }
  }

  async update<T>(
    tableName: string,
    key: Record<string, any>,
    updateExpression: string,
    expressionAttributeNames?: Record<string, string>,
    expressionAttributeValues?: Record<string, any>,
  ): Promise<T | null> {
    try {
      const result = await this.docClient.send(
        new UpdateCommand({
          TableName: tableName,
          Key: key,
          UpdateExpression: updateExpression,
          ExpressionAttributeNames: expressionAttributeNames,
          ExpressionAttributeValues: expressionAttributeValues,
          ReturnValues: 'ALL_NEW',
        }),
      );
      return (result.Attributes as T) || null;
    } catch (error) {
      this.logger.error(`Error updating item in ${tableName}:`, error);
      throw error;
    }
  }

  async delete(tableName: string, key: Record<string, any>): Promise<void> {
    try {
      await this.docClient.send(
        new DeleteCommand({ TableName: tableName, Key: key }),
      );
    } catch (error) {
      this.logger.error(`Error deleting item from ${tableName}:`, error);
      throw error;
    }
  }

  async query<T>(
    tableName: string,
    keyConditionExpression: string,
    expressionAttributeValues: Record<string, any>,
    expressionAttributeNames?: Record<string, string>,
    indexName?: string,
  ): Promise<T[]> {
    try {
      const result = await this.docClient.send(
        new QueryCommand({
          TableName: tableName,
          KeyConditionExpression: keyConditionExpression,
          ExpressionAttributeValues: expressionAttributeValues,
          ExpressionAttributeNames: expressionAttributeNames,
          IndexName: indexName,
        }),
      );
      return (result.Items as T[]) || [];
    } catch (error) {
      this.logger.error(`Error querying ${tableName}:`, error);
      throw error;
    }
  }
}
