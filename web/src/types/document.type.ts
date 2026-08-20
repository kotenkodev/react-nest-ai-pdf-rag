export type DocumentStatus = "pending" | "success" | "error";

export type DocumentItem = {
  userEmail: string;
  fileName: string;
  fileStorageKey: string;
  status: DocumentStatus;
  errorMessage?: string;
  createdAt: Date;
};
