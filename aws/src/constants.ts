export const MAX_FILE_SIZE = 10 * 1024 * 1024;
export const ALLOWED_FILE_TYPES = ['.pdf'];

export enum FileStatus {
  PENDING = 'pending',
  SUCCESS = 'success',
  ERROR = 'error',
}

export type DocumentEntity = {
  userEmail: string;
  fileName: string;
  fileStorageKey: string;
  status: FileStatus;
  errorMessage?: string;
  createdAt: Date;
};
