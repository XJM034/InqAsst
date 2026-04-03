"use client";

import { useState } from "react";
import { Copy } from "lucide-react";

import { AdminAttendanceTopTools } from "@/components/app/admin-attendance-top-tools";
import { MobileTabBar } from "@/components/app/mobile-tab-bar";
import { PageTitleBlock } from "@/components/app/page-title-block";
import { PageShell } from "@/components/app/page-shell";
import type { AdminUnarrivedData } from "@/lib/domain/types";

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

          <AdminAttendanceTopTools
            summaryItems={[
              { label: "应到", value: data.totals.expected, tone: "info" },
              { label: "已到", value: data.totals.present, tone: "success" },
              { label: "请假", value: data.totals.leave, tone: "neutral" },
              { label: "未到", value: data.totals.absent, tone: "danger" },
            ]}
            actions={[
              {
                label: "复制未完成班级",
                onClick: () => copyText(unfinishedText, "未完成班级"),
              },
              {
                label: "复制未到学生",
                onClick: () => copyText(absentText, "未到学生"),
              },
            ]}
            tabs={[
              { label: "班级列表", href: "/admin/control" },
              { label: "未到学生列表", href: "/admin/unarrived", active: true },
            ]}
            searchPlaceholder="搜索学生姓名..."
          />

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
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {group.students.map((student) => (
                    <article
                      key={student.id}
                      className="flex min-h-[96px] flex-col rounded-[14px] border border-[#E8E5E0] bg-white px-2.5 py-2.5 shadow-[0_8px_18px_rgba(28,28,28,0.03)]"
                    >
                      <div className="space-y-1">
                        <p className="text-[13px] font-semibold text-[var(--jp-text)]">
                          {student.name}
                        </p>
                        <p className="text-[10px] leading-4 text-[var(--jp-text-secondary)]">
                          {student.course}
                        </p>
                      </div>
                      <div className="mt-auto flex h-7 shrink-0 items-center justify-center rounded-full bg-[#FCEBEC] px-2.5 text-[10px] font-semibold text-[#D32F2F]">
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
