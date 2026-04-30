import type { Metadata } from "next";

import { SessionExpiredDialog } from "@/components/app/session-expired-dialog";
import "./globals.css";

export const metadata: Metadata = {
  title: "到了么",
  description: "到了么移动端",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-CN"
      suppressHydrationWarning
      className="antialiased"
      data-scroll-behavior="smooth"
    >
      <body suppressHydrationWarning>
        {children}
        <SessionExpiredDialog />
      </body>
    </html>
  );
}
