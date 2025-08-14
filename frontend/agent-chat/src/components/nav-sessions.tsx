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
import { getAllSessions } from "@/lib/api/sessions";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "./ui/skeleton";

export function NavSessions() {
  const { isMobile } = useSidebar();

  const { isPending, error, data, isFetching } = useQuery({
    queryKey: ["sessions"],
    queryFn: getAllSessions,
  });

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Sessions</SidebarGroupLabel>
      <SidebarMenu>
        {error && <SidebarMenuItem>Error loading sessions</SidebarMenuItem>}
        {(isPending || isFetching) &&
          Array.from({ length: 5 }).map((_, index) => (
            <SidebarMenuItem key={index}>
              <Skeleton className="h-8" />
            </SidebarMenuItem>
          ))}
        {data?.data?.sessions?.map((item) => (
          <SidebarMenuItem key={item.id}>
            <SidebarMenuButton asChild>
              <Link href={`/c/${item.id}`}>
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
