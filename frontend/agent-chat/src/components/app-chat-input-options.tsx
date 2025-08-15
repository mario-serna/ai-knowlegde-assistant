import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Paperclip, PlusIcon } from "lucide-react";
import { HTMLAttributes } from "react";
import { AIInputButton } from "./ui/shadcn-io/ai/input";
import { DropzoneInputTrigger } from "./ui/shadcn-io/dropzone";

interface AppChatInputOptionsProps extends HTMLAttributes<HTMLButtonElement> {
  setFile?: (file: File) => void;
}

export const AppChatInputOptions = ({
  setFile,
  ...props
}: AppChatInputOptionsProps) => {
  return (
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
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
