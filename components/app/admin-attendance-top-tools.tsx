"use client";

import Link from "next/link";
import { Copy, Search } from "lucide-react";

import { cn } from "@/lib/utils";

type ToolTone = "info" | "success" | "neutral" | "danger";

type SummaryItem = {
  label: string;
  value: number | string;
  tone: ToolTone;
};

type ActionItem = {
  label: string;
  onClick: () => void;
};

type TabItem = {
  label: string;
  href: string;
  active?: boolean;
};

type AdminAttendanceTopToolsProps = {
  summaryItems: SummaryItem[];
  actions: ActionItem[];
  tabs: TabItem[];
  searchPlaceholder: string;
};

export function AdminAttendanceTopTools({
  summaryItems,
  actions,
  tabs,
  searchPlaceholder,
}: AdminAttendanceTopToolsProps) {
  return (
    <section className="mt-3.5 rounded-[16px] border border-[#E8E5E0] bg-white p-3 shadow-[0_10px_22px_rgba(28,28,28,0.04)]">
      <div className="flex flex-wrap gap-1.5">
        {summaryItems.map((item) => (
          <SummaryChip
            key={item.label}
            label={item.label}
            value={item.value}
            tone={item.tone}
          />
        ))}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3">
        {actions.map((action) => (
          <ActionButton key={action.label} label={action.label} onClick={action.onClick} />
        ))}
      </div>

      <div className="mt-3 border-b border-[color:var(--jp-border)]">
        <div className="flex">
          {tabs.map((tab) =>
            tab.active ? (
              <div key={tab.label} className="border-b-2 border-[color:var(--jp-accent)] px-3 py-3">
                <span className="text-sm font-semibold text-[var(--jp-accent)]">
                  {tab.label}
                </span>
              </div>
            ) : (
              <Link key={tab.label} href={tab.href} className="px-3 py-3">
                <span className="text-sm text-[var(--jp-text-muted)]">{tab.label}</span>
              </Link>
            ),
          )}
        </div>
      </div>

      <div className="mt-3 flex h-10 items-center gap-3 rounded-[12px] bg-[var(--jp-surface-muted)] px-4 text-[13px] text-[var(--jp-text-muted)]">
        <Search className="size-4" />
        <span>{searchPlaceholder}</span>
      </div>
    </section>
  );
}

function SummaryChip({
  label,
  value,
  tone,
}: {
  label: string;
  value: number | string;
  tone: ToolTone;
}) {
  const toneClass = {
    info: "bg-[#1E3A5F10] text-[#1E3A5F]",
    success: "bg-[#3d6b4f1a] text-[#3D6B4F]",
    neutral: "bg-[#1C1C1C12] text-[#1C1C1C]",
    danger: "bg-[#d52f2f1a] text-[#D32F2F]",
  }[tone];

  return (
    <div className={cn("flex items-center gap-1.5 rounded-full px-3 py-1.5", toneClass)}>
      <span className="text-[13px] font-medium">{label}</span>
      <span className="text-[13px] font-bold">{value}</span>
    </div>
  );
}

function ActionButton({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-11 items-center gap-2 rounded-[12px] bg-[var(--jp-surface-muted)] px-4 text-left text-[12px] font-medium text-[var(--jp-text)]"
    >
      <Copy className="size-4 text-[var(--jp-accent)]" />
      <span>{label}</span>
    </button>
  );
}
