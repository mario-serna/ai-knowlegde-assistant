import { getSessionChat } from "@/lib/api/sessions";
import { useQuery } from "@tanstack/react-query";
import {
  AIConversation,
  AIConversationContent,
  AIConversationScrollButton,
} from "./ui/shadcn-io/ai/conversation";
import { AIMessage, AIMessageContent } from "./ui/shadcn-io/ai/message";
import { Skeleton } from "./ui/skeleton";

export function AppChatMessages({ id }: { id: string }) {
  const { isPending, error, data, isFetching } = useQuery({
    queryKey: ["sessions", id],
    queryFn: () => getSessionChat(id),
  });

  if (isPending || isFetching) {
    return <Skeleton className="h-8" />;
  }

  return (
    <AIConversation className="flex-1">
      <AIConversationContent className="p-0">
        {data?.data?.map(({ id, content, role }) => (
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
