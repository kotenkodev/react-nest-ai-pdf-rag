import { useEffect } from "react";
import "@react95/core/GlobalStyle";
import "@react95/core/themes/win95.css";
import { useClippy, ClippyProvider } from "@react95/clippy";
import { Button, Cursor, Frame, List, TaskBar, useModal } from "@react95/core";
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
import docChatIcon from "/docchat-icon.svg";

import { useAuthStore } from "./store/useAuthStore";

const AUTH_MODAL = "auth-modal" as const;
const CHAT_MODAL = "chat-modal" as const;

const MyComponent = () => {
  const { clippy } = useClippy();

  useEffect(() => {
    if (!clippy) return;

    const handleSkipAnimation = () => {
      clippy.stopCurrent();
      clippy.stop();
      clippy.closeBalloon();
    };

    const el = (clippy as any)._el || document.querySelector(".clippy");
    if (el) {
      el.addEventListener("click", handleSkipAnimation);
      return () => {
        el.removeEventListener("click", handleSkipAnimation);
      };
    }
  }, [clippy]);

  const handleSpeak = () => {
    if (!clippy) return;
    clippy.speak("Hello there! I'm Clippy, your AI assistant.", false);
    setTimeout(() => {
      clippy.closeBalloon();
    }, 4000);
  };

  return (
    <>
      <Button onClick={handleSpeak}>Test speak</Button>
      <Button onClick={() => clippy?.play("Wave")}>Hello Clippy!</Button>
    </>
  );
};

function App() {
  const { isAuthenticated, isWindowOpen, openWindow } = useAuthStore();
  const { add, restore, focus } = useModal();

  const handleLogout = () => {
    window.open("about:blank", "_self");
    window.close();
  };

  const handleOpenDocChat = () => {
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

  const icons = [
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
      title: "DocChat",
      icon: docChatIcon,
      top: "calc(50vh - 40px)",
      left: "calc(50vw - 40px)",
      onDoubleClick: handleOpenDocChat,
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
  ];

  return (
    <Frame
      className={Cursor.Auto}
      w="100vw"
      h="100vh"
      bgColor="#008080"
      position="relative"
    >
      {icons.map((icon, index) => (
        <AppIcon
          key={index}
          title={icon.title}
          icon={icon.icon}
          top={icon.top}
          left={icon.left}
          onDoubleClick={icon.onDoubleClick}
        />
      ))}

      <ClippyProvider>
        <MyComponent />
      </ClippyProvider>

      <TaskBar
        list={
          <List>
            <List.Item icon={<Key variant="32x32_4" />} onClick={handleLogout}>
              Shut Down
            </List.Item>
          </List>
        }
      />

      {isWindowOpen && (!isAuthenticated ? <AuthForm /> : <ChatWindow />)}
    </Frame>
  );
}

export default App;
