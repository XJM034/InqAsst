"use client";

import type {
  AdminRollCallTeacherBatchConflict,
  AdminRollCallTeacherBatchData,
} from "@/lib/domain/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Props = {
  open: boolean;
  data: AdminRollCallTeacherBatchData | null;
  loading?: boolean;
  submitting?: boolean;
  error?: string;
  assignments: Record<string, string>;
  conflictsBySessionId: Record<string, AdminRollCallTeacherBatchConflict[]>;
  onOpenChange: (open: boolean) => void;
  onAssignmentChange: (courseSessionId: string, teacherId: string) => void;
  onSubmit: () => void;
};

function resolveCourseStatus(
  course: NonNullable<AdminRollCallTeacherBatchData>["courses"][number],
  teacherId: string,
  conflicts: AdminRollCallTeacherBatchConflict[],
) {
  if (conflicts.length > 0) {
    return {
      label: conflicts[0]?.message ?? "排课冲突，请调整后重试",
      tone: "border-[#F2D4D4] bg-[#FFF1F1] text-[#9F3A38]",
    };
  }

  if (!teacherId) {
    return {
      label: "请选择提交后的目标老师",
      tone: "border-[#E7E2DB] bg-[#F8F5F0] text-[var(--jp-text-secondary)]",
    };
  }

  if (teacherId === course.defaultTeacherId) {
    return {
      label: "提交后恢复默认老师",
      tone: "border-[#D6E4F1] bg-[#EEF4FA] text-[#1E3A5F]",
    };
  }

  if (teacherId === course.currentTeacherId && !course.currentTeacherExternal) {
    return {
      label: "保持当前点名老师",
      tone: "border-[#E7E2DB] bg-[#F8F5F0] text-[var(--jp-text-secondary)]",
    };
  }

  const selectedTeacher = course.teacherOptions.find((item) => item.id === teacherId);
  return {
    label: selectedTeacher ? `提交后改为 ${selectedTeacher.label}` : "已选择目标老师",
    tone: "border-[#F2DEC2] bg-[#FFF3E0] text-[#A55B14]",
  };
}

export function AdminEmergencyBatchDialog({
  open,
  data,
  loading = false,
  submitting = false,
  error,
  assignments,
  conflictsBySessionId,
  onOpenChange,
  onAssignmentChange,
  onSubmit,
}: Props) {
  const selectedCount = data?.courses.length ?? 0;
  const allAssignmentsReady = Boolean(
    data && data.courses.every((course) => Boolean(assignments[course.sessionId])),
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[calc(100%-1.5rem)] rounded-[20px] p-0 sm:max-w-xl">
        <DialogHeader className="border-b border-[#F0ECE6] px-5 pt-5 pb-4">
          <DialogTitle className="text-[18px] font-bold text-[var(--jp-text)]">
            批量互换老师
          </DialogTitle>
          <DialogDescription className="text-[12px] leading-5 text-[var(--jp-text-secondary)]">
            {loading
              ? "正在加载已选课节的系统内老师候选..."
              : `当前共选中 ${selectedCount} 节课。系统会按整组最终结果校验，提交时统一生效。`}
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[70vh] overflow-y-auto px-5 py-4">
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 2 }, (_, index) => (
                <div
                  key={`batch-loading-${index}`}
                  className="rounded-[16px] border border-[#E8E5E0] bg-white p-4"
                >
                  <div className="h-4 w-40 animate-pulse rounded bg-[#F4F1EB]" />
                  <div className="mt-3 h-3 w-56 animate-pulse rounded bg-[#F5F3F0]" />
                  <div className="mt-4 h-10 w-full animate-pulse rounded-[12px] bg-[#F8F5F0]" />
                </div>
              ))}
            </div>
          ) : null}

          {!loading && error ? (
            <div className="rounded-[14px] border border-[#F2D4D4] bg-[#FFF5F5] px-4 py-3 text-[12px] font-medium leading-5 text-[#9F3A38]">
              {error}
            </div>
          ) : null}

          {!loading && data ? (
            <div className="space-y-3">
              {data.courses.map((course) => {
                const assignment = assignments[course.sessionId] ?? "";
                const conflicts = conflictsBySessionId[course.sessionId] ?? [];
                const status = resolveCourseStatus(course, assignment, conflicts);

                return (
                  <section
                    key={course.sessionId}
                    className="rounded-[16px] border border-[#E8E5E0] bg-white p-4 shadow-[0_8px_18px_rgba(28,28,28,0.03)]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="text-[15px] font-bold text-[var(--jp-text)]">
                          {course.courseTitle}
                        </h3>
                        <p className="mt-1 text-[12px] leading-5 text-[var(--jp-text-secondary)]">
                          {[course.sessionTimeLabel, course.locationLabel].filter(Boolean).join(" · ")}
                        </p>
                      </div>
                      <span
                        className={`inline-flex shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${status.tone}`}
                      >
                        {status.label}
                      </span>
                    </div>

                    <div className="mt-3 grid gap-2 rounded-[12px] bg-[#F8F5F0] p-3">
                      <p className="text-[12px] text-[var(--jp-text-secondary)]">
                        当前点名老师：{course.currentTeacherLabel}
                      </p>
                      <p className="text-[12px] text-[var(--jp-text-secondary)]">
                        默认老师：{course.defaultTeacherLabel}
                      </p>
                      {course.currentTeacherExternal ? (
                        <p className="text-[11px] font-medium text-[#A55B14]">
                          当前是系统外老师，本次可批量改回系统内老师或恢复默认老师。
                        </p>
                      ) : null}
                    </div>

                    <label className="mt-3 block">
                      <span className="mb-1.5 block text-[12px] font-semibold text-[var(--jp-text)]">
                        提交后老师
                      </span>
                      <select
                        value={assignment}
                        disabled={submitting}
                        onChange={(event) =>
                          onAssignmentChange(course.sessionId, event.currentTarget.value)
                        }
                        className="h-11 w-full rounded-[12px] border border-[#D8D5D0] bg-white px-3 text-[13px] text-[var(--jp-text)] outline-none transition focus:border-[#1E3A5F]"
                      >
                        <option value="">请选择系统内老师</option>
                        {course.teacherOptions.map((teacher) => (
                          <option key={`${course.sessionId}-${teacher.id}`} value={teacher.id}>
                            {teacher.label}
                            {teacher.defaultTeacher ? "（默认老师）" : ""}
                            {teacher.selected ? "（当前老师）" : ""}
                          </option>
                        ))}
                      </select>
                    </label>
                  </section>
                );
              })}
            </div>
          ) : null}
        </div>

        <DialogFooter className="gap-3 border-t border-[#F0ECE6] bg-white px-5 py-4 sm:justify-between">
          <p className="text-[11px] leading-5 text-[var(--jp-text-muted)]">
            至少选中 2 节同日课程，且每节课都要明确提交后的老师。
          </p>
          <div className="flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={submitting}
              onClick={() => onOpenChange(false)}
            >
              取消
            </Button>
            <Button
              type="button"
              disabled={loading || submitting || !data || !allAssignmentsReady}
              onClick={onSubmit}
            >
              {submitting ? "提交中..." : "确认批量互换"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
