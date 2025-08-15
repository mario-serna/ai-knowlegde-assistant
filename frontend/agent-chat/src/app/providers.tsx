"use client";

import { SessionProvider } from "@/context/session-context";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import { SidebarProvider } from "../components/ui/sidebar";

export function Providers({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <SidebarProvider>
          <SessionProvider>{children}</SessionProvider>
        </SidebarProvider>
        <Toaster />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
