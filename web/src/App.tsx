import "@react95/core/GlobalStyle";
import "@react95/core/themes/win95.css";
import { useClippy, ClippyProvider } from "@react95/clippy";
import { Button, Cursor, Frame, List, TaskBar } from "@react95/core";
import { Key } from "@react95/icons";
import AuthForm from "./components/AuthForm";
import AppIcon from "./components/AppIcon";
import ChatWindow from "./components/ChatWindow";

import { useAuthStore } from "./store/useAuthStore";

const MyComponent = () => {
  const { clippy } = useClippy();

  return (
    <>
      <Button
        onClick={() =>
          clippy?.speak("Hello there! I'm Clippy, your AI assistant.", "Wave")
        }
      >
        Test speack
      </Button>
      <Button onClick={() => clippy?.play("Wave")}>Hello Clippy!</Button>
    </>
  );
};

function App() {
  const { isAuthenticated, isWindowOpen } = useAuthStore();

  const handleLogout = () => {
    window.open("about:blank", "_self");
    window.close();
  };

  return (
    <Frame
      className={Cursor.Auto}
      w="100vw"
      h="100vh"
      bg="#008080"
      position="relative"
    >
      <AppIcon />
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
