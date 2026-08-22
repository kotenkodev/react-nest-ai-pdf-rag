export const MAX_DOCUMENT_SIZE = 10 * 1024 * 1024;

export const ALLOWED_DOCUMENT_EXTENSIONS = ['.pdf'] as const;
export type AllowedDocumentExtension =
  (typeof ALLOWED_DOCUMENT_EXTENSIONS)[number];

export const ALLOWED_DOCUMENT_MIME_TYPES = ['application/pdf'] as const;

export type AllowedDocumentMimeType =
  (typeof ALLOWED_DOCUMENT_MIME_TYPES)[number];

export const DOCUMENT_EXTENSION_TO_MIME: Record<
  AllowedDocumentExtension,
  AllowedDocumentMimeType
> = {
  '.pdf': 'application/pdf',
};
