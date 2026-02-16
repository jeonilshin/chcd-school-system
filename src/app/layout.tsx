import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "@/components/providers/session-provider";
import { SchoolSettingsProvider } from "@/contexts/school-settings-context";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Student Enrollment System - CHCD",
  description: "Digital student enrollment system for Circular Home Child Development",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SessionProvider>
          <SchoolSettingsProvider>
            {children}
          </SchoolSettingsProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
