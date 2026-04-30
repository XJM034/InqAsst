"use client";

import { Copy } from "lucide-react";

import { SearchField } from "@/components/app/search-field";
import { StaticLink } from "@/components/app/static-link";
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
  disabled?: boolean;
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
  searchValue: string;
  onSearchChange: (value: string) => void;
};

export const ADMIN_ATTENDANCE_COPY_LABELS = {
  courses: "复制课程信息",
  details: "复制点名明细",
} as const;

export const ADMIN_ATTENDANCE_COPY_FEEDBACK_LABELS = {
  courses: "课程信息",
  details: "点名明细",
} as const;

export function AdminAttendanceTopTools({
  summaryItems,
  actions,
  tabs,
  searchPlaceholder,
  searchValue,
  onSearchChange,
}: AdminAttendanceTopToolsProps) {
  return (
    <section className="mt-3.5 rounded-[16px] border border-[#E8E5E0] bg-white p-3 shadow-[0_10px_22px_rgba(28,28,28,0.04)]">
      {summaryItems.length > 0 ? (
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
      ) : null}

      <div className={cn("grid grid-cols-2 gap-3", summaryItems.length > 0 ? "mt-3" : "")}>
        {actions.map((action) => (
          <ActionButton
            key={action.label}
            label={action.label}
            onClick={action.onClick}
            disabled={action.disabled}
          />
        ))}
      </div>

      <div className="mt-3 border-b border-[color:var(--jp-border)]">
        <div
          className="grid"
          style={{ gridTemplateColumns: `repeat(${Math.max(tabs.length, 1)}, minmax(0, 1fr))` }}
        >
          {tabs.map((tab) =>
            tab.active ? (
              <div
                key={tab.label}
                className="flex min-h-12 items-center justify-center border-b-2 border-[color:var(--jp-accent)] px-3 py-3 text-center"
              >
                <span className="text-sm font-semibold text-[var(--jp-accent)]">
                  {tab.label}
                </span>
              </div>
            ) : (
              <StaticLink
                key={tab.label}
                href={tab.href}
                className="flex min-h-12 items-center justify-center px-3 py-3 text-center"
              >
                <span className="text-sm text-[var(--jp-text-muted)]">{tab.label}</span>
              </StaticLink>
            ),
          )}
        </div>
      </div>

      <SearchField
        value={searchValue}
        onChange={onSearchChange}
        placeholder={searchPlaceholder}
        className="mt-3 bg-[var(--jp-surface-muted)]"
      />
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
  disabled,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex h-11 min-w-0 items-center justify-center gap-1.5 rounded-[12px] px-3 text-[12px] font-medium transition-[transform,background-color,box-shadow,color] duration-200",
        disabled
          ? "cursor-not-allowed bg-[#F5F3F0] text-[var(--jp-text-muted)]"
          : "bg-[var(--jp-surface-muted)] text-[var(--jp-text)] hover:-translate-y-[1px] hover:bg-[#FBF7F1] hover:shadow-[0_10px_18px_rgba(28,28,28,0.05)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--jp-accent)]/20 active:translate-y-0",
      )}
    >
      <Copy
        className={cn(
          "size-4 shrink-0",
          disabled ? "text-[var(--jp-text-muted)]" : "text-[var(--jp-accent)]",
        )}
      />
      <span className="min-w-0 truncate whitespace-nowrap">{label}</span>
    </button>
  );
}
