
"use client";

import { useState, useEffect } from 'react';
import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import { Analytics } from "@vercel/analytics/react"
import AIChat from '@/components/ai-chat';
import { Poppins, PT_Sans, Source_Code_Pro } from 'next/font/google';
import { cn } from '@/lib/utils';
import { Preloader } from '@/components/preloader';


/*
export const metadata: Metadata = {
  title: 'Prabhat Kumar: AI-Powered Portfolio',
  description: 'Prabhat Kumar - Software Engineer, AI Enthusiast, Trader, and Author. Merging Intelligence with Innovation.',
  keywords: ['Prabhat Kumar', 'Software Engineer', 'AI', 'Java Developer', 'Trader', 'Author', 'Portfolio'],
};
*/

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: '--font-poppins',
});

const ptSans = PT_Sans({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-pt-sans',
});

const sourceCodePro = Source_Code_Pro({
  subsets: ['latin'],
  variable: '--font-source-code-pro',
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2500); // Simulate loading time for the animation
    return () => clearTimeout(timer);
  }, []);

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(
        "font-body antialiased bg-background text-foreground",
        poppins.variable, 
        ptSans.variable, 
        sourceCodePro.variable
      )}>
        {loading ? (
          <Preloader />
        ) : (
          <ThemeProvider>
            <div className="relative isolate">
              <div className="absolute inset-0 -z-10 h-full w-full">
                <div id="stars"></div>
                <div id="stars2"></div>
                <div id="stars3"></div>
              </div>
              <main className="relative z-10">
                {children}
              </main>
            </div>
            <div className="relative z-[9999]">
              <AIChat />
            </div>
            <Analytics />
            <Toaster />
          </ThemeProvider>
        )}
      </body>
    </html>
  );
}
