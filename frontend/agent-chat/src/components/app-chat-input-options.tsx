import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSession } from "@/context/session-context";
import { Files, Paperclip, PlusIcon } from "lucide-react";
import { HTMLAttributes, useRef } from "react";
import { AppChatFiles } from "./app-chat-files";
import { AIInputButton } from "./ui/shadcn-io/ai/input";
import { DropzoneInputTrigger } from "./ui/shadcn-io/dropzone";

export const AppChatInputOptions = ({
  ...props
}: HTMLAttributes<HTMLButtonElement>) => {
  const filesRef = useRef<HTMLDivElement>(null);
  const { activeSessionId } = useSession();

  const handleFilesClick = () => {
    filesRef.current?.click();
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <AIInputButton {...props}>
            <PlusIcon />
          </AIInputButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="top" align="start">
          <DropzoneInputTrigger className="w-full">
            <DropdownMenuItem className="cursor-pointer">
              <Paperclip />
              <span>Attach file</span>
            </DropdownMenuItem>
          </DropzoneInputTrigger>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={handleFilesClick}
            disabled={!activeSessionId}
          >
            <Files />
            <span>Uploaded files</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <AppChatFiles sessionId={activeSessionId} triggerRef={filesRef} />
    </>
  );
};
