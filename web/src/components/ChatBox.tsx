import { useEffect, useRef, type ChangeEvent } from "react";
import { Button, Cursor, Frame, TextArea } from "@react95/core";
import Message from "./Message";
import type { ChatMessage } from "../types/message.type";

interface ChatBoxProps {
  messages: ChatMessage[];
  inputMessage: string;
  canSubmit: boolean;
  onInputChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  onSendMessage: () => void;
}

export default function ChatBox({
  messages,
  inputMessage,
  canSubmit,
  onInputChange,
  onSendMessage,
}: ChatBoxProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <Frame
      w={{
        mobile: "100%",
        tablet: "70%",
        desktop: "70%",
      }}
      padding="$2"
      mb={{
        mobile: "$0",
        tablet: "$0",
      }}
      className="w-full md:w-[70%] flex-none md:flex-1 flex flex-col h-auto md:h-full min-h-0"
    >
      <Frame
        ref={containerRef}
        bgColor="$inputBackground"
        className="max-h-[250px] md:max-h-none min-h-[160px] flex-1 overflow-y-auto p-2 flex flex-col gap-2 mb-2"
      >
        {messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-500 text-xs italic text-center p-4">
            {canSubmit
              ? "Ask a question about your uploaded PDF document!"
              : "Upload a PDF document to start chatting."}
          </div>
        ) : (
          messages.map((message) => (
            <Message
              key={message.id}
              id={message.id}
              text={message.text}
              isUser={message.isUser}
              createdAt={message.createdAt}
            />
          ))
        )}
      </Frame>
      <Frame className="flex gap-2 flex-shrink-0">
        <TextArea
          disabled={!canSubmit}
          value={inputMessage}
          onChange={onInputChange}
          placeholder="Type your question here..."
          rows={2}
          className="w-full resize-none"
        />
        <Button
          onClick={onSendMessage}
          disabled={!canSubmit}
          className={Cursor.Pointer}
        >
          OK
        </Button>
      </Frame>
    </Frame>
  );
}
