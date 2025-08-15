import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { getFiles } from "@/lib/api/files";
import { useQuery } from "@tanstack/react-query";
import { FileText } from "lucide-react";
import { renderBytes } from "./ui/shadcn-io/dropzone";

export function AppChatFiles({
  sessionId,
  triggerRef,
}: {
  sessionId: string;
  triggerRef: React.RefObject<HTMLDivElement | null>;
}) {
  const { data, isFetching, refetch } = useQuery({
    queryKey: ["sessionFiles", sessionId],
    queryFn: () => getFiles(sessionId),
    enabled: false,
  });

  const handleOpen = () => {
    if (!isFetching) {
      refetch();
    }
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <div ref={triggerRef} onClick={handleOpen}></div>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Uploaded files</SheetTitle>
          <SheetDescription></SheetDescription>
        </SheetHeader>
        <div className="grid flex-1 auto-rows-min gap-6 px-4">
          {data?.data?.files.map(
            ({ filename, id, mimeType, size, createdAt }) => (
              <div
                className="relative bg-primary/20 text-secondary-foreground flex items-center gap-2 text-xs border rounded-md p-2 pr-8"
                key={id}
              >
                <FileText size={36} />
                <div>
                  <p className="font-semibold">{filename}</p>
                  <p className="text-xs">{mimeType}</p>
                  <p className="text-xs">{renderBytes(size)}</p>
                  <p className="text-xs">{createdAt}</p>
                </div>
              </div>
            )
          )}
        </div>
        <SheetFooter>
          <SheetClose asChild>
            <Button variant="outline" className="cursor-pointer">
              Close
            </Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
