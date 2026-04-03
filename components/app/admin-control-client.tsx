"use client";

import Link from "next/link";
import { useState } from "react";

import { AdminAttendanceTopTools } from "@/components/app/admin-attendance-top-tools";
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

          <AdminAttendanceTopTools
            summaryItems={[
              { label: "已完成", value: data.finishedCount, tone: "success" },
              { label: "未完成", value: data.unfinishedCount, tone: "danger" },
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
              { label: "班级列表", href: "/admin/control", active: true },
              { label: "未到学生列表", href: "/admin/unarrived" },
            ]}
            searchPlaceholder="搜索班级名称或老师"
          />

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
