"use client";
import { useSession } from "@/context/session-context";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { AppChatInput } from "./app-chat-input";
import { AppChatMessages } from "./app-chat-messages";
import { Dropzone } from "./ui/shadcn-io/dropzone";

export const AppChat = ({ id }: { id?: string }) => {
  const { setActiveSessionId } = useSession();

  const [files, setFiles] = useState<File[] | undefined>();

  const handleDrop = (files: File[]) => {
    setFiles(files);
  };

  useEffect(() => {
    if (id) {
      setActiveSessionId(id);
    }
  }, [id]);

  return (
    <Dropzone noClick={true} onDrop={handleDrop} src={files}>
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
          <AppChatInput sessionId={id} files={files} setFiles={setFiles} />
        </div>
      </div>
    </Dropzone>
  );
};
