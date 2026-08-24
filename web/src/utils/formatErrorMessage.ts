export const formatUserFriendlyDocumentError = (
  rawMessage?: string | null,
): string => {
  if (!rawMessage) {
    return "Processing failed. Please try uploading your document again.";
  }

  const msg = rawMessage.toLowerCase();

  if (
    msg.includes("quota") ||
    msg.includes("resource_exhausted") ||
    msg.includes("429")
  ) {
    return "The AI service rate limit was exceeded. Please wait a moment and try uploading again.";
  }
  if (msg.includes("timeout") || msg.includes("timed out")) {
    return "Document processing timed out. Please try uploading a smaller PDF.";
  }
  if (
    msg.includes("empty") ||
    msg.includes("no readable text") ||
    msg.includes("image-only")
  ) {
    return "No readable text found in PDF. Please upload a PDF containing selectable text (scanned image PDFs without OCR are not supported).";
  }
  if (
    msg.includes("embedding") ||
    msg.includes("jina") ||
    msg.includes("vector") ||
    msg.includes("pinecone")
  ) {
    return "Failed to index document content for AI search. Please try re-uploading.";
  }
  if (
    msg.includes("s3") ||
    msg.includes("download") ||
    msg.includes("bucket")
  ) {
    return "Storage access error occurred during processing. Please try re-uploading.";
  }

  if (
    !rawMessage.includes("{") &&
    !rawMessage.includes("at ") &&
    rawMessage.length < 120
  ) {
    return rawMessage;
  }

  return "An unexpected error occurred while processing your PDF. Please try re-uploading.";
};

export const formatErrorMessage = (
  err: any,
  fallbackMessage: string,
): string => {
  if (!err) return fallbackMessage;

  const responseData = err.response?.data;
  if (responseData) {
    if (
      typeof responseData.message === "string" &&
      responseData.message.trim()
    ) {
      return responseData.message;
    }
    if (
      Array.isArray(responseData.message) &&
      responseData.message.length > 0
    ) {
      return responseData.message.join(", ");
    }
    if (typeof responseData.error === "string" && responseData.error.trim()) {
      return responseData.error;
    }
  }

  if (
    err.code === "ERR_NETWORK" ||
    err.message?.toLowerCase().includes("network error")
  ) {
    return "Unable to connect to the server. Please check your internet connection.";
  }
  if (
    err.code === "ECONNABORTED" ||
    err.message?.toLowerCase().includes("timeout")
  ) {
    return "The request timed out. Please try again.";
  }

  const status = err.response?.status;
  if (status === 404) {
    return "The requested document or resource was not found.";
  }
  if (status === 401 || status === 403) {
    return "Session expired or unauthorized. Please sign in again.";
  }
  if (status >= 500) {
    return "Server error occurred. Please try again in a moment.";
  }

  return err.message && !err.message.includes("status code")
    ? err.message
    : fallbackMessage;
};
