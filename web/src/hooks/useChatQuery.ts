import { useMutation } from "@tanstack/react-query";
import { ask } from "../services/chatService";

export const useAskChat = () => {
  return useMutation({
    mutationFn: (question: string) => ask(question),
  });
};
