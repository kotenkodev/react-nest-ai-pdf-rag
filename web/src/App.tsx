import { useEffect, useRef } from "react";
import "@react95/core/GlobalStyle";
import "@react95/core/themes/win95.css";
import { Cursor, Frame, List, TaskBar, useModal } from "@react95/core";
import {
  Computer,
  Defrag3,
  Explore,
  Folder,
  Key,
  RecycleEmpty,
} from "@react95/icons";
import AuthForm from "./components/AuthForm";
import AppIcon from "./components/AppIcon";
import ChatWindow from "./components/ChatWindow";
import ClippyAssistant from "./components/ClippyAssistant";
import docChatIcon from "/docchat-icon.svg";
import { useAuthStore } from "./store/useAuthStore";

const AUTH_MODAL = "auth-modal" as const;
const CHAT_MODAL = "chat-modal" as const;

const DESKTOP_ICONS = [
  {
    title: "My Computer",
    icon: <Computer variant="32x32_4" />,
    top: "20px",
    left: "20px",
  },
  {
    title: "(C:)",
    icon: <Defrag3 variant="32x32_4" />,
    top: "105px",
    left: "20px",
  },
  {
    title: "The Internet",
    icon: <Explore variant="32x32_4" />,
    top: "190px",
    left: "20px",
  },
  {
    title: "Recycle Bin",
    icon: <RecycleEmpty variant="32x32_4" />,
    top: "275px",
    left: "20px",
  },
  {
    title: "My Folder",
    icon: <Folder variant="32x32_4" />,
    top: "360px",
    left: "20px",
  },
] as const;

export default function App() {
  const { isAuthenticated, isWindowOpen, openWindow } = useAuthStore();
  const { add, restore, focus } = useModal();
  const openedRef = useRef(false);

  const openDocChat = () => {
    const id = isAuthenticated ? CHAT_MODAL : AUTH_MODAL;
    const title = isAuthenticated
      ? "DocChat - PDF Assistant"
      : "DocChat - Sign-in";
    add({ id, hasButton: true, title });
    restore(id);
    focus(id);
    openWindow();
  };

  useEffect(() => {
    if (!openedRef.current && isWindowOpen) {
      openedRef.current = true;
      openDocChat();
    }
  }, []);

  const handleShutDown = () => {
    window.open("about:blank", "_self");
    window.close();
  };

  return (
    <Frame
      className={Cursor.Auto}
      w="100vw"
      h="100vh"
      bgColor="#008080"
      position="relative"
    >
      {DESKTOP_ICONS.map((icon) => (
        <AppIcon key={icon.title} {...icon} />
      ))}

      <AppIcon
        title="DocChat"
        icon={docChatIcon}
        top="calc(50vh - 40px)"
        left="calc(50vw - 40px)"
        onDoubleClick={openDocChat}
      />

      <ClippyAssistant isWindowOpen={isWindowOpen} />

      <TaskBar
        list={
          <List>
            <List.Item
              icon={<Key variant="32x32_4" />}
              onClick={handleShutDown}
            >
              Shut Down
            </List.Item>
          </List>
        }
      />

      {isWindowOpen && (!isAuthenticated ? <AuthForm /> : <ChatWindow />)}
    </Frame>
  );
}
