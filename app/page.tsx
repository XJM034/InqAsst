"use client";

import { useEffect } from "react";

export default function Home() {
  useEffect(() => {
    window.location.replace("/login");
  }, []);

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6">
      <a className="text-sm font-medium text-primary underline-offset-4 hover:underline" href="/login">
        进入登录
      </a>
    </main>
  );
}
