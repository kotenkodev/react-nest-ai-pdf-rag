import {
  Button,
  Cursor,
  Frame,
  Input,
  Modal,
  TitleBar,
  useModal,
} from "@react95/core";
import { Drvspace7, FolderFile, User4, Warning } from "@react95/icons";
import docChatIcon from "/docchat-icon.svg";
import { Divider } from "@react95/core/ListDivider";
import { useAuthStore } from "../store/useAuthStore";
import Message from "./Message";

const CHAT_MODAL = "chat-modal" as const;

const chatModalIcon = (
  <img src={docChatIcon} alt="DocChat Icon" width="16" height="16" />
);

const DUMMY_MESSAGES = [
  {
    id: "1",
    text: "Hello! I have a question about the document. Can you help me with it?",
    isUser: true,
    createdAt: new Date("2026-08-19T10:42:00"),
  },
  {
    id: "2",
    text: "Of course! I'd be happy to help. Please go ahead and ask your question. To make sure I understand correctly, could you also tell me which document you're referring to?",
    isUser: false,
    createdAt: new Date("2026-08-19T10:43:00"),
  },
  {
    id: "3",
    text: "Hello! I have a question about the document. Can you help me with it? Hello! I have a question about the document. Can you help me with it?",
    isUser: true,
    createdAt: new Date("2026-08-19T10:42:00"),
  },
  {
    id: "4",
    text: "Of course! I'd be happy to help. Please go ahead and ask your question. To make sure I understand correctly, could you also tell me which document you're referring to?Of course! I'd be happy to help. Please go ahead and ask your question. To make sure I understand correctly, could you also tell me which document you're referring to?Of course! I'd be happy to help. Please go ahead and ask your question. To make sure I understand correctly, could you also tell me which document you're referring to?Of course! I'd be happy to help. Please go ahead and ask your question. To make sure I understand correctly, could you also tell me which document you're referring to?",
    isUser: false,
    createdAt: new Date("2026-08-19T10:43:00"),
  },
  {
    id: "5",
    text: "Hello! I have a question about the document. Can you help me with it? Hello! I have a question about the document. Can you help me with it?",
    isUser: true,
    createdAt: new Date("2026-08-19T10:42:00"),
  },
  {
    id: "6",
    text: "Of course! I'd be happy to help. Please go ahead and ask your question. To make sure I understand correctly, could you also tell me which document you're referring to?Of course! I'd be happy to help. Please go ahead and ask your question. To make sure I understand correctly, could you also tell me which document you're referring to?Of course! I'd be happy to help. Please go ahead and ask your question. To make sure I understand correctly, could you also tell me which document you're referring to?Of course! I'd be happy to help. Please go ahead and ask your question. To make sure I understand correctly, could you also tell me which document you're referring to?",
    isUser: false,
    createdAt: new Date("2026-08-19T10:43:00"),
  },
];

export default function ChatWindow() {
  const { remove, minimize, focus } = useModal();
  const { clearUserEmail, userEmail, closeWindow } = useAuthStore();

  const status: "ready" | "pending" | "error" = "ready";

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

  const canSubmit = status === "ready";

  return (
    <Frame>
      <Modal
        id="chat-modal"
        icon={chatModalIcon}
        title="DocChat - PDF Assistant"
        dragOptions={{
          defaultPosition: {
            x: 0,
            y: 0,
          },
          onDragStart: () => {
            document.body.classList.add("dragging");
          },
          onDragEnd: () => {
            document.body.classList.remove("dragging");
          },
        }}
        titleBarOptions={[
          <TitleBar.Minimize
            key="minimize"
            className={Cursor.Pointer}
            onClick={handleMinimizeChatModal}
          />,
          <TitleBar.Close
            key="close"
            className={Cursor.Pointer}
            onClick={handleCloseChatModal}
          />,
        ]}
      >
        <Modal.Content
          w={{
            mobile: "calc(100vw - 24px)",
            tablet: "80vw",
            desktop: "900px",
          }}
          h={{
            mobile: "auto",
            tablet: "600px",
            desktop: "620px",
          }}
          className="max-w-[calc(100vw-24px)] max-h-[85vh] overflow-y-auto"
        >
          <Frame className="mb-2">
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
            className="flex flex-col md:flex-row gap-4 w-full h-full"
          >
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
                    bgColor="white"
                    p="8px"
                    className="text-xs"
                  >
                    <p className="text-gray-600 mb-1">Status:</p>
                    <p
                      className={`font-bold ${
                        status === "ready"
                          ? "text-green-600"
                          : status === "pending"
                            ? "text-yellow-700"
                            : "text-red-600"
                      } flex items-center gap-1.5 text-xs`}
                    >
                      {status === "ready" && <Drvspace7 variant="32x32_4" />}
                      {status === "pending" && <Warning variant="32x32_4" />}
                      {status === "error" && <User4 variant="32x32_4" />}
                      <span>{status.toUpperCase()}</span>
                    </p>
                  </Frame>

                  <Frame
                    boxShadow="$in"
                    bgColor="#EBEBEB"
                    p="8px"
                    className="text-xs"
                  >
                    <p className="font-bold text-gray-900 truncate flex items-center gap-1.5">
                      <FolderFile variant="16x16_4" />
                      <span>file_name.pdf</span>
                    </p>
                    <p className="text-gray-600 text-[11px] my-2">
                      Size: 4.2 MB
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
                        onClick={(e) => e.preventDefault()}
                        className={`${Cursor.Pointer} hover:text-red-700 text-red-600 underline font-medium`}
                      >
                        Delete
                      </a>
                    </div>
                  </Frame>
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
              className="w-full md:w-[70%] flex-1 flex flex-col justify-between"
            >
              <Frame
                bgColor="white"
                className="h-[380px] md:h-[480px] overflow-y-auto p-2 flex flex-col gap-2"
              >
                {DUMMY_MESSAGES.map((message) => (
                  <Message
                    key={message.id}
                    id={message.id}
                    text={message.text}
                    isUser={message.isUser}
                    createdAt={message.createdAt}
                  />
                ))}
              </Frame>
              <Frame className="flex gap-2">
                <Input
                  disabled={!canSubmit}
                  placeholder="Type your question here..."
                  className="w-full"
                />
                <Button disabled={!canSubmit} className={Cursor.Pointer}>
                  OK
                </Button>
              </Frame>
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
    </Frame>
  );
}
