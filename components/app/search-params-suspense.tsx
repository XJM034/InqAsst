"use client";

import { Suspense, type ReactNode } from "react";

export function SearchParamsSuspense({ children }: { children: ReactNode }) {
  return <Suspense fallback={<div className="flex h-screen items-center justify-center text-sm text-[var(--jp-text-muted)]">加载中...</div>}>{children}</Suspense>;
}
