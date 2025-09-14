import type { Metadata } from "next";
import "./globals.css";
import Footer from '@/components/Footer';
import Sidebar from '@/components/Sidebar';
import HomeStyleAuthTopRight from '@/components/HomeStyleAuthTopRight';
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

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
      <html lang="en" suppressHydrationWarning>
        <body className={inter.className}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <AuthProvider>
              <div className="flex min-h-screen">
                <Sidebar />
                <div className="flex-1 ml-0 md:ml-60 flex flex-col">
                  {/* Top-right auth section (homepage style, used everywhere) */}
                  <div className="w-full flex justify-end items-center px-6 pt-6 bg-white dark:bg-gray-900/80 bg-opacity-80 backdrop-blur-sm transition-colors duration-300 shadow-none">
                    <HomeStyleAuthTopRight />
                  </div>
                  <main className="flex-1">
                    {children}
                  </main>
                  <Footer />
                </div>
              </div>
            </AuthProvider>
          </ThemeProvider>
        </body>
      </html>
    );
}