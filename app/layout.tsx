import type { Metadata } from "next";
import "./globals.css";
import AuthTopRight from '@/components/AuthTopRight';
import { ModeToggle } from '@/components/ThemeToggle';
import Tooltip from '@/components/Tooltip';
import DynamicHeader from '@/components/DynamicHeader';
import { Inter } from "next/font/google";
import React from "react";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/contexts/AuthContext";

const inter = Inter({
    subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "3YESES - Connecting Talent with Opportunity",
  description: "Find actors, dancers, musicians, and behind-the-scenes pros — all in one place.",
  keywords: "talent, actors, dancers, musicians, crew, entertainment, hiring",
};

export default async function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
      <html suppressHydrationWarning>
        <body className={`${inter.className} bg-white dark:bg-gray-900`}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <AuthProvider>
              <div className="flex flex-col min-h-screen">
                {/* Top Header */}
                <header className="bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex justify-between items-center fixed top-0 left-0 right-0 h-16 z-50">
                  <div className="flex items-center gap-4">
                      <DynamicHeader />
          <Tooltip text="Toggle theme">
            <ModeToggle />
          </Tooltip>
                  </div>
                  <AuthTopRight />
                </header>

                {/* Main Content Area */}
                <div className="pt-16 bg-white dark:bg-gray-900 min-h-screen">
                  {children}
                </div>
              </div>
            </AuthProvider>
          </ThemeProvider>
          <div id="tooltip-root"></div>
        </body>
      </html>
    );
}