"use client";
import {
  AIInput,
  AIInputSubmit,
  AIInputTextarea,
} from "@/components/ui/shadcn-io/ai/input";
import { useSession } from "@/context/session-context";
import { sendMessage } from "@/lib/api/chats";
import { uploadFile } from "@/lib/api/files";
import { createSession } from "@/lib/api/sessions";
import { cn } from "@/lib/utils";
import { useMutation } from "@tanstack/react-query";
import { FileText, X } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  type FormEventHandler,
  HTMLAttributes,
  useEffect,
  useRef,
  useState,
} from "react";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import { AppChatInputOptions } from "./app-chat-input-options";
import { Badge } from "./ui/badge";
import { DropzoneContent } from "./ui/shadcn-io/dropzone";

export type AppChatInputProps = HTMLAttributes<HTMLFormElement> & {
  sessionId?: string;
  files?: File[];
  setFiles?: (files: File[]) => void;
};

export const AppChatInput = ({
  sessionId,
  files,
  setFiles,
  className,
  ...props
}: AppChatInputProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [text, setText] = useState<string>("");
  const [hasMultiline, setHasMultiline] = useState<boolean>(false);
  const [status, setStatus] = useState<
    "submitted" | "streaming" | "ready" | "error"
  >("ready");

  const router = useRouter();
  const { activeSessionId, setActiveSessionId, addSession, addMessage } =
    useSession();

  useEffect(() => {
    setHasMultiline(!!files?.length || !!text);
  }, [files, text]);

  const sendMessageMutation = useMutation({
    mutationFn: async () => {
      setStatus("submitted");
      let sid = sessionId;
      let fileId = "";

      if (!sid) {
        const { data, success, error } = await createSession(text.slice(0, 50));
        if (!success || !data) {
          const defaultError = "Failed to create session";
          toast.error(error || defaultError);
          throw new Error(error || defaultError);
        }
        addSession(data);
        setActiveSessionId(data.id);
        sid = data.id;
      }

      if (files?.length) {
        toast.info("Uploading file...");
        const { data, success, message } = await uploadFile(files[0], sid);
        if (!success || !data) {
          const defaultError = "Failed to upload file";
          toast.error(message || defaultError);
        } else {
          fileId = data.id;
          toast.success("File uploaded successfully");
        }
      }

      router.push(`/c/${sid}`);

      addMessage({
        id: uuidv4(),
        content: text,
        role: "user",
        sessionId: sid,
        fileId,
        createdAt: new Date().toISOString(),
        metadata: {},
      });

      return sendMessage(sid, text);
    },
    onSuccess: ({ data }) => {
      setStatus("ready");
      setText("");
      setFiles?.([]);
      setHasMultiline(false);

      addMessage({
        id: uuidv4(),
        content: data.answer,
        role: "assistant",
        sessionId: sessionId || activeSessionId,
        fileId: null,
        createdAt: new Date().toISOString(),
        metadata: {},
      });
    },
    onError: (error) => {
      setStatus("error");
      console.error("Chat error:", error);
      // Consider showing an error toast/message to the user
      toast.error("Failed to send message");
    },
  });

  const handleSubmit: FormEventHandler<
    HTMLFormElement | HTMLTextAreaElement
  > = (event) => {
    event.preventDefault();
    if (!text) {
      return;
    }
    sendMessageMutation.mutate();
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      handleSubmit(event);
    }
  };

  const handleTextChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = event.target.value;
    setText(text);

    if (files?.length) {
      setHasMultiline(true);
      return;
    }

    // Reset multiline style
    if (text.length === 0) {
      setHasMultiline(false);
      return;
    }

    // Lock multiline style
    if (!textareaRef.current || hasMultiline) {
      return;
    }

    const lineHeight =
      parseInt(getComputedStyle(textareaRef.current).lineHeight) * 1.5;

    const numLineas = Math.floor(textareaRef.current.scrollHeight / lineHeight);
    setHasMultiline(numLineas > 1);
  };

  return (
    <AIInput
      onSubmit={handleSubmit}
      className={cn(className, hasMultiline ? "rounded-3xl" : "rounded-full")}
      {...props}
    >
      <div className="relative flex justify-between items-center gap-1 px-2 py-1">
        <div className="w-full">
          <DropzoneContent>
            <div
              className={cn("flex gap-2 mt-2", files?.length ? "" : "hidden")}
            >
              {files?.map((file, index) => (
                <div
                  className="relative bg-primary/20 text-secondary-foreground flex items-center gap-2 text-xs border rounded-md p-2 pr-8"
                  key={index}
                >
                  <FileText size={36} />
                  <div>
                    <p>{file.name}</p>
                    <p>{file.type}</p>
                  </div>
                  <Badge
                    variant="destructive"
                    className={cn(
                      "absolute p-1 top-0 right-0 cursor-pointer",
                      status === "submitted" ? "hidden" : ""
                    )}
                    onClick={() => {
                      if (status === "submitted") {
                        return;
                      }

                      const newFiles = [...files];
                      newFiles.splice(index, 1);
                      setFiles?.(newFiles);
                    }}
                  >
                    <X size={16} />
                  </Badge>
                </div>
              ))}
            </div>
          </DropzoneContent>
          <AIInputTextarea
            ref={textareaRef}
            placeholder="Ask anything..."
            className={cn("min-h-9", hasMultiline ? "" : "px-12")}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            value={text}
            disabled={status === "submitted"}
          />
          <div className={hasMultiline ? "h-12" : "h-0"} />
        </div>
        <AppChatInputOptions className="absolute left-2 bottom-[8px] rounded-full cursor-pointer" />
        <AIInputSubmit
          className="absolute right-2 bottom-[8px] rounded-full cursor-pointer"
          disabled={!text}
          status={status}
        />
      </div>
    </AIInput>
  );
};
