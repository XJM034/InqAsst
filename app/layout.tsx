import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "InqAsst",
  description: "嘉祥素质教育课后服务系统移动端",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
