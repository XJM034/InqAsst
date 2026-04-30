"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, ChevronDown } from "lucide-react";

import { buildAdminControlBackHref, buildAdminTabItems } from "@/lib/admin-campus";
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
import {
  fetchAdminAttendanceRoster,
  submitAdminAttendance,
} from "@/lib/services/mobile-client";

type AdminClassAttendanceClientProps = {
  data: AdminClassAttendanceData;
  campus: string;
};

type AdminEditableAttendanceStatus = Exclude<AttendanceStatus, "unmarked">;

const ADMIN_ROLL_CALL_DEBUG_PREFIX = "[AdminRollCallDebug]";

function debugAdminRollCall(event: string, payload?: unknown) {
  if (typeof window === "undefined") {
    return;
  }

  if (typeof payload === "undefined") {
    console.log(`${ADMIN_ROLL_CALL_DEBUG_PREFIX} ${event}`);
    return;
  }

  console.log(`${ADMIN_ROLL_CALL_DEBUG_PREFIX} ${event}`, payload);
}

function buildStudentStatusKey(students: AdminClassAttendanceData["students"]) {
  return students.map((student) => `${student.id}:${student.status}`).join("|");
}

function getAdminAttendanceTone(
  status: AttendanceStatus,
  managerUpdated?: boolean,
) {
  if (managerUpdated) {
    return "bg-[#FFF4EA] text-[#9A5A1F]";
  }

  if (status === "present") {
    return "bg-[#EAF2EC] text-[#3D6B4F]";
  }

  if (status === "leave") {
    return "bg-[#FFF4EA] text-[#C46A1A]";
  }

  if (status === "unmarked") {
    return "bg-[#F5F3F0] text-[var(--jp-text-muted)]";
  }

  return "bg-[#FCEBEC] text-[#D32F2F]";
}

function getAdminAttendanceStatusLabel(status: AttendanceStatus) {
  if (status === "present") {
    return "已到";
  }

  if (status === "leave") {
    return "请假";
  }

  if (status === "unmarked") {
    return "未点名";
  }

  return "未到";
}

