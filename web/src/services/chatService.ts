import { apiClient } from "./apiClient";

export const ask = (question: string) => {
  return apiClient.post("/chat/ask", question);
};
