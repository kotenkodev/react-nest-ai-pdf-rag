import { useEffect, useRef, useState } from "react";
import { Cursor, Frame } from "@react95/core";
import { useDraggable } from "@neodrag/react";

export interface AppIconProps {
  title: string;
  icon: React.ReactNode;
  top?: string;
  left?: string;
  onDoubleClick?: () => void;
}

export default function AppIcon({
  title,
  icon,
  top = "20px",
  left = "20px",
  onDoubleClick,
}: AppIconProps) {
  const [isSelected, setIsSelected] = useState(false);
  const iconRef = useRef<HTMLDivElement>(null);

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

  const lastTapRef = useRef<number>(0);

  const handleClick = () => {
    setIsSelected(true);
    const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
    const now = Date.now();
    const isDoubleTap = now - lastTapRef.current < 350;

    if (isMobile || isDoubleTap) {
      onDoubleClick?.();
    }

    lastTapRef.current = now;
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (isSelected && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      onDoubleClick?.();
    }
  };

  return (
    <Frame
      ref={iconRef}
      tabIndex={0}
      position="absolute"
      top={top}
      left={left}
      onClick={handleClick}
      onDoubleClick={onDoubleClick}
      onKeyDown={handleKeyDown}
      className={`${Cursor.Pointer} inline-flex flex-col items-center p-1 w-20 text-center select-none focus:outline-none`}
      bg="transparent"
      boxShadow="none"
    >
      <div className="relative p-1 flex items-center justify-center min-h-[48px]">
        {typeof icon === "string" ? (
          <img
            width="48px"
            height="48px"
            src={icon}
            alt={title}
            className={`pointer-events-none transition-filter duration-75 ${
              isSelected
                ? "brightness-90 contrast-125 drop-shadow-[0_0_2px_#000080]"
                : ""
            }`}
          />
        ) : (
          icon
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
        {title}
      </span>
    </Frame>
  );
}
