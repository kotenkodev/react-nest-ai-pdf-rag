import { Injectable } from '@nestjs/common';
import { GoogleGenAI } from '@google/genai';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AiService {
  private readonly genAI: GoogleGenAI;

  private readonly jinaApiKey: string;

  constructor(private readonly configService: ConfigService) {
    this.genAI = new GoogleGenAI({
      apiKey: configService.get<string>('GEMINI_API_KEY'),
    });
    this.jinaApiKey = configService.get<string>('JINA_API_KEY', '');
  }

  async generateEmbeddings(chunks: string[]) {
    const res = await fetch('https://api.jina.ai/v1/embeddings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.jinaApiKey}`,
      },
      body: JSON.stringify({
        model: 'jina-embeddings-v3',
        task: 'retrieval.query',
        dimensions: 1024,
        input: chunks,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(
        `Jina AI embeddings request failed (${res.status}): ${errText}`,
      );
    }

    const data = (await res.json()) as {
      data: Array<{ embedding: number[] }>;
    };

    const embedding = data?.data?.[0]?.embedding;
    if (!embedding || embedding.length === 0) {
      throw new Error('Jina AI returned an empty or invalid embedding vector');
    }

    return embedding;
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
