import { useEffect, useRef, useState } from "react";
import { Cursor, Frame, useModal } from "@react95/core";
import { useDraggable } from "@neodrag/react";
import docChatIcon from "/docchat-icon.svg";
import { useAuthStore } from "../store/useAuthStore";

const AUTH_MODAL = "auth-modal" as const;
const CHAT_MODAL = "chat-modal" as const;

export default function AppIcon() {
  const { isAuthenticated, openWindow } = useAuthStore();
  const [isSelected, setIsSelected] = useState(false);
  const iconRef = useRef<HTMLDivElement>(null);
  const { add, restore, focus } = useModal();

  useDraggable(iconRef, {
    bounds: "parent",
    onDragStart: () => {
      setIsSelected(true);
      document.body.classList.add("dragging");
    },
    onDragEnd: () => {
      document.body.classList.remove("dragging");
    },
  });

  const handleOpenApp = () => {
    const targetModalId = isAuthenticated ? CHAT_MODAL : AUTH_MODAL;
    add({
      id: targetModalId,
      hasButton: true,
      title: isAuthenticated ? "DocChat - PDF Assistant" : "DocChat - Sign-in",
    });
    restore(targetModalId);
    focus(targetModalId);
    openWindow();
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (iconRef.current && !iconRef.current.contains(e.target as Node)) {
        setIsSelected(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (isSelected && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      handleOpenApp();
    }
  };

  return (
    <Frame
      ref={iconRef}
      tabIndex={0}
      position="absolute"
      top="20px"
      left="20px"
      onClick={() => setIsSelected(true)}
      onDoubleClick={handleOpenApp}
      onKeyDown={handleKeyDown}
      className={`${Cursor.Pointer} inline-flex flex-col items-center p-1 w-20 text-center select-none focus:outline-none`}
      bg="transparent"
      boxShadow="none"
    >
      <div className="relative p-1">
        <img
          width="48px"
          height="48px"
          src={docChatIcon}
          alt="DocChat Icon"
          className={`pointer-events-none transition-filter duration-75 ${
            isSelected
              ? "brightness-90 contrast-125 drop-shadow-[0_0_2px_#000080]"
              : ""
          }`}
        />
        {isSelected && (
          <div
            className="absolute inset-0 bg-[#000080] opacity-25 mix-blend-multiply pointer-events-none"
            style={{
              maskImage: `url(${docChatIcon})`,
              maskSize: "contain",
              maskRepeat: "no-repeat",
              maskPosition: "center",
            }}
          />
        )}
      </div>
      <span
        style={{
          fontFamily:
            "'MS Sans Serif', 'Microsoft Sans Serif', Tahoma, sans-serif",
          fontSize: "11px",
          lineHeight: "13px",
          textShadow: isSelected ? "none" : "1px 1px 0px #000000",
        }}
        className={`mt-1 px-1 py-0.5 tracking-normal leading-none inline-block ${
          isSelected
            ? "bg-[#000080] text-white outline outline-1 outline-white"
            : "text-white"
        }`}
      >
        DocChat
      </span>
    </Frame>
  );
}
