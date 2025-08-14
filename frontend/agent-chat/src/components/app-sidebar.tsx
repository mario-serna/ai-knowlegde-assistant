"use client";

import { BotMessageSquareIcon, SquarePen } from "lucide-react";
import * as React from "react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { NavMain } from "./nav-main";
import { NavSessions } from "./nav-sessions";
import { NavUser } from "./nav-user";

// This is sample data.
const data = {
  user: {
    name: "Mario",
    email: "mario@lab.com",
    avatar: "",
  },
  navMain: [
    {
      title: "New Chat",
      url: "/",
      icon: SquarePen,
      isActive: true,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <div className="flex items-center gap-2">
          <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
            <BotMessageSquareIcon className="size-4" />
          </div>
          <div className="grid flex-1 text-left text-xl leading-tight">
            <span className="truncate font-medium">AIKA</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavSessions />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
