import { Providers } from "@/app/providers";
import { AppHeader } from "@/components/app-header";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset } from "@/components/ui/sidebar";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AIKA",
  description: "AIKA is an AI Knowledge Agent Chat",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <AppSidebar />
          <SidebarInset>
            <div className="flex flex-col h-screen w-full">
              <AppHeader />
              <main className="flex w-full h-full max-h-screen overflow-y-auto">
                {children}
              </main>
            </div>
          </SidebarInset>
        </Providers>
      </body>
    </html>
  );
}
