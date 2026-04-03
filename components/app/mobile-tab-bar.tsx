import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ClipboardCheck, House, User } from "lucide-react";

import { cn } from "@/lib/utils";

type TabKey = "home" | "attendance" | "profile";

type TabItem = {
  key: TabKey;
  href: string;
  label?: string;
};

type MobileTabBarProps = {
  items: TabItem[];
  active: TabKey;
};

const defaultItems: Record<
  TabKey,
  {
    label: string;
    icon: LucideIcon;
  }
> = {
  home: {
    label: "首页",
    icon: House,
  },
  attendance: {
    label: "点名",
    icon: ClipboardCheck,
  },
  profile: {
    label: "我的",
    icon: User,
  },
};

export function MobileTabBar({ items, active }: MobileTabBarProps) {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 mx-auto w-full max-w-[402px] px-[21px] pb-[calc(16px+env(safe-area-inset-bottom))] pt-3">
      <nav className="pointer-events-auto grid h-[62px] grid-cols-3 gap-1 rounded-[80px] bg-[var(--jp-surface)] p-1 shadow-[0_18px_36px_rgba(28,28,28,0.08)] ring-1 ring-[color:var(--jp-border)] backdrop-blur-sm">
        {items.map((item) => {
          const config = defaultItems[item.key];
          const Icon = config.icon;
          const isActive = item.key === active;

          return (
            <Link
              key={item.key}
              href={item.href}
              className={cn(
                "flex h-full flex-col items-center justify-center gap-1 rounded-[20px] text-[10px] font-medium transition-colors",
                isActive
                  ? "rounded-[60px] bg-[var(--jp-accent)] text-white"
                  : "text-[var(--jp-text-muted)]",
              )}
            >
              <Icon className="size-5" strokeWidth={2.1} />
              <span>{item.label ?? config.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
