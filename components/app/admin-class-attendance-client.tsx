"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

import { getAttendanceSummary } from "@/lib/domain/attendance";
import type { AdminClassAttendanceData, AttendanceStatus } from "@/lib/domain/types";
import { AdminSubpageHeader } from "@/components/app/admin-subpage-header";
import { MobileTabBar } from "@/components/app/mobile-tab-bar";
import { PageShell } from "@/components/app/page-shell";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type AdminClassAttendanceClientProps = {
  data: AdminClassAttendanceData;
};

export function AdminClassAttendanceClient({
  data,
}: AdminClassAttendanceClientProps) {
  const [students, setStudents] = useState(data.students);
  const summary = getAttendanceSummary(students);

  function handleStatusChange(studentId: string, nextStatus: AttendanceStatus) {
    setStudents((current) =>
      current.map((student) => {
        if (student.id !== studentId) {
          return student;
        }

        const sourceStudent = data.students.find((item) => item.id === student.id) ?? student;
        const managerUpdated =
          Boolean(sourceStudent.managerUpdated) || nextStatus !== sourceStudent.status;

        return {
          ...student,
          status: nextStatus,
          managerUpdated,
          overrideLabel: undefined,
        };
      }),
    );
  }

  return (
    <PageShell>
      <div className="app-screen">
        <div className="app-scroll">
          <AdminSubpageHeader title={data.title} backHref="/admin/control" />

          <div className="px-5 pb-1 pt-3">
            <div className="flex flex-wrap gap-1.5">
              <SummaryChip label="应到" value={summary.expected} tone="info" />
              <SummaryChip label="已到" value={summary.present} tone="success" />
              <SummaryChip label="请假" value={summary.leave} tone="neutral" />
              <SummaryChip label="未到" value={summary.absent} tone="danger" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 px-5 py-3.5">
            {students.map((student) => {
              const tone = student.managerUpdated
                ? {
                    badge: "bg-[#FFF4EA] text-[#9A5A1F]",
                  }
                : student.status === "present"
                    ? {
                        badge: "bg-[#EAF2EC] text-[#3D6B4F]",
                      }
                    : student.status === "leave"
                      ? {
                          badge: "bg-[#ECE8E1] text-[#1C1C1C]",
                        }
                      : {
                          badge: "bg-[#FCEBEC] text-[#D32F2F]",
                        };

              return (
                <article
                  key={student.id}
                  className={cn(
                    "flex min-h-[108px] flex-col rounded-[14px] border p-2.5 shadow-[0_8px_18px_rgba(28,28,28,0.03)]",
                    student.managerUpdated
                      ? "border-[#E59A52] bg-[#FFFDF8]"
                      : "border-[#E8E5E0] bg-white",
                  )}
                >
                  <div className="space-y-1">
                    <p className="text-[13px] font-semibold text-[var(--jp-text)]">
                      {student.name}
                    </p>
                    <p className="text-[11px] text-[var(--jp-text-secondary)]">
                      {student.homeroomClass}
                    </p>
                  </div>
                  <label className={cn("relative mt-auto block rounded-[8px]", tone.badge)}>
                    <select
                      aria-label={`${student.name} 点名状态`}
                      value={student.status}
                      onChange={(event) =>
                        handleStatusChange(student.id, event.target.value as AttendanceStatus)
                      }
                      className="h-8 w-full appearance-none rounded-[8px] bg-transparent px-2 pr-7 text-[11px] font-medium outline-none"
                    >
                      <option value="present">已到</option>
                      <option value="leave">请假</option>
                      <option value="absent">未到</option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-2 top-1/2 size-3.5 -translate-y-1/2" />
                  </label>
                </article>
              );
            })}
          </div>
          <div className="app-bottom-safe border-t border-[color:var(--jp-border)] bg-white px-5 pb-8 pt-3">
            <p className="text-[11px] font-medium text-[var(--jp-text-muted)]">
              已选 0 人 · 批量完成点名
            </p>
            <Button
              variant="outline"
              className="mt-2 h-12 w-full rounded-[12px] border-0 bg-[#F5F3F0] text-[15px] font-medium text-[var(--jp-text-secondary)] hover:bg-[#F5F3F0]"
            >
              批量完成点名
            </Button>
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
