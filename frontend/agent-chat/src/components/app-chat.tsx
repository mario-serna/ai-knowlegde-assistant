"use client";
import { cn } from "@/lib/utils";
import { AppChatInput } from "./app-chat-input";
import { AppChatMessages } from "./app-chat-messages";

export const AppChat = ({ id }: { id?: string }) => {
  return (
    <div className="flex w-full justify-center px-4">
      <div className="relative flex w-full h-full max-w-4xl">
        {id && (
          <div className="flex h-[calc(100%-74px)]">
            <AppChatMessages id={id} />
          </div>
        )}
        <div
          className={cn(
            "absolute w-full flex flex-col gap-6 left-1/2 -translate-x-1/2 mb-4 md:mb-8",
            id ? "bottom-0" : "top-4/10 -translate-y-4/10"
          )}
        >
          {!id && (
            <div className="h-12 flex items-center justify-center">
              <span className="text-2xl">What&apos;s on your mind today?</span>
            </div>
          )}
          <AppChatInput />
        </div>
      </div>
    </div>
  );
};
