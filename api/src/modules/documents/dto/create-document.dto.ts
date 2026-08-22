import {
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsString,
  Max,
  MaxLength,
  Min,
  Matches,
} from 'class-validator';
import {
  ALLOWED_DOCUMENT_MIME_TYPES,
  type AllowedDocumentMimeType,
  MAX_DOCUMENT_SIZE,
} from 'src/common/constants';

export class CreateDocumentDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  @Matches(/\.(pdf)$/i, {
    message: 'File name must end with .pdf',
  })
  userFilename: string;

  @IsNotEmpty()
  @IsIn([...ALLOWED_DOCUMENT_MIME_TYPES], {
    message: 'Invalid mimeType. Only PDF files are allowed',
  })
  mimeType: AllowedDocumentMimeType;

  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  @Max(MAX_DOCUMENT_SIZE, {
    message: `File size must not exceed ${MAX_DOCUMENT_SIZE / (1024 * 1024)}MB`,
  })
  size: number;
}
