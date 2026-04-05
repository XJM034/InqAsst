"use client";

import { useState } from "react";
import { ChevronDown, Copy } from "lucide-react";

import { AdminAttendanceTopTools } from "@/components/app/admin-attendance-top-tools";
import { MobileTabBar } from "@/components/app/mobile-tab-bar";
import { PageTitleBlock } from "@/components/app/page-title-block";
import { PageShell } from "@/components/app/page-shell";
import { getAttendanceSummary } from "@/lib/domain/attendance";
import type { AdminUnarrivedData, AttendanceStatus } from "@/lib/domain/types";
import { cn } from "@/lib/utils";

type AdminUnarrivedClientProps = {
  data: AdminUnarrivedData;
};

export function AdminUnarrivedClient({ data }: AdminUnarrivedClientProps) {
  const [feedback, setFeedback] = useState("");
  const [groups, setGroups] = useState(data.groups);
  const summary = getAttendanceSummary(
    groups.flatMap((group) =>
      group.students.map((student) => ({
        id: student.id,
        name: student.name,
        homeroomClass: group.label,
        status: student.status,
        managerUpdated: student.managerUpdated,
      })),
    ),
  );

  async function copyText(text: string, label: string) {
    try {
      await navigator.clipboard.writeText(text);
      setFeedback(`${label}已复制`);
    } catch {
      setFeedback("当前环境不支持自动复制");
    }
  }

  function handleStatusChange(groupId: string, studentId: string, nextStatus: AttendanceStatus) {
    setGroups((current) =>
      current.map((group) => {
        if (group.id !== groupId) {
          return group;
        }

        return {
          ...group,
          students: group.students.map((student) => {
            if (student.id !== studentId) {
              return student;
            }

            const sourceGroup = data.groups.find((item) => item.id === groupId);
            const sourceStudent =
              sourceGroup?.students.find((item) => item.id === studentId) ?? student;
            const managerUpdated =
              Boolean(sourceStudent.managerUpdated) || nextStatus !== sourceStudent.status;

            return {
              ...student,
              status: nextStatus,
              managerUpdated,
              overrideLabel: undefined,
            };
          }),
        };
      }),
    );
  }

  const unfinishedText = groups
    .map((group) => `${group.label}：${group.students.length} 人未到`)
    .join("\n");

  const absentText = groups
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
              { label: "应到", value: summary.expected, tone: "info" },
              { label: "已到", value: summary.present, tone: "success" },
              { label: "请假", value: summary.leave, tone: "neutral" },
              { label: "未到", value: summary.absent, tone: "danger" },
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
            {groups.map((group) => (
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
                        <p className="text-[10px] leading-4 text-[var(--jp-text-secondary)]">
                          {student.course}
                        </p>
                      </div>
                      <label
                        className={cn(
                          "relative mt-auto block rounded-[8px]",
                          student.managerUpdated
                            ? "bg-[#FFF4EA] text-[#9A5A1F]"
                            : student.status === "present"
                              ? "bg-[#EAF2EC] text-[#3D6B4F]"
                              : student.status === "leave"
                                ? "bg-[#ECE8E1] text-[#1C1C1C]"
                                : "bg-[#FCEBEC] text-[#D32F2F]",
                        )}
                      >
                        <select
                          aria-label={`${student.name} 点名状态`}
                          value={student.status}
                          onChange={(event) =>
                            handleStatusChange(
                              group.id,
                              student.id,
                              event.target.value as AttendanceStatus,
                            )
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
