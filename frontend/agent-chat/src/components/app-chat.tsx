"use client";
import { useSession } from "@/context/session-context";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { Accept } from "react-dropzone";
import { toast } from "sonner";
import { AppChatInput } from "./app-chat-input";
import { AppChatMessages } from "./app-chat-messages";
import { Dropzone } from "./ui/shadcn-io/dropzone";

// Accepted file types, text files only
const acceptedFiles: Accept = {
  "text/*": ["text/plain", "text/csv"],
  "application/*": ["application/pdf"],
};

export const AppChat = ({ id }: { id?: string }) => {
  const { setActiveSessionId, setMessages } = useSession();

  const [files, setFiles] = useState<File[] | undefined>();

  const handleDrop = (files: File[]) => {
    setFiles(files);
  };

  const handleDropRejected = () => {
    toast.warning("Only text, csv and PDF files are allowed");
  };

  useEffect(() => {
    if (!id) {
      setMessages([]);
    }
    setActiveSessionId(id || "");
  }, [id]);

  return (
    <Dropzone
      accept={acceptedFiles}
      noClick={true}
      onDropRejected={handleDropRejected}
      onDrop={handleDrop}
      src={files}
    >
      <div className="relative flex w-full h-full">
        {id && (
          <div className="flex w-full h-[calc(100%-74px)]">
            <AppChatMessages id={id} />
          </div>
        )}
        <div
          className={cn(
            "absolute w-full max-w-4xl flex flex-col gap-6 left-1/2 -translate-x-1/2 mb-4 md:mb-8 px-4",
            id ? "bottom-0" : "top-4/10 -translate-y-4/10"
          )}
        >
          {!id && (
            <div className="h-12 flex items-center justify-center">
              <span className="text-2xl">What&apos;s on your mind today?</span>
            </div>
          )}
          <AppChatInput
            className="bg-secondary"
            sessionId={id}
            files={files}
            setFiles={setFiles}
          />
        </div>
      </div>
    </Dropzone>
  );
};
