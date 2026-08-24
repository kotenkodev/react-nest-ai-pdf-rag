export type ChatMessage = {
  id: string;
  text: string;
  isUser: boolean;
  isError?: boolean;
  createdAt: Date;
};
