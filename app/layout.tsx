import type { Metadata } from "next";
import { Noto_Sans_SC } from "next/font/google";

import "./globals.css";

const notoSansSc = Noto_Sans_SC({
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-app",
  subsets: ["latin"],
  fallback: ["PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "sans-serif"],
});

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
    <html
      lang="zh-CN"
      suppressHydrationWarning
      className={`${notoSansSc.variable} antialiased`}
    >
      <body>{children}</body>
    </html>
  );
}
