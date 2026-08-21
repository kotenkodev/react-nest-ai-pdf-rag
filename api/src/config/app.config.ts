import { registerAs, ConfigType } from '@nestjs/config';

export const appConfig = registerAs('app', () => ({
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: parseInt(process.env.PORT ?? '3000', 10),
  cors: process.env.CORS ?? '',
}));

export type AppConfig = ConfigType<typeof appConfig>;