export function AdminClassAttendanceClient({
  data,
  campus,
}: AdminClassAttendanceClientProps) {
  const [students, setStudents] = useState(data.students);
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [feedback, setFeedback] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const summary = getAttendanceSummary(students);
  const studentStatusKey = useMemo(() => buildStudentStatusKey(students), [students]);
  const courseId = data.courseId;

  useEffect(() => {
    setStudents(data.students);
    setSelectionMode(false);
    setSelectedStudentIds([]);
    setBulkDialogOpen(false);
    setFeedback("");
  }, [data.students]);

  useEffect(() => {
    if (!courseId || isSaving || selectionMode || bulkDialogOpen) {
      debugAdminRollCall("admin.class.poll.skip", {
        courseId,
        courseSessionId: data.courseSessionId,
        isSaving,
        selectionMode,
        bulkDialogOpen,
      });
      return;
    }

    let cancelled = false;
    debugAdminRollCall("admin.class.poll.ready", {
      courseId,
      courseSessionId: data.courseSessionId,
      studentCount: students.length,
      summary,
    });

    const intervalId = window.setInterval(async () => {
      debugAdminRollCall("admin.class.poll.start", {
        courseId,
        courseSessionId: data.courseSessionId,
      });

      try {
        const nextStudents = await fetchAdminAttendanceRoster({
          courseId,
          courseSessionId: data.courseSessionId,
        });

        if (cancelled) {
          return;
        }

        const nextStudentStatusKey = buildStudentStatusKey(nextStudents);
        if (nextStudentStatusKey !== studentStatusKey) {
          debugAdminRollCall("admin.class.poll.changed", {
            courseId,
            courseSessionId: data.courseSessionId,
            previousSummary: summary,
            nextSummary: getAttendanceSummary(nextStudents),
          });
          setStudents(nextStudents);
          setFeedback("");
          return;
        }

        debugAdminRollCall("admin.class.poll.nochange", {
          courseId,
          courseSessionId: data.courseSessionId,
          summary,
        });
      } catch (error) {
        debugAdminRollCall("admin.class.poll.error", {
          courseId,
          courseSessionId: data.courseSessionId,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }, 10_000);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, [
    bulkDialogOpen,
    courseId,
    data.courseSessionId,
    isSaving,
    selectionMode,
    studentStatusKey,
  ]);

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

  async function persistStudents(
    nextStudents: typeof data.students,
    previousStudents: typeof data.students,
    submittedStudents: typeof data.students,
  ) {
    setStudents(nextStudents);

    if (!data.courseId) {
      return;
    }

    setFeedback("");
    setIsSaving(true);

    try {
      await submitAdminAttendance({
        courseId: data.courseId,
        courseSessionId: data.courseSessionId,
        students: submittedStudents,
      });
      setFeedback("点名状态已同步");
    } catch (error) {
      // Preserve the backend rule message so admins know the exact editable time range.
      if (error instanceof Error) {
        setStudents(previousStudents);
        setFeedback(error.message);
        return;
      }
      setStudents(previousStudents);
      setFeedback("同步失败，请稍后重试");
    } finally {
      setIsSaving(false);
    }
  }

  function handleStatusChange(studentId: string, nextStatus: AdminEditableAttendanceStatus) {
    const previousStudents = students;
    const nextStudents = students.map((student) =>
      student.id === studentId ? toUpdatedStudent(student, nextStatus) : student,
    );
    const submittedStudents = nextStudents.filter((student) => student.id === studentId);

    void persistStudents(nextStudents, previousStudents, submittedStudents);
  }

  function handleBulkStatusChange(nextStatus: AdminEditableAttendanceStatus) {
    const previousStudents = students;
    const nextStudents = students.map((student) =>
      selectedStudentIds.includes(student.id) ? toUpdatedStudent(student, nextStatus) : student,
    );
    const submittedStudents = nextStudents.filter((student) =>
      selectedStudentIds.includes(student.id),
    );
    setSelectedStudentIds([]);
    setBulkDialogOpen(false);
    void persistStudents(nextStudents, previousStudents, submittedStudents);
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
            <AdminSubpageHeader title={data.title} backHref={buildAdminControlBackHref(campus)} />

            <div className="px-5 pb-1 pt-3">
              <div className="flex flex-wrap gap-1.5">
                <SummaryChip label="应到" value={summary.expected} tone="info" />
                <SummaryChip label="已到" value={summary.present} tone="success" />
                <SummaryChip label="请假" value={summary.leave} tone="neutral" />
                <SummaryChip label="未点名" value={summary.unmarked} tone="muted" />
                <SummaryChip label="未到" value={summary.absent} tone="danger" />
              </div>
              {feedback ? (
                <p className="mt-2 text-[11px] font-medium text-[var(--jp-accent)]">{feedback}</p>
              ) : null}
            </div>

            {students.length === 0 ? (
              <div className="px-5 py-3.5">
                <div className="rounded-[14px] border border-[#E8E5E0] bg-white px-4 py-8 text-center text-[13px] text-[var(--jp-text-muted)]">
                  当前暂无可展示的学生名单
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-3 px-5 py-3.5">
                {students.map((student) => {
                  const isSelected = selectedStudentIds.includes(student.id);
                  const badgeTone = getAdminAttendanceTone(
                    student.status,
                    student.managerUpdated,
                  );

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
                            badgeTone,
                          )}
                        >
                          {getAdminAttendanceStatusLabel(student.status)}
                        </div>
                      ) : (
                        <label className={cn("relative mt-auto block rounded-[8px]", badgeTone)}>
                          <select
                            aria-label={`${student.name} 点名状态`}
                            value={student.status}
                            disabled={isSaving}
                            onChange={(event) =>
                              handleStatusChange(
                                student.id,
                                event.target.value as AdminEditableAttendanceStatus,
                              )
                            }
                            className="h-8 w-full appearance-none rounded-[8px] bg-transparent px-2 pr-7 text-[11px] font-medium outline-none"
                          >
                            {/* 管理端可展示全部状态，但只允许改成已到/请假/未到，未点名仅保留为展示态。 */}
                            <option value="unmarked" disabled>
                              未点名（仅展示）
                            </option>
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
            )}
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
                  状态可改：已到、请假、未到；未点名仅展示，不可直接改回
                </p>
                <Button
                  disabled={isSaving || students.length === 0}
                  className="mt-2 h-11 w-full rounded-[12px] bg-[#1E3A5F] text-[15px] font-semibold text-white hover:bg-[#1E3A5F]/90"
                  onClick={() => setSelectionMode(true)}
                >
                  {isSaving ? "同步中" : "批量选择学生"}
                </Button>
              </>
            )}
          </div>

          <MobileTabBar active="attendance" items={buildAdminTabItems(campus)} />
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
  tone: "info" | "success" | "neutral" | "muted" | "danger";
}) {
  const toneClass = {
    info: "bg-[#1E3A5F10] text-[#1E3A5F]",
    success: "bg-[#3d6b4f1a] text-[#3D6B4F]",
    neutral: "bg-[#FFF4EA] text-[#C46A1A]",
    muted: "bg-[#F5F3F0] text-[var(--jp-text-muted)]",
    danger: "bg-[#d52f2f1a] text-[#D32F2F]",
  }[tone];

  return (
    <div className={cn("flex items-center gap-1.5 rounded-full px-3 py-1.5", toneClass)}>
      <span className="text-[13px] font-medium">{label}</span>
      <span className="text-[13px] font-bold">{value}</span>
    </div>
  );
}
