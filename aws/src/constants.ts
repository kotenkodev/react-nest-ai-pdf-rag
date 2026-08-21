export const MAX_FILE_SIZE = 10 * 1024 * 1024;
export const ALLOWED_FILE_TYPES = [".pdf"];

export enum DocumentStatus {
  PENDING = "pending",
  SUCCESS = "success",
  ERROR = "error",
}

export type DocumentEntity = {
  userEmail: string;
  fileName: string;
  fileStorageKey: string;
  status: DocumentStatus;
  errorMessage?: string;
  createdAt: Date;
};
