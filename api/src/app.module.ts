import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GlobalExceptionFilter } from './shared/filters/http-exception.filter';
import { appConfig } from './config/app.config';
import { awsConfig } from './config/aws.config';
import { pineconeConfig } from './config/pinecone.config';
import { aiConfig } from './config/ai.config';
import { appConfigSchema } from './config/config.types';
import { DocumentsModule } from './modules/documents/documents.module';
import { ChatModule } from './modules/chat/chat.module';
import { AiModule } from './infrastructure/ai/ai.module';
import { PineconeModule } from './infrastructure/pinecone/pinecone.module';
import { DynamodbModule } from './infrastructure/dynamodb/dynamodb.module';
import { S3Module } from './infrastructure/s3/s3.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, awsConfig, pineconeConfig, aiConfig],
      validationSchema: appConfigSchema,
    }),
    DocumentsModule,
    ChatModule,
    AiModule,
    PineconeModule,
    DynamodbModule,
    S3Module,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
  ],
})
export class AppModule {}
