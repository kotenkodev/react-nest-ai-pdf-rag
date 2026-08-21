import {
  Button,
  Cursor,
  Frame,
  Modal,
  TextArea,
  TitleBar,
  useModal,
} from "@react95/core";
import { Drvspace7, FolderFile, User4, Warning } from "@react95/icons";
import docChatIcon from "/docchat-icon.svg";
import { Divider } from "@react95/core/ListDivider";
import { useAuthStore } from "../store/useAuthStore";
import Message from "./Message";
import { useState } from "react";
import {
  useChat,
  useDeleteDocument,
  useGetDocument,
  useUploadDocument,
} from "../hooks";
import type { DocumentItem } from "../types/document.type";

const CHAT_MODAL = "chat-modal" as const;

const chatModalIcon = (
  <img src={docChatIcon} alt="DocChat Icon" width="16" height="16" />
);

export default function ChatWindow() {
  const { remove, minimize, focus } = useModal();
  const { clearUserEmail, userEmail, closeWindow } = useAuthStore();
  const [isMaximized, setIsMaximized] = useState(false);
  const {
    messages,
    addUserMessage,
    addBotResponse,
    addErrorMessage,
    clearMessages,
  } = useChat();
  const [inputMessage, setInputMessage] = useState("");
  const { data: document, isLoading, error } = useGetDocument();
  const { mutateAsync: uploadDocument } = useUploadDocument();
  const { mutateAsync: deleteDocument } = useDeleteDocument();

  // const document: DocumentItem = {
  //   userEmail: "[EMAIL_ADDRESS]",
  //   fileName: "file_name.pdf",
  //   fileStorageKey: "file_name.pdf",
  //   status: "success",
  //   createdAt: new Date(),
  //   errorMessage: "error message",
  // };

  const status = document?.status || null;

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

  const canSubmit = status === "success";

  const handleMaximize = () => {
    focus("chat-modal");
  };

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;
    addUserMessage(inputMessage);
    setInputMessage("");
    addBotResponse("Hello");
  };

  return (
    <Modal
      id="chat-modal"
      icon={chatModalIcon}
      title="DocChat - PDF Assistant"
      className={
        isMaximized ? "!top-0 !left-0 !w-screen !h-[calc(100vh-28px)]" : ""
      }
      dragOptions={{
        defaultPosition: {
          x: 50,
          y: 50,
        },
        position: {
          x: isMaximized ? 0 : null,
          y: isMaximized ? 0 : null,
        },
        disabled: isMaximized,
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
              User: <span className="font-bold text-gray-900">{userEmail}</span>
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
          className="flex flex-col md:flex-row-reverse gap-4 w-full flex-1 min-h-0 overflow-hidden"
        >
          <Frame
            w={{
              mobile: "100%",
              tablet: "70%",
              desktop: "70%",
            }}
            padding="$2"
            mb={{
              mobile: "$4",
              tablet: "$0",
            }}
            className="w-full md:w-[70%] flex-1 flex flex-col justify-between h-full min-h-0"
          >
            <Frame
              bgColor="$inputBackground"
              className="flex-1 min-h-0 overflow-y-auto p-2 flex flex-col gap-2 mb-2"
            >
              {messages.map((message) => (
                <Message
                  key={message.id}
                  id={message.id}
                  text={message.text}
                  isUser={message.isUser}
                  createdAt={message.createdAt}
                />
              ))}
            </Frame>
            <Frame className="flex gap-2 flex-shrink-0">
              <TextArea
                disabled={!canSubmit}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Type your question here..."
                rows={2}
                className="w-full resize-none"
              />
              <Button
                onClick={handleSendMessage}
                disabled={!canSubmit}
                className={Cursor.Pointer}
              >
                OK
              </Button>
            </Frame>
          </Frame>

          <Frame
            w={{
              mobile: "100%",
              tablet: "30%",
              desktop: "30%",
            }}
            className="w-full md:w-[30%] flex-shrink-0 flex flex-col gap-3"
          >
            <fieldset className="border border-gray-400 p-2.5 shadow-sm">
              <legend className="text-xs font-bold px-1 text-gray-900">
                PDF Document Control
              </legend>
              <div className="flex flex-col gap-2.5 mt-1">
                <div className="border border-dashed border-gray-400 p-3 text-center cursor-pointer hover:bg-gray-100 flex flex-col items-center gap-1">
                  <FolderFile variant="32x32_4" />
                  <p className="text-xs font-bold text-gray-900">
                    Upload a PDF
                  </p>
                  <p className="text-[11px] text-gray-500">
                    Drag here or click (max 10MB)
                  </p>
                </div>

                <Frame
                  boxShadow="$in"
                  bgColor="$inputBackground"
                  p="8px"
                  className="text-xs"
                >
                  <p className="text-gray-600 mb-1">Status:</p>
                  {document ? (
                    <div>
                      <p
                        className={`font-bold ${
                          status === "success"
                            ? "text-green-600"
                            : status === "pending"
                              ? "text-yellow-700"
                              : "text-red-600"
                        } flex items-center gap-1.5 text-xs`}
                      >
                        {status === "success" && (
                          <Drvspace7 variant="32x32_4" />
                        )}
                        {status === "pending" && <Warning variant="32x32_4" />}
                        {status === "error" && <User4 variant="32x32_4" />}
                        <span>
                          {status === "success"
                            ? "READY"
                            : status === "pending"
                              ? "PROCESSING"
                              : "ERROR"}
                        </span>
                      </p>
                      {document.errorMessage && (
                        <p className="text-red-600 text-[11px] mt-1 break-words">
                          {document.errorMessage}
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-gray-500 font-bold text-xs">
                      No document uploaded
                    </p>
                  )}
                </Frame>

                {document ? (
                  <Frame
                    boxShadow="$in"
                    bgColor="#EBEBEB"
                    p="8px"
                    className="text-xs"
                  >
                    <p className="font-bold text-gray-900 truncate flex items-center gap-1.5">
                      <FolderFile variant="16x16_4" />
                      <span>{document.fileName}</span>
                    </p>
                    <Divider className="list-none my-1.5" />
                    <div className="flex justify-between items-center text-[11px] pt-1">
                      <a
                        href="#"
                        onClick={(e) => e.preventDefault()}
                        className={`${Cursor.Pointer} hover:text-blue-700 text-blue-600 underline font-medium`}
                      >
                        Download original
                      </a>
                      <a
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          deleteDocument();
                        }}
                        className={`${Cursor.Pointer} hover:text-red-700 text-red-600 underline font-medium`}
                      >
                        Delete
                      </a>
                    </div>
                  </Frame>
                ) : (
                  <Frame
                    boxShadow="$in"
                    bgColor="#EBEBEB"
                    p="8px"
                    className="text-xs text-gray-500 italic"
                  >
                    No document selected
                  </Frame>
                )}
              </div>
            </fieldset>

            <fieldset className="border border-gray-400 p-2.5 shadow-sm">
              <legend className="text-xs font-bold px-1 text-gray-900">
                Tips
              </legend>
              <ul className="text-xs text-gray-900 space-y-1 list-disc list-inside px-1 mt-1">
                <li>Ask for summaries</li>
                <li>Find specific figures & accounts</li>
                <li>Translate terms</li>
              </ul>
            </fieldset>
          </Frame>
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
  );
}
