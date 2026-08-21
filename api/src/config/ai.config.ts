import { registerAs, ConfigType } from '@nestjs/config';

export const aiConfig = registerAs('ai', () => ({
  geminiApiKey: process.env.GEMINI_API_KEY ?? '',
}));

export type AIConfig = ConfigType<typeof aiConfig>;
