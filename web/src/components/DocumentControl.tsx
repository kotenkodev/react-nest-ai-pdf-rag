import { Alert, Cursor, Frame, TitleBar, Tooltip } from "@react95/core";
import { Divider } from "@react95/core/ListDivider";
import { Drvspace7, FolderFile, User4, Warning } from "@react95/icons";
import type { DocumentItem, DocumentStatus } from "../types/document.type";
import { useRef, useState } from "react";
import { downloadDocumentFile } from "../services/documentService";

interface DocumentControlProps {
  document: DocumentItem | null | undefined;
  status: DocumentStatus | null;
  onUpload: (file: File) => void;
  onDeleteDocument: () => void;
  isUploading?: boolean;
  onError?: (errorMessage: string) => void;
}

export default function DocumentControl({
  document,
  status,
  onUpload,
  onDeleteDocument,
  isUploading = false,
  onError,
}: DocumentControlProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [alertError, setAlertError] = useState<string | null>(null);

  const triggerError = (msg: string) => {
    if (onError) {
      onError(msg);
    } else {
      setAlertError(msg);
    }
  };

  const handleProcessFile = (file: File) => {
    if (document) {
      triggerError(
        "Only 1 PDF file is allowed per user. Please delete the existing file first before uploading a new one.",
      );
      return;
    }
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      triggerError("Only PDF files are allowed.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      triggerError("File size exceeds 10MB limit.");
      return;
    }
    onUpload(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleProcessFile(selectedFile);
      e.target.value = ""; // Reset input value
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (document) {
      triggerError(
        "Only 1 PDF file is allowed per user. Please delete the existing file first before uploading a new one.",
      );
      return;
    }
    const selectedFile = e.dataTransfer.files?.[0];
    if (selectedFile) {
      handleProcessFile(selectedFile);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDropzoneClick = () => {
    if (document) {
      triggerError(
        "Only 1 PDF file is allowed per user. Please delete the existing file first before uploading a new one.",
      );
      return;
    }
    if (!isUploading) {
      fileInputRef.current?.click();
    }
  };

  const hasDocument = !!document;

  return (
    <>
      {alertError && (
        <Alert
          id="doc-control-error-alert"
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

      <Frame
        w={{
          mobile: "100%",
          tablet: "30%",
          desktop: "30%",
        }}
        className="w-full md:w-[30%] flex-shrink-0 flex flex-col gap-3 min-w-0 relative z-20"
      >
      <fieldset className="border border-gray-400 p-2.5 shadow-sm min-w-0">
        <legend className="text-xs font-bold px-1 text-gray-900">
          PDF Document Control
        </legend>
        <div className="flex flex-col gap-2.5 mt-1 min-w-0">
          <div
            onClick={handleDropzoneClick}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            className={`border border-dashed border-gray-400 p-3 text-center flex flex-col items-center gap-1 ${
              hasDocument
                ? "opacity-60 cursor-not-allowed bg-gray-100"
                : isUploading
                  ? "opacity-50 pointer-events-none"
                  : "cursor-pointer hover:bg-gray-100"
            }`}
          >
            <input
              type="file"
              accept=".pdf,application/pdf"
              ref={fileInputRef}
              onChange={handleInputChange}
              className="hidden"
            />
            <FolderFile variant="32x32_4" />
            <p className="text-xs font-bold text-gray-900">
              {hasDocument
                ? "Delete file to upload new"
                : isUploading
                  ? "Uploading..."
                  : "Upload a PDF"}
            </p>
            <p className="text-[11px] text-gray-500">
              {hasDocument
                ? "Max 1 PDF allowed per user"
                : isUploading
                  ? "Please wait..."
                  : "Drag here or click (max 10MB)"}
            </p>
          </div>

          <Frame
            boxShadow="$in"
            bgColor="$inputBackground"
            p="8px"
            className="text-xs min-w-0 overflow-hidden"
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
                  } flex items-center gap-1.5 text-xs min-w-0`}
                >
                  {status === "success" && (
                    <Drvspace7 variant="32x32_4" className="flex-shrink-0" />
                  )}
                  {status === "pending" && (
                    <Warning variant="32x32_4" className="flex-shrink-0" />
                  )}
                  {status === "error" && (
                    <User4 variant="32x32_4" className="flex-shrink-0" />
                  )}
                  <span className="truncate min-w-0">
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
              className="text-xs min-w-0 relative z-30"
            >
              <p className="font-bold flex items-center gap-1.5 min-w-0">
                <FolderFile variant="16x16_4" className="flex-shrink-0" />
                <Tooltip
                  text={document.fileName}
                  className="relative z-50 min-w-0 flex-1"
                >
                  <span className="truncate block min-w-0">
                    {document.fileName}
                  </span>
                </Tooltip>
              </p>
              <Divider className="list-none my-1.5" />
              <div className="flex justify-between items-center text-[11px] pt-1">
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (document?.fileName) {
                      downloadDocumentFile(document.fileName);
                    }
                  }}
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
    </>
  );
}
