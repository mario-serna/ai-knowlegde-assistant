"use client";
import {
  AIConversation,
  AIConversationContent,
  AIConversationScrollButton,
} from "@/components/ui/shadcn-io/ai/conversation";
import {
  AIMessage,
  AIMessageContent,
} from "@/components/ui/shadcn-io/ai/message";
import { AppChatInput } from "./app-chat-input";
const messages = ["Hello, how are you?", "I am good, thank you!"];

export const AppChat = () => {
  return (
    <div className="flex w-full justify-center px-4">
      <div className="relative flex flex-1 max-w-4xl">
        <div className="flex flex-1">
          <AIConversation className="flex-1">
            <AIConversationContent className="p-0">
              {messages.map((message, index) => (
                <AIMessage
                  from={index % 2 === 0 ? "user" : "assistant"}
                  key={index}
                >
                  <AIMessageContent className="rounded-full">
                    {message}
                  </AIMessageContent>
                </AIMessage>
              ))}
            </AIConversationContent>
            <AIConversationScrollButton />
          </AIConversation>
        </div>
        <div className="absolute bottom-0 left-1/2 w-full -translate-x-1/2 mb-4 md:mb-8 px-4 md:px-0">
          <AppChatInput />
        </div>
      </div>
    </div>
  );
};
