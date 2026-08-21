import { apiClient } from "./apiClient";

export const ask = async (question: string) => {
  const response = await apiClient.post("/chat", { question });

  return response.data;
};
