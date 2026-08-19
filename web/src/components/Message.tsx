import { Frame } from "@react95/core";
import { Qfecheck111, User } from "@react95/icons";
import dateFormat from "dateformat";
import React from "react";

interface MessageProps {
  id: string;
  text: string;
  isUser: boolean;
  createdAt: Date;
  icon?: React.ReactNode;
}

export default function Message({
  id,
  text,
  isUser,
  createdAt,
  icon,
}: MessageProps) {
  return (
    <Frame
      key={id}
      className={`p-3 text-xs border shadow-sm max-w-[85%] ${
        isUser
          ? "bg-[#c0d4c0] border-[#8a9e8a] self-end ml-auto"
          : "bg-[#d8d8d8] border-[#999999] self-start mr-auto"
      }`}
    >
      <div className="flex justify-between items-center mb-1.5 gap-4">
        <h4
          className={`font-bold text-xs flex items-center gap-0.5 ${
            isUser ? "text-[#1b4d1b]" : "text-[#000080]"
          }`}
        >
          {icon ? (
            icon
          ) : isUser ? (
            <User variant="16x16_4" className="-mr-0.5" />
          ) : (
            <Qfecheck111 variant="32x32_4" className="-mr-0.5" />
          )}
          <span>{isUser ? "YOU (User)" : "ASSISTANT AI"}</span>
        </h4>
        <span className="text-[11px] text-gray-600">
          {dateFormat(createdAt, "h:MM TT")}
        </span>
      </div>
      <p className="text-gray-900 leading-normal whitespace-pre-wrap">{text}</p>
    </Frame>
  );
}
