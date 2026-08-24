import { Frame } from "@react95/core";
import { Qfecheck111, User, Warning } from "@react95/icons";
import dateFormat from "dateformat";
import React from "react";
import ReactMarkdown from "react-markdown";

interface MessageProps {
  id: string;
  text: string;
  isUser: boolean;
  isError?: boolean;
  createdAt: Date;
  icon?: React.ReactNode;
}

export default function Message({
  id,
  text,
  isUser,
  isError = false,
  createdAt,
  icon,
}: MessageProps) {
  return (
    <Frame
      key={id}
      className={`p-3 text-xs border shadow-sm max-w-[85%] ${
        isUser
          ? "bg-[#c0d4c0] border-[#8a9e8a] self-end ml-auto"
          : isError
            ? "bg-[#f5d5d5] border-[#cc6666] self-start mr-auto"
            : "bg-[#d8d8d8] border-[#999999] self-start mr-auto"
      }`}
    >
      <div className="flex justify-between items-center mb-1.5 gap-4">
        <h4
          className={`font-bold text-xs flex items-center gap-0.5 ${
            isUser ? "text-[#1b4d1b]" : isError ? "text-[#8b0000]" : "text-[#000080]"
          }`}
        >
          {icon ? (
            icon
          ) : isUser ? (
            <User variant="16x16_4" className="-mr-0.5" />
          ) : isError ? (
            <Warning variant="32x32_4" className="-mr-0.5" />
          ) : (
            <Qfecheck111 variant="32x32_4" className="-mr-0.5" />
          )}
          <span>{isUser ? "YOU (User)" : isError ? "ERROR" : "AI ASSISTANT"}</span>
        </h4>
        <span className="text-[11px] text-gray-600">
          {dateFormat(createdAt, "h:MM TT")}
        </span>
      </div>
      <div className="text-gray-900 leading-normal space-y-1.5 [&_ul]:list-disc [&_ul]:pl-4 [&_ol]:list-decimal [&_ol]:pl-4 [&_code]:bg-gray-200 [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_code]:font-mono [&_p]:mb-1 [&_strong]:font-bold">
        <ReactMarkdown>{text}</ReactMarkdown>
      </div>
    </Frame>
  );
}
