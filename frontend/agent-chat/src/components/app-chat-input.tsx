"use client";
import {
  AIInput,
  AIInputButton,
  AIInputSubmit,
  AIInputTextarea,
} from "@/components/ui/shadcn-io/ai/input";
import { useSession } from "@/context/session-context";
import { sendMessage } from "@/lib/api/chats";
import { createSession } from "@/lib/api/sessions";
import { cn } from "@/lib/utils";
import { useMutation } from "@tanstack/react-query";
import { PlusIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { type FormEventHandler, HTMLAttributes, useRef, useState } from "react";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";

export type AppChatInputProps = HTMLAttributes<HTMLFormElement> & {
  sessionId?: string;
};

export const AppChatInput = ({
  sessionId,
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

  const sendMessageMutation = useMutation({
    mutationFn: async () => {
      setStatus("submitted");
      let sid = sessionId;

      if (!sid) {
        const { data, success, error } = await createSession(text.slice(0, 50));
        if (!success || !data) {
          throw new Error(error || "Failed to create session");
        }
        addSession(data);
        setActiveSessionId(data.id);
        sid = data.id;

        router.push(`/c/${data.id}`);
      }

      addMessage({
        id: uuidv4(),
        content: text,
        role: "user",
        sessionId: sid,
        fileId: null,
        createdAt: new Date().toISOString(),
        metadata: {},
      });

      return sendMessage(sid, text);
    },
    onSuccess: ({ data }) => {
      setStatus("ready");
      setText("");
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
        <AIInputButton className="absolute left-2 bottom-[8px] rounded-full">
          <PlusIcon />
        </AIInputButton>
        <AIInputSubmit
          className="absolute right-2 bottom-[8px] rounded-full"
          disabled={!text}
          status={status}
        />
      </div>
    </AIInput>
  );
};
