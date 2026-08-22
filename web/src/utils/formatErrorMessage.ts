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
    return "Unable to connect to the server. Please check your connection.";
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
