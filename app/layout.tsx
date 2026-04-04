import type { Metadata } from "next";
import "./globals.css";
import GlobalHeader from '@/components/GlobalHeader';
import { Inter } from "next/font/google";
import React from "react";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/contexts/AuthContext";
import { getTranslations } from 'next-intl/server';

const inter = Inter({
    subsets: ["latin"],
});

export async function generateMetadata({ params }: { params: { locale?: string } }): Promise<Metadata> {
  const t = await getTranslations('Meta');
  return {
    title: t('title'),
    description: t('description'),
    keywords: 'talent, actors, dancers, musicians, crew, entertainment, hiring',
  };
}

export default async function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
      <html suppressHydrationWarning>
        <head>
          <link rel="preload" as="image" href="/images/hero-poster.webp" type="image/webp" />
        </head>
        <body className={`${inter.className} bg-white dark:bg-gray-900`}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <AuthProvider>
              <div className="flex flex-col min-h-screen">
                <GlobalHeader />

                {/* Main Content Area — pt-16 offsets the fixed h-16 GlobalHeader */}
                <div className="min-h-screen flex flex-col pt-16">
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