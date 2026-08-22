import { IsEnum, IsOptional, IsString } from 'class-validator';
import { DocumentStatus } from '../entities/document.entity';

export class SetDocumentStatusDto {
  @IsString()
  userEmail: string;

  @IsEnum(DocumentStatus)
  status: DocumentStatus;

  @IsOptional()
  @IsString()
  errorMessage?: string;
}
