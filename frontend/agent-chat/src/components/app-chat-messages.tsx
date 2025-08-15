import { useSession } from "@/context/session-context";
import { getSessionChat } from "@/lib/api/sessions";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import {
  AIConversation,
  AIConversationContent,
  AIConversationScrollButton,
} from "./ui/shadcn-io/ai/conversation";
import { AIMessage, AIMessageContent } from "./ui/shadcn-io/ai/message";
import { Skeleton } from "./ui/skeleton";

export function AppChatMessages({ id }: { id: string }) {
  const { messages, setMessages } = useSession();

  const { isPending, data, isFetching } = useQuery({
    queryKey: ["sessions", id],
    queryFn: () => getSessionChat(id),
  });

  useEffect(() => {
    if (data?.data) {
      const sessionMessages = messages.filter((m) => m.sessionId === id);
      setMessages([...sessionMessages, ...data.data]);
    }
  }, [data]);

  if (isPending || isFetching) {
    return <Skeleton className="h-8" />;
  }

  return (
    <AIConversation className="flex-1 flex justify-center">
      <AIConversationContent className="justify-self-center w-full max-w-4xl">
        {messages.map(({ id, content, role }) => (
          <AIMessage from={role} key={id}>
            <AIMessageContent className="rounded-lg">
              {content}
            </AIMessageContent>
          </AIMessage>
        ))}
      </AIConversationContent>
      <AIConversationScrollButton />
    </AIConversation>
  );
}
