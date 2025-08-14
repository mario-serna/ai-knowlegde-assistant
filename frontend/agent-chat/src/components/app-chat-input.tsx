"use client";
import {
  AIInput,
  AIInputButton,
  AIInputSubmit,
  AIInputTextarea,
} from "@/components/ui/shadcn-io/ai/input";
import { cn } from "@/lib/utils";
import { PlusIcon } from "lucide-react";
import { type FormEventHandler, HTMLAttributes, useRef, useState } from "react";

export type AppChatInputProps = HTMLAttributes<HTMLFormElement>;

export const AppChatInput = ({ className, ...props }: AppChatInputProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [text, setText] = useState<string>("");
  const [hasMultiline, setHasMultiline] = useState<boolean>(false);
  const [status, setStatus] = useState<
    "submitted" | "streaming" | "ready" | "error"
  >("ready");

  const handleSubmit: FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();
    if (!text) {
      return;
    }
    setStatus("submitted");
    setTimeout(() => {
      setStatus("streaming");
    }, 200);
    setTimeout(() => {
      setStatus("ready");
    }, 2000);
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
            value={text}
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
