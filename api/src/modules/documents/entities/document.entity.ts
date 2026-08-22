export enum DocumentStatus {
  PENDING = 'pending',
  SUCCESS = 'success',
  ERROR = 'error',
}

export interface DocumentEntity {
  userEmail: string;
  fileName: string;
  fileStorageKey: string;
  status: DocumentStatus;
  errorMessage?: string;
  createdAt: string;
}
