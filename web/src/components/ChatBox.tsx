import { useEffect, useRef, type ChangeEvent, type KeyboardEvent } from "react";
import { Button, Cursor, Frame, TextArea } from "@react95/core";
import { Qfecheck111 } from "@react95/icons";
import Message from "./Message";
import type { ChatMessage } from "../types/message.type";

interface ChatBoxProps {
  messages: ChatMessage[];
  inputMessage: string;
  canSubmit: boolean;
  isAsking?: boolean;
  onInputChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  onSendMessage: () => void;
}

export default function ChatBox({
  messages,
  inputMessage,
  canSubmit,
  isAsking = false,
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
  }, [messages, isAsking]);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (canSubmit && !isAsking && inputMessage.trim()) {
        onSendMessage();
      }
    }
  };

  const isLocked = !canSubmit || isAsking;

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
        {messages.length === 0 && !isAsking ? (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-500 text-xs italic text-center p-4">
            {canSubmit
              ? "Ask a question about your uploaded PDF document!"
              : "Upload a PDF document to start chatting."}
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <Message
                key={message.id}
                id={message.id}
                text={message.text}
                isUser={message.isUser}
                isError={message.isError}
                createdAt={message.createdAt}
              />
            ))}
            {isAsking && (
              <Frame className="p-3 text-xs border shadow-sm max-w-[85%] bg-[#d8d8d8] border-[#999999] self-start mr-auto animate-pulse">
                <div className="flex items-center gap-2 font-bold text-[#000080]">
                  <Qfecheck111
                    variant="32x32_4"
                    className="-mr-0.5 flex-shrink-0 animate-spin"
                  />
                  <span className="flex items-center gap-1">
                    AI Assistant is thinking
                    <span className="inline-flex">...</span>
                  </span>
                </div>
              </Frame>
            )}
          </>
        )}
      </Frame>
      <Frame className="flex gap-2 flex-shrink-0">
        <TextArea
          disabled={isLocked}
          value={inputMessage}
          onChange={onInputChange}
          onKeyDown={handleKeyDown}
          placeholder={
            isAsking
              ? "AI is thinking..."
              : canSubmit
                ? "Type your question here (Press Enter to send)..."
                : "Upload a PDF to type a question..."
          }
          rows={2}
          className="w-full resize-none"
        />
        <Button
          onClick={onSendMessage}
          disabled={isLocked || !inputMessage.trim()}
          className={Cursor.Pointer}
        >
          {isAsking ? "..." : "OK"}
        </Button>
      </Frame>
    </Frame>
  );
}
