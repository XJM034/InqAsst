"use client";

import { useState } from "react";
import { Check, ChevronDown } from "lucide-react";

import { getAttendanceSummary } from "@/lib/domain/attendance";
import type { AdminClassAttendanceData, AttendanceStatus } from "@/lib/domain/types";
import { AdminSubpageHeader } from "@/components/app/admin-subpage-header";
import { MobileTabBar } from "@/components/app/mobile-tab-bar";
import { PageShell } from "@/components/app/page-shell";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type AdminClassAttendanceClientProps = {
  data: AdminClassAttendanceData;
};

export function AdminClassAttendanceClient({
  data,
}: AdminClassAttendanceClientProps) {
  const [students, setStudents] = useState(data.students);
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const summary = getAttendanceSummary(students);

  function toUpdatedStudent(
    student: (typeof data.students)[number],
    nextStatus: AttendanceStatus,
  ) {
    const sourceStudent = data.students.find((item) => item.id === student.id) ?? student;
    const managerUpdated =
      Boolean(sourceStudent.managerUpdated) || nextStatus !== sourceStudent.status;

    return {
      ...student,
      status: nextStatus,
      managerUpdated,
      overrideLabel: undefined,
    };
  }

  function handleStatusChange(studentId: string, nextStatus: AttendanceStatus) {
    setStudents((current) =>
      current.map((student) =>
        student.id === studentId ? toUpdatedStudent(student, nextStatus) : student,
      ),
    );
  }

  function handleBulkStatusChange(nextStatus: AttendanceStatus) {
    setStudents((current) =>
      current.map((student) =>
        selectedStudentIds.includes(student.id) ? toUpdatedStudent(student, nextStatus) : student,
      ),
    );
    setSelectedStudentIds([]);
    setBulkDialogOpen(false);
  }

  function toggleStudentSelection(studentId: string) {
    setSelectedStudentIds((current) =>
      current.includes(studentId)
        ? current.filter((id) => id !== studentId)
        : [...current, studentId],
    );
  }

  function exitSelectionMode() {
    setSelectionMode(false);
    setSelectedStudentIds([]);
    setBulkDialogOpen(false);
  }

  return (
    <PageShell>
      <Dialog open={bulkDialogOpen} onOpenChange={setBulkDialogOpen}>
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
                const isSelected = selectedStudentIds.includes(student.id);
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
                    role={selectionMode ? "button" : undefined}
                    tabIndex={selectionMode ? 0 : undefined}
                    onClick={
                      selectionMode ? () => toggleStudentSelection(student.id) : undefined
                    }
                    onKeyDown={
                      selectionMode
                        ? (event) => {
                            if (event.key === "Enter" || event.key === " ") {
                              event.preventDefault();
                              toggleStudentSelection(student.id);
                            }
                          }
                        : undefined
                    }
                    className={cn(
                      "relative flex min-h-[108px] flex-col rounded-[14px] border p-2.5 shadow-[0_8px_18px_rgba(28,28,28,0.03)]",
                      student.managerUpdated
                        ? "border-[#E59A52] bg-[#FFFDF8]"
                        : "border-[#E8E5E0] bg-white",
                      selectionMode ? "cursor-pointer" : "",
                      selectionMode && isSelected
                        ? "ring-2 ring-[#1E3A5F] ring-offset-1"
                        : "",
                    )}
                  >
                    {selectionMode ? (
                      <div
                        className={cn(
                          "absolute right-2 top-2 flex size-5 items-center justify-center rounded-full border",
                          isSelected
                            ? "border-[#1E3A5F] bg-[#1E3A5F] text-white"
                            : "border-[#D7DCE2] bg-white text-transparent",
                        )}
                      >
                        <Check className="size-3" />
                      </div>
                    ) : null}

                    <div className="space-y-1 pr-5">
                      <p className="text-[13px] font-semibold text-[var(--jp-text)]">
                        {student.name}
                      </p>
                      <p className="text-[11px] text-[var(--jp-text-secondary)]">
                        {student.homeroomClass}
                      </p>
                    </div>
                    {selectionMode ? (
                      <div
                        className={cn(
                          "mt-auto flex h-8 items-center justify-center rounded-[8px] text-[11px] font-medium",
                          tone.badge,
                        )}
                      >
                        {student.status === "present"
                          ? "已到"
                          : student.status === "leave"
                            ? "请假"
                            : "未到"}
                      </div>
                    ) : (
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
                    )}
                  </article>
                );
              })}
            </div>
          </div>

          <div className="app-bottom-safe border-t border-[color:var(--jp-border)] bg-white px-5 pt-3">
            {selectionMode ? (
              <>
                <p className="text-[11px] font-medium text-[var(--jp-text-muted)]">
                  {selectedStudentIds.length > 0
                    ? `已选择 ${selectedStudentIds.length} 人，可批量切换状态`
                    : "点击学生卡片，选择本次要批量修改的学生"}
                </p>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    className="h-11 rounded-[12px] border-0 bg-[#F5F3F0] text-[15px] font-medium text-[var(--jp-text-secondary)] hover:bg-[#F5F3F0]"
                    onClick={exitSelectionMode}
                  >
                    取消选择
                  </Button>
                  <DialogTrigger asChild>
                    <Button
                      disabled={selectedStudentIds.length === 0}
                      className="h-11 rounded-[12px] bg-[#1E3A5F] text-[15px] font-semibold text-white hover:bg-[#1E3A5F]/90 disabled:bg-[#CAD4E1] disabled:text-white"
                    >
                      批量修改状态
                    </Button>
                  </DialogTrigger>
                </div>
              </>
            ) : (
              <>
                <p className="text-[11px] font-medium text-[var(--jp-text-muted)]">
                  先选择一批学生，再批量切换为已到、请假或未到
                </p>
                <Button
                  className="mt-2 h-11 w-full rounded-[12px] bg-[#1E3A5F] text-[15px] font-semibold text-white hover:bg-[#1E3A5F]/90"
                  onClick={() => setSelectionMode(true)}
                >
                  批量选择学生
                </Button>
              </>
            )}
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

        <DialogContent className="max-w-[320px] gap-4 rounded-[16px] border-0 bg-white p-6 shadow-none ring-0">
          <div className="space-y-2.5">
            <DialogTitle className="text-[18px] font-semibold text-[#1E3A5F]">
              批量完成点名
            </DialogTitle>
            <DialogDescription className="text-sm leading-6 text-[#666666]">
              {selectedStudentIds.length > 0
                ? `已选择 ${selectedStudentIds.length} 人，请选择要批量切换到的点名状态。`
                : "请选择要批量切换到的点名状态。"}
            </DialogDescription>
          </div>

          <div className="grid gap-2">
            <Button
              className="h-11 rounded-[10px] bg-[#EAF2EC] text-[15px] font-semibold text-[#3D6B4F] hover:bg-[#EAF2EC]"
              onClick={() => handleBulkStatusChange("present")}
            >
              批量设为已到
            </Button>
            <Button
              className="h-11 rounded-[10px] bg-[#ECE8E1] text-[15px] font-semibold text-[#1C1C1C] hover:bg-[#ECE8E1]"
              onClick={() => handleBulkStatusChange("leave")}
            >
              批量设为请假
            </Button>
            <Button
              className="h-11 rounded-[10px] bg-[#FCEBEC] text-[15px] font-semibold text-[#D32F2F] hover:bg-[#FCEBEC]"
              onClick={() => handleBulkStatusChange("absent")}
            >
              批量设为未到
            </Button>
          </div>
        </DialogContent>
      </Dialog>
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
