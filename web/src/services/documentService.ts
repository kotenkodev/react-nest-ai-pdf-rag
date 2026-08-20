import axios from "axios";
import type { DocumentItem } from "../types/document.type";
import { apiClient } from "./apiClient";

export const getDocument = (): Promise<DocumentItem> => {
  return apiClient.get("/document");
};

export const initiateDocumentUpload = async (
  file: File,
  mimeType: string,
): Promise<{ document: DocumentItem; presignedPostUrl: string }> => {
  const response = await apiClient.post<{
    document: DocumentItem;
    presignedPostUrl: string;
  }>("/document", {
    userFilename: file.name,
    size: file.size,
    mimeType,
  });
  return response.data;
};

export const uploadFileToS3 = async (
  presignedUrl: string,
  file: File,
  mimeType: string,
  onProgress?: (percent: number) => void,
): Promise<void> => {
  const response = await axios.put(presignedUrl, file, {
    headers: {
      "Content-Type": mimeType,
    },
    onUploadProgress: (progressEvent) => {
      if (progressEvent.total && onProgress) {
        const percent = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total,
        );
        onProgress(percent);
      }
    },
  });

  if (response.status < 200 || response.status >= 300) {
    throw new Error(`S3 upload failed with status: ${response.status}`);
  }
};

export const uploadDocument = async (
  file: File,
  onProgress?: (percent: number) => void,
): Promise<DocumentItem> => {
  const mimeType = getMimeType(file);

  const { document, presignedPostUrl } = await initiateDocumentUpload(
    file,
    mimeType,
  );

  await uploadFileToS3(presignedPostUrl, file, mimeType, onProgress);
  return document;
};

export const getDocumentDownloadUrl = async (): Promise<string> => {
  const response = await apiClient.get<{ downloadUrl: string }>(
    `/document/download`,
  );
  return response.data.downloadUrl;
};

export const downloadDocumentFile = async (userFilename: string) => {
  const downloadUrl = await getDocumentDownloadUrl();
  const link = document.createElement("a");
  link.href = downloadUrl;
  link.download = userFilename;
  document.body.appendChild(link);
  link.click();
  link.remove();
};

export const deleteDocument = () => {
  return apiClient.delete(`/document`);
};
