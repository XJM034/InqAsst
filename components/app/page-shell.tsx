import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type PageShellProps = {
  children: ReactNode;
  className?: string;
};

export function PageShell({ children, className }: PageShellProps) {
  return (
    <main className="bg-jp-page">
      <div className={cn("app-shell min-h-dvh", className)}>{children}</div>
    </main>
  );
}
