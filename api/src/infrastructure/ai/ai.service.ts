import { Injectable } from '@nestjs/common';
import { GoogleGenAI } from '@google/genai';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AiService {
  private readonly genAI: GoogleGenAI;

  constructor(configService: ConfigService) {
    this.genAI = new GoogleGenAI({
      apiKey: configService.get<string>('GEMINI_API_KEY'),
    });
  }

  async generateEmbeddings(chunks: string[]) {
    const response = await this.genAI.models.embedContent({
      model: 'gemini-embedding-001',
      contents: chunks,
      config: {
        outputDimensionality: 1024,
      },
    });

    return response.embeddings?.[0]?.values ?? [];
  }

  async generateResponse(query: string, context: string[]) {
    const result = await this.genAI.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: [
        { role: 'user', parts: [{ text: context.join('\n\n') }] },
        {
          role: 'model',
          parts: [
            {
              text: `You are a friendly, cheerful Clippy-style document assistant.
                Be concise, helpful, and slightly playful.
                Answer the user's question using only the provided document context.
                If the answer isn't in the context, say you couldn't find it.`,
            },
          ],
        },
        { role: 'user', parts: [{ text: query }] },
      ],
    });

    return result.text;
  }
}
