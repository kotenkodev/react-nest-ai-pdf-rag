import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { AiModule } from 'src/infrastructure/ai/ai.module';
import { PineconeModule } from 'src/infrastructure/pinecone/pinecone.module';
import { DocumentsModule } from 'src/modules/documents/documents.module';

@Module({
  providers: [ChatService],
  controllers: [ChatController],
  imports: [AiModule, PineconeModule, DocumentsModule],
})
export class ChatModule {}
