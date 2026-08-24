import * as Joi from 'joi';
import { AWSConfig } from './aws.config';
import { AppConfig } from './app.config';
import { PineconeConfig } from './pinecone.config';
import { AIConfig } from './ai.config';

export interface ConfigType {
  app: AppConfig;
  aws: AWSConfig;
  pinecone: PineconeConfig;
  ai: AIConfig;
}

export const appConfigSchema: Joi.ObjectSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test', 'provision')
    .default('development'),

  AWS_BUCKET_NAME: Joi.string().required(),
  AWS_REGION: Joi.string().required(),
  AWS_ACCESS_KEY_ID: Joi.string().optional().allow(''),
  AWS_SECRET_ACCESS_KEY: Joi.string().optional().allow(''),

  TABLE_NAME: Joi.string().required(),

  PINECONE_API_KEY: Joi.string().required(),
  PINECONE_INDEX: Joi.string().required(),

  GEMINI_API_KEY: Joi.string().required(),
  JINA_API_KEY: Joi.string().required(),
});
