import { Cursor, Frame } from "@react95/core";
import { Divider } from "@react95/core/ListDivider";
import { Drvspace7, FolderFile, User4, Warning } from "@react95/icons";
import type { DocumentItem, DocumentStatus } from "../types/document.type";

interface DocumentControlProps {
  document: DocumentItem | null | undefined;
  status: DocumentStatus | null;
  onDeleteDocument: () => void;
}

export default function DocumentControl({
  document,
  status,
  onDeleteDocument,
}: DocumentControlProps) {
  return (
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
            <p className="text-xs font-bold text-gray-900">Upload a PDF</p>
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
                  {status === "success" && <Drvspace7 variant="32x32_4" />}
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
                    onDeleteDocument();
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
        <legend className="text-xs font-bold px-1 text-gray-900">Tips</legend>
        <ul className="text-xs text-gray-900 space-y-1 list-disc list-inside px-1 mt-1">
          <li>Ask for summaries</li>
          <li>Find specific figures & accounts</li>
          <li>Translate terms</li>
        </ul>
      </fieldset>
    </Frame>
  );
}
