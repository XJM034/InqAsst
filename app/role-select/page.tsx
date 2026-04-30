"use client";

import { useEffect } from "react";

import Link from "next/link";

export default function RoleSelectPage() {
  useEffect(() => {
    window.location.replace("/login");
  }, []);

  return (
    <main className="flex min-h-dvh items-center justify-center bg-[var(--jp-bg)] px-6 text-center">
      <Link className="text-sm font-semibold text-[var(--jp-accent)]" href="/login">
        前往登录
      </Link>
    </main>
  );
}
