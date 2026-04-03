import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type MobileScreenProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
};

export function MobileScreen({
  title,
  subtitle,
  children,
  className,
}: MobileScreenProps) {
  return (
    <main className={cn("bg-jp-page", className)}>
      <div className="app-shell px-5 py-6">
        <header className="mb-6 space-y-1">
          <h1 className="text-[26px] font-semibold tracking-tight text-[var(--jp-text)]">
            {title}
          </h1>
          {subtitle ? (
            <p className="text-sm text-[var(--jp-text-secondary)]">{subtitle}</p>
          ) : null}
        </header>
        <div className="flex flex-1 flex-col gap-4">{children}</div>
      </div>
    </main>
  );
}
