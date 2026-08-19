import { Frame } from "@react95/core";
import dateFormat from "dateformat";

interface MessageProps {
  id: string;
  text: string;
  isUser: boolean;
  createdAt: Date;
}

export default function Message({ id, text, isUser, createdAt }: MessageProps) {
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
          className={`font-bold text-xs ${isUser ? "text-[#1b4d1b]" : "text-[#000080]"}`}
        >
          {isUser ? "YOU (User)" : "ASSISTANT AI"}
        </h4>
        <span className="text-[11px] text-gray-600">
          {dateFormat(createdAt, "h:MM TT")}
        </span>
      </div>
      <p className="text-gray-900 leading-normal whitespace-pre-wrap">{text}</p>
    </Frame>
  );
}
