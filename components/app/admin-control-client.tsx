"use client";

import Link from "next/link";
import { useState } from "react";
import { Copy, Search } from "lucide-react";

import { MobileTabBar } from "@/components/app/mobile-tab-bar";
import { PageTitleBlock } from "@/components/app/page-title-block";
import { PageShell } from "@/components/app/page-shell";
import type { AdminControlData } from "@/lib/domain/types";
import { cn } from "@/lib/utils";

type AdminControlClientProps = {
  data: AdminControlData;
};

export function AdminControlClient({ data }: AdminControlClientProps) {
  const [feedback, setFeedback] = useState("");

  async function copyText(text: string, label: string) {
    try {
      await navigator.clipboard.writeText(text);
      setFeedback(`${label}已复制`);
    } catch {
      setFeedback("当前环境不支持自动复制");
    }
  }

  const unfinishedText = data.classes
    .filter((item) => item.state !== "done")
    .map((item) => `${item.name} / ${item.teacher}`)
    .join("\n");

  const absentText = data.classes
    .map((item) => `${item.name} · ${item.progressLabel}`)
    .join("\n");

  return (
    <PageShell>
      <div className="app-screen">
        <div className="app-scroll px-5 pt-4">
          <PageTitleBlock title="点名总控" subtitle={data.dateLabel} />

          <div className="mt-3.5 flex flex-wrap gap-2">
            <SummaryChip
              label="已完成"
              value={String(data.finishedCount)}
              tone="success"
            />
            <SummaryChip
              label="未完成"
              value={String(data.unfinishedCount)}
              tone="danger"
            />
          </div>

          <div className="mt-3.5 grid grid-cols-2 gap-3">
            <ActionButton
              label="复制未完成班级"
              onClick={() => copyText(unfinishedText, "未完成班级")}
            />
            <ActionButton
              label="复制未到学生"
              onClick={() => copyText(absentText, "未到学生")}
            />
          </div>

          <div className="mt-4 border-b border-[color:var(--jp-border)]">
            <div className="flex">
              <div className="border-b-2 border-[color:var(--jp-accent)] px-3 py-3">
                <span className="text-sm font-semibold text-[var(--jp-accent)]">
                  班级列表
                </span>
              </div>
              <Link href="/admin/unarrived" className="px-3 py-3">
                <span className="text-sm text-[var(--jp-text-muted)]">未到学生列表</span>
              </Link>
            </div>
          </div>

          <div className="mt-3.5 flex h-10 items-center gap-3 rounded-[12px] bg-[var(--jp-surface)] px-4 text-[13px] text-[var(--jp-text-muted)] ring-1 ring-[color:var(--jp-border)]">
            <Search className="size-4" />
            <span>搜索班级名称或老师</span>
          </div>

          {feedback ? (
            <p className="mt-3 text-xs font-medium text-[var(--jp-accent)]">{feedback}</p>
          ) : null}

          <div className="mt-3.5 grid grid-cols-2 gap-3">
            {data.classes.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className="rounded-[16px] border border-[#E8E5E0] bg-white p-3 shadow-[0_10px_22px_rgba(28,28,28,0.04)]"
              >
                <div className="space-y-1">
                  <p className="text-[13px] font-medium text-[var(--jp-text)]">
                    {item.name}
                  </p>
                  <p className="text-xs text-[var(--jp-text-secondary)]">{item.teacher}</p>
                </div>
                <div className="mt-4 space-y-2">
                  <p className="text-xs text-[var(--jp-text-muted)]">{item.progressLabel}</p>
                  <div
                    className={cn(
                      "h-2 rounded-full bg-[#E8E5E0]",
                      item.state === "pending" && "bg-[#f2e4d5]",
                    )}
                  >
                    <div
                      className={cn(
                        "h-full rounded-full",
                        item.state === "done" && "bg-[#3D6B4F]",
                        item.state === "partial" && "bg-[#C98332]",
                        item.state === "pending" && "bg-[#D32F2F]",
                      )}
                      style={{ width: `${item.completion}%` }}
                    />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <MobileTabBar
          active="attendance"
          items={[
            { key: "home", href: "/admin/home" },
            { key: "attendance", href: "/admin/control" },
            { key: "profile", href: "/admin/me" },
          ]}
        />
      </div>
    </PageShell>
  );
}

function SummaryChip({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "success" | "danger";
}) {
  const toneClass =
    tone === "success"
      ? "bg-[#3d6b4f1a] text-[#3D6B4F]"
      : "bg-[#d52f2f1a] text-[#D32F2F]";

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
      className="flex h-11 items-center gap-2 rounded-[12px] bg-[var(--jp-surface)] px-4 text-left text-[12px] font-medium text-[var(--jp-text)] ring-1 ring-[color:var(--jp-border)]"
    >
      <Copy className="size-4 text-[var(--jp-accent)]" />
      <span>{label}</span>
    </button>
  );
}
