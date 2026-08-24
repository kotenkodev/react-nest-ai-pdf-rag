import { useState } from "react";
import {
  Alert,
  Button,
  Cursor,
  Frame,
  Modal,
  TitleBar,
  useModal,
} from "@react95/core";
import docChatIcon from "/docchat-icon.svg";
import { Divider } from "@react95/core/ListDivider";
import { useAuthStore } from "../store/useAuthStore";
import ChatBox from "./ChatBox";
import DocumentControl from "./DocumentControl";
import {
  useAskChat,
  useChat,
  useDeleteDocument,
  useGetDocument,
  useUploadDocument,
} from "../hooks";
import { formatErrorMessage } from "../utils/formatErrorMessage";

const CHAT_MODAL = "chat-modal" as const;

const chatModalIcon = (
  <img src={docChatIcon} alt="DocChat Icon" width="16" height="16" />
);

export default function ChatWindow() {
  const { remove, minimize, focus } = useModal();
  const { clearUserEmail, userEmail, closeWindow } = useAuthStore();
  const [isMaximized, setIsMaximized] = useState(false);
  const [alertError, setAlertError] = useState<string | null>(null);

  const {
    messages,
    addUserMessage,
    addBotResponse,
    addErrorMessage,
    clearMessages,
  } = useChat();

  const [inputMessage, setInputMessage] = useState("");
  const { data: document } = useGetDocument();
  const { mutateAsync: uploadDocument, isPending: isUploading } =
    useUploadDocument();
  const { mutateAsync: deleteDocument } = useDeleteDocument();
  const { mutateAsync: askChat, isPending: isAsking } = useAskChat();

  const status = document?.status || null;
  const canSubmit = status === "success";

  const handleUpload = async (file: File) => {
    try {
      await uploadDocument(file);
    } catch (err: any) {
      addErrorMessage(
        formatErrorMessage(err, "Failed to upload document. Please try again."),
      );
    }
  };

  const handleSignOut = () => {
    clearUserEmail();
  };

  const handleCloseChatModal = () => {
    minimize(CHAT_MODAL);
    remove(CHAT_MODAL);
    closeWindow();
  };

  const handleMinimizeChatModal = () => {
    minimize(CHAT_MODAL);
    focus("no-id");
  };

  const handleSendMessage = async () => {
    const question = inputMessage.trim();
    if (!question) return;
    addUserMessage(question);
    setInputMessage("");
    try {
      const response = await askChat(question);
      addBotResponse(response.answer);
    } catch (err: any) {
      addErrorMessage(
        formatErrorMessage(
          err,
          "Failed to get a response from AI assistant. Please try again.",
        ),
      );
    }
  };

  const handleDeleteDocument = async () => {
    try {
      await deleteDocument();
      clearMessages();
    } catch (err: any) {
      addErrorMessage(
        formatErrorMessage(err, "Failed to delete document. Please try again."),
      );
    }
  };

  return (
    <>
      <Modal
        id={CHAT_MODAL}
        icon={chatModalIcon}
        title="DocChat - PDF Assistant"
        className={`${
          isMaximized ? "!top-0 !left-0 !w-screen !h-[calc(100vh-28px)]" : ""
        } ${alertError ? "pointer-events-none select-none" : ""}`}
        dragOptions={{
          defaultPosition: {
            x: 50,
            y: 50,
          },
          position: {
            x: isMaximized ? 0 : (null as any),
            y: isMaximized ? 0 : (null as any),
          },
          disabled: isMaximized || !!alertError,
          onDragStart: () => {
            window.document.body.classList.add("dragging");
          },
          onDragEnd: () => {
            window.document.body.classList.remove("dragging");
          },
        }}
        titleBarOptions={[
          <TitleBar.Minimize
            key="minimize"
            className={Cursor.Pointer}
            onClick={handleMinimizeChatModal}
          />,
          <TitleBar.Maximize
            key="maximize"
            className={Cursor.Pointer}
            onClick={() => {
              setIsMaximized(!isMaximized);
            }}
          />,
          <TitleBar.Close
            key="close"
            className={Cursor.Pointer}
            onClick={handleCloseChatModal}
          />,
        ]}
      >
        <Modal.Content
          w={
            isMaximized
              ? "100%"
              : {
                  mobile: "calc(100vw - 24px)",
                  tablet: "80vw",
                  desktop: "900px",
                }
          }
          h={
            isMaximized
              ? "calc(100vh - 90px)"
              : {
                  mobile: "auto",
                  tablet: "600px",
                  desktop: "620px",
                }
          }
          className={`${
            isMaximized
              ? "max-w-full max-h-full"
              : "max-w-[calc(100vw-24px)] max-h-[85vh]"
          } overflow-hidden flex flex-col`}
        >
          <Frame className="mb-2 flex-shrink-0">
            <Frame className="flex justify-between items-center gap-2 text-xs mb-1.5">
              <div className="text-gray-700">
                User:{" "}
                <span className="font-bold text-gray-900">{userEmail}</span>
              </div>
              <Button className={Cursor.Pointer} onClick={handleSignOut}>
                Sign Out
              </Button>
            </Frame>
            <Divider className="list-none" />
          </Frame>

          <Frame
            display={{
              mobile: "block",
              tablet: "flex",
              desktop: "flex",
            }}
            padding={{
              mobile: "$2",
              tablet: "$4",
              desktop: "$4",
            }}
            gap="$4"
            className="flex flex-col md:flex-row-reverse gap-4 w-full flex-1 min-h-0 overflow-y-auto md:overflow-visible relative z-10"
          >
            <ChatBox
              messages={messages}
              inputMessage={inputMessage}
              canSubmit={canSubmit}
              isAsking={isAsking}
              onInputChange={(e) => setInputMessage(e.target.value)}
              onSendMessage={handleSendMessage}
            />

            <DocumentControl
              document={document}
              status={status}
              onUpload={handleUpload}
              onDeleteDocument={handleDeleteDocument}
              isUploading={isUploading}
              onError={(msg) => setAlertError(msg)}
            />
          </Frame>

          <Frame>
            <Divider className="list-none mt-1" />
            <Frame className="flex items-center gap-3 w-full text-xs py-1">
              <div>For Help: press F1</div>
              <div className="h-3.5 w-[1px] bg-gray-400" />
              <div>Security zone: Intranet</div>
              <div className="h-3.5 w-[1px] bg-gray-400" />
              <div>Ready</div>
            </Frame>
          </Frame>
        </Modal.Content>
      </Modal>

      {alertError && (
        <Alert
          id="doc-chat-alert"
          type="error"
          title="Error"
          hasWindowButton
          message={alertError}
          onClose={() => setAlertError(null)}
          titleBarOptions={[
            <TitleBar.Close key="close" onClick={() => setAlertError(null)} />,
          ]}
          buttons={[{ value: "OK", onClick: () => setAlertError(null) }]}
        />
      )}
    </>
  );
}
