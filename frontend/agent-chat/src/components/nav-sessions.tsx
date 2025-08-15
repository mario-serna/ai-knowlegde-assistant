"use client";

import { MoreHorizontal, Pen, Trash2 } from "lucide-react";
import Link from "next/link";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useSession } from "@/context/session-context";
import { getAllSessions } from "@/lib/api/sessions";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { Skeleton } from "./ui/skeleton";

export function NavSessions() {
  const { isMobile } = useSidebar();
  const { activeSessionId, sessions, setSessions } = useSession();

  const { isPending, error, data, isFetching } = useQuery({
    queryKey: ["sessions"],
    queryFn: getAllSessions,
  });

  useEffect(() => {
    if (data?.data?.sessions) {
      setSessions(data.data.sessions);
    }
  }, [data]);

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Chats</SidebarGroupLabel>
      <SidebarMenu>
        {error && <SidebarMenuItem>Error loading sessions</SidebarMenuItem>}
        {(isPending || isFetching) &&
          Array.from({ length: 10 }).map((_, index) => (
            <SidebarMenuItem key={index}>
              <Skeleton className="h-8" />
            </SidebarMenuItem>
          ))}
        {sessions?.map((item) => (
          <SidebarMenuItem key={item.id}>
            <SidebarMenuButton asChild>
              <Link
                className={cn(
                  activeSessionId === item.id ? "bg-primary/30" : ""
                )}
                href={`/c/${item.id}`}
              >
                <span>{item.title}</span>
              </Link>
            </SidebarMenuButton>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuAction showOnHover>
                  <MoreHorizontal />
                  <span className="sr-only">More</span>
                </SidebarMenuAction>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-48 rounded-lg"
                side={isMobile ? "bottom" : "right"}
                align={isMobile ? "end" : "start"}
              >
                <DropdownMenuItem>
                  <Pen className="text-muted-foreground" />
                  <span>Rename</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Trash2 className="text-muted-foreground" />
                  <span>Delete</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
