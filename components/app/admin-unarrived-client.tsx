"use client";

import Link from "next/link";
import { useState } from "react";
import { Copy, Search } from "lucide-react";

import { MobileTabBar } from "@/components/app/mobile-tab-bar";
import { PageTitleBlock } from "@/components/app/page-title-block";
import { PageShell } from "@/components/app/page-shell";
import type { AdminUnarrivedData } from "@/lib/domain/types";
import { cn } from "@/lib/utils";

type AdminUnarrivedClientProps = {
  data: AdminUnarrivedData;
};

export function AdminUnarrivedClient({ data }: AdminUnarrivedClientProps) {
  const [feedback, setFeedback] = useState("");

  async function copyText(text: string, label: string) {
    try {
      await navigator.clipboard.writeText(text);
      setFeedback(`${label}已复制`);
    } catch {
      setFeedback("当前环境不支持自动复制");
    }
  }

  const unfinishedText = data.groups
    .map((group) => `${group.label}：${group.students.length} 人未到`)
    .join("\n");

  const absentText = data.groups
    .flatMap((group) =>
      group.students.map((student) => `${group.label}：${student.name}（${student.course}）`),
    )
    .join("\n");

  return (
    <PageShell>
      <div className="app-screen">
        <div className="app-scroll px-5 pt-4">
          <PageTitleBlock title="未到学生" subtitle={data.dateLabel} />

          <div className="mt-3.5 flex flex-wrap gap-1.5">
            <MetricChip label="应到" value={data.totals.expected} tone="info" />
            <MetricChip label="已到" value={data.totals.present} tone="success" />
            <MetricChip label="请假" value={data.totals.leave} tone="neutral" />
            <MetricChip label="未到" value={data.totals.absent} tone="danger" />
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
              <Link href="/admin/control" className="px-3 py-3">
                <span className="text-sm text-[var(--jp-text-muted)]">班级列表</span>
              </Link>
              <div className="border-b-2 border-[color:var(--jp-accent)] px-3 py-3">
                <span className="text-sm font-semibold text-[var(--jp-accent)]">
                  未到学生列表
                </span>
              </div>
            </div>
          </div>

          <div className="mt-3.5 flex h-10 items-center gap-3 rounded-[12px] bg-[var(--jp-surface)] px-4 text-sm text-[var(--jp-text-muted)] ring-1 ring-[color:var(--jp-border)]">
            <Search className="size-5" />
            <span>搜索学生姓名...</span>
          </div>

          {feedback ? (
            <p className="mt-3 text-xs font-medium text-[var(--jp-accent)]">{feedback}</p>
          ) : null}

          <div className="mt-3.5 space-y-4">
            {data.groups.map((group) => (
              <section
                key={group.id}
                className="rounded-[16px] border border-[#E8E5E0] bg-white p-3 shadow-[0_10px_22px_rgba(28,28,28,0.04)]"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-[var(--jp-text)]">
                    {group.label}
                  </h2>
                  <div className="flex items-center gap-2">
                    <div className="rounded-full bg-[#F5F3F0] px-2.5 py-1 text-[11px] font-semibold text-[var(--jp-text-secondary)]">
                      {group.students.length} 人
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        copyText(
                          group.students
                            .map((student) => `${student.name}（${student.course}）`)
                            .join("\n"),
                          `${group.label}名单`,
                        )
                      }
                      className="flex size-8 items-center justify-center rounded-[8px] bg-[#F5F3F0] text-[var(--jp-text-secondary)]"
                    >
                      <Copy className="size-4" />
                    </button>
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  {group.students.map((student) => (
                    <article
                      key={student.id}
                      className="rounded-[14px] border border-[#E8E5E0] bg-[var(--jp-surface)] px-3 py-3 shadow-[0_8px_18px_rgba(28,28,28,0.03)]"
                    >
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-[var(--jp-text)]">
                          {student.name}
                        </p>
                        <p className="text-xs text-[var(--jp-text-secondary)]">
                          {student.course}
                        </p>
                      </div>
                      <div className="mt-3 inline-flex rounded-[8px] bg-[#FCEBEC] px-2.5 py-1 text-xs font-semibold text-[#D32F2F]">
                        未到
                      </div>
                    </article>
                  ))}
                </div>
              </section>
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

function MetricChip({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "info" | "success" | "neutral" | "danger";
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
      className="flex h-11 items-center gap-2 rounded-[12px] bg-[var(--jp-surface)] px-4 text-left text-[12px] font-medium text-[var(--jp-text)] ring-1 ring-[color:var(--jp-border)]"
    >
      <Copy className="size-4 text-[var(--jp-accent)]" />
      <span>{label}</span>
    </button>
  );
}
