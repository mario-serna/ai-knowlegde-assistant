import { SquarePen } from "lucide-react";
import Link from "next/link";
import { Button } from "./ui/button";
import { SidebarTrigger } from "./ui/sidebar";

export const AppHeader = () => {
  return (
    <header className="md:hidden flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 border-b">
      <div className="flex flex-1 items-center justify-between gap-2 px-4">
        <SidebarTrigger size="lg" />

        <span className="truncate text-xl">AIKA</span>

        <Link href="/">
          <Button variant="ghost" size="icon">
            <SquarePen />
            <span className="sr-only">New Chat</span>
          </Button>
        </Link>
      </div>
    </header>
  );
};
