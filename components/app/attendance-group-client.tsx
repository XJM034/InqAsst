"use client";

import { useMemo, useState } from "react";
import { Check, Layers3 } from "lucide-react";

import { AttendanceStudentCard } from "@/components/app/attendance-student-card";
import { MobileTabBar } from "@/components/app/mobile-tab-bar";
import { PageShell } from "@/components/app/page-shell";
import { TeacherTemporaryStudentForm } from "@/components/app/teacher-temporary-student-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { getAttendanceSummary } from "@/lib/domain/attendance";
import type {
  AttendanceGroup,
  AttendanceGroupClass,
  AttendanceGroupStudent,
} from "@/lib/domain/types";
import { submitTeacherAttendanceGroup } from "@/lib/services/mobile-client";
import { navigateTo } from "@/lib/static-navigation";

type AttendanceGroupClientProps = {
  group: AttendanceGroup;
};

function flattenGroupStudents(classes: AttendanceGroupClass[]) {
  return classes.flatMap((item) => item.students);
}

function updateGroupStudent(
  classes: AttendanceGroupClass[],
  courseSessionId: string,
  studentId: string,
): AttendanceGroupClass[] {
  return classes.map((item) =>
    item.courseSessionId === courseSessionId
      ? {
          ...item,
          students: item.students.map((student) =>
            student.id === studentId
              ? {
                  ...student,
                  status: student.status === "present" ? ("absent" as const) : ("present" as const),
                }
              : student,
          ),
        }
      : item,
  );
}

function appendGroupStudent(
  classes: AttendanceGroupClass[],
  courseSessionId: string,
  student: AttendanceGroupStudent,
): AttendanceGroupClass[] {
  return classes.map((item) =>
    item.courseSessionId === courseSessionId
      ? {
          ...item,
          students: item.students.some((current) => current.id === student.id)
            ? item.students
            : [...item.students, student],
        }
      : item,
  );
}

export function AttendanceGroupClient({ group }: AttendanceGroupClientProps) {
  const [classes, setClasses] = useState(group.classes);
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const students = useMemo(() => flattenGroupStudents(classes), [classes]);
  const summary = getAttendanceSummary(students);
  const absentStudents = students.filter((student) => student.status === "absent");
  const leaveStudents = students.filter((student) => student.status === "leave");
  const hasAnyException = absentStudents.length > 0 || leaveStudents.length > 0;

  function handleToggleStudentStatus(courseSessionId: string, studentId: string) {
    setClasses((current) => updateGroupStudent(current, courseSessionId, studentId));
  }

  function handleTemporaryStudentCreated(
    targetClass: AttendanceGroupClass,
    student: Omit<AttendanceGroupStudent, "courseSessionId" | "courseTitle">,
  ) {
    setClasses((current) =>
      appendGroupStudent(current, targetClass.courseSessionId, {
        ...student,
        courseSessionId: targetClass.courseSessionId,
        courseTitle: targetClass.title,
      }),
    );
  }

  async function handleSubmitAttendance() {
    if (group.submitDisabled) {
      setSubmitError(group.submitDisabledReason ?? "当前不能提交合班点名");
      return;
    }

    setSubmitError("");
    setIsSubmitting(true);

    try {
      await submitTeacherAttendanceGroup({
        groupId: group.id,
        students,
      });
      navigateTo("/teacher/home");
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "合班点名提交失败，请稍后重试");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <PageShell>
      <Dialog>
        <div className="app-screen">
          <div className="app-scroll px-5 pt-4">
            <section className="rounded-[16px] border border-[#CFE0D4] bg-[#FBFEFC] p-3.5 shadow-[0_12px_24px_rgba(61,107,79,0.06)]">
              <div className="flex items-start gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#EAF2EC] text-[#3D6B4F] ring-1 ring-[#D7E6DC]">
                  <Layers3 className="size-4.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-[4px] bg-white px-2 py-0.5 text-[10px] font-semibold text-[#3D6B4F] ring-1 ring-[#D7E6DC]">
                      合班
                    </span>
                    <p className="text-[11px] font-medium text-[var(--jp-text-secondary)]">
                      {group.dateLabel}
                    </p>
                  </div>
                  <h1 className="mt-1.5 text-[17px] font-semibold leading-6 text-[var(--jp-text)]">
                    {group.title}
                  </h1>
                  <p className="mt-1 text-[12px] leading-5 text-[var(--jp-text-secondary)]">
                    {group.info}
                  </p>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-3 gap-2">
                <SummaryChip label="应到" value={summary.expected} tone="info" />
                <SummaryChip label="已到" value={summary.present} tone="success" />
                <SummaryChip label="未到" value={summary.absent} tone="danger" />
              </div>
              <div className="mt-2 flex flex-wrap justify-center gap-2">
                <SmallChip label="班级" value={classes.length} />
                {summary.leave > 0 ? <SmallChip label="请假" value={summary.leave} /> : null}
                {summary.unmarked > 0 ? (
                  <SmallChip label="未点名" value={summary.unmarked} />
                ) : null}
              </div>
            </section>

            {group.submitDisabledReason ? (
              <p className="mt-3 rounded-[12px] bg-[#FFF8E8] px-3 py-2 text-[12px] leading-5 text-[#8A6018]">
                {group.submitDisabledReason}
              </p>
            ) : null}

            <div className="mt-3.5 space-y-4 pb-[calc(var(--mobile-tabbar-total-height)+68px)]">
              {classes.map((item, index) => (
                <section key={item.courseSessionId} className="space-y-2.5">
                  <div className="flex items-center justify-between gap-3 px-0.5">
                    <div className="min-w-0">
                      <p className="truncate text-[14px] font-semibold text-[var(--jp-text)]">
                        {item.title}
                      </p>
                      <p className="mt-0.5 truncate text-[11px] text-[var(--jp-text-secondary)]">
                        {item.meta}
                      </p>
                    </div>
                    <span className="shrink-0 rounded-full bg-[#F3F0EB] px-2.5 py-1 text-[10px] font-semibold text-[var(--jp-text-secondary)]">
                      第 {index + 1} 班
                    </span>
                  </div>

                  {item.students.length === 0 ? (
                    <div className="rounded-[14px] border border-dashed border-[#D8D5D0] bg-white px-4 py-6 text-center text-[12px] text-[var(--jp-text-muted)]">
                      当前班级还没有学生名单
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-2">
                      {item.students.map((student) => (
                        <AttendanceStudentCard
                          key={`${item.courseSessionId}-${student.id}`}
                          name={student.name}
                          homeroomClass={student.homeroomClass}
                          status={student.status}
                          managerUpdated={student.managerUpdated}
                          overrideLabel={student.overrideLabel}
                          editable={
                            !group.submitDisabled &&
                            !student.managerUpdated &&
                            student.status !== "leave"
                          }
                          onToggle={() =>
                            handleToggleStudentStatus(item.courseSessionId, student.id)
                          }
                        />
                      ))}
                    </div>
                  )}

                  <TeacherTemporaryStudentForm
                    courseId={item.courseId}
                    courseSessionId={item.courseSessionId}
                    homeroomClasses={item.temporaryStudent?.homeroomClasses ?? []}
                    disabled={group.submitDisabled}
                    disabledReason={
                      group.submitDisabled
                        ? group.submitDisabledReason
                        : item.temporaryStudent?.disabledReason
                    }
                    label="补录本班临时学生"
                    description="该班名单里没有但实际来上课的学生，可在提交前补录。"
                    onCreated={(student) => handleTemporaryStudentCreated(item, student)}
                  />
                </section>
              ))}
            </div>
          </div>

          <div className="pointer-events-none fixed inset-x-0 bottom-[calc(var(--mobile-tabbar-total-height)+10px)] z-40 mx-auto w-full max-w-[402px] px-4">
            <div className="pointer-events-auto">
              {submitError ? (
                <p className="mb-2 px-2 text-center text-[12px] font-medium text-[#D32F2F]">
                  {submitError}
                </p>
              ) : null}
              <DialogTrigger asChild>
                <Button
                  disabled={group.submitDisabled}
                  className="h-12 w-full rounded-[16px] bg-[var(--jp-accent)] text-[15px] font-semibold text-[var(--jp-bg)] shadow-[0_16px_32px_rgba(30,58,95,0.24)] hover:bg-[var(--jp-accent)]/90 disabled:opacity-60"
                >
                  {group.submitLabel}
                </Button>
              </DialogTrigger>
            </div>
          </div>

          <MobileTabBar
            active="attendance"
            items={[
              { key: "home", href: "/teacher/home" },
              { key: "attendance", href: "/teacher/attendance" },
              { key: "profile", href: "/teacher/me" },
            ]}
          />
        </div>

        <DialogContent
          showCloseButton={false}
          overlayClassName="bg-[rgba(15,23,42,0.35)] backdrop-blur-0"
          className="max-w-[320px] gap-4 rounded-[16px] border-0 bg-white p-6 shadow-none ring-0"
        >
          {hasAnyException ? (
            <>
              <div className="space-y-2.5">
                <DialogTitle className="text-[18px] font-semibold text-[#1E3A5F]">
                  确认提交合班点名
                </DialogTitle>
                <DialogDescription className="text-sm leading-6 text-[#666666]">
                  {`本组合班应到 ${summary.expected} 人，确认后会按班级同步到管理端。`}
                </DialogDescription>
              </div>

              {absentStudents.length > 0 ? (
                <ExceptionList title={`未到学生（${summary.absent}人）`} students={absentStudents} />
              ) : null}
              {leaveStudents.length > 0 ? (
                <ExceptionList title={`请假学生（${summary.leave}人）`} students={leaveStudents} />
              ) : null}

              <SubmitActions isSubmitting={isSubmitting} onSubmit={handleSubmitAttendance} />
            </>
          ) : (
            <>
              <div className="flex flex-col items-center gap-4 text-center">
                <div className="flex size-[52px] items-center justify-center rounded-full bg-[#E8F5E9]">
                  <Check className="size-[22px] text-[#4CAF50]" strokeWidth={2.4} />
                </div>
                <div className="space-y-2.5">
                  <DialogTitle className="text-[18px] font-semibold text-[#1E3A5F]">
                    确认提交合班点名
                  </DialogTitle>
                  <DialogDescription className="text-sm leading-6 text-[#666666]">
                    {`本组合班应到 ${summary.expected} 人，确认全部已到后提交。`}
                  </DialogDescription>
                </div>
              </div>

              <SubmitActions isSubmitting={isSubmitting} onSubmit={handleSubmitAttendance} />
            </>
          )}
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
  tone: "info" | "success" | "danger";
}) {
  const toneClass = {
    info: "bg-[#EEF4FA] text-[#1E3A5F] ring-[#D9E5F1]",
    success: "bg-[#EEF6F1] text-[#3D6B4F] ring-[#D7E6DC]",
    danger: "bg-[#FFF1F1] text-[#D32F2F] ring-[#F2D7D8]",
  }[tone];

  return (
    <div className={`flex h-10 items-center justify-center gap-1.5 rounded-full px-2 ring-1 ${toneClass}`}>
      <span className="text-[12px] font-medium">{label}</span>
      <span className="text-[16px] font-semibold">{value}</span>
    </div>
  );
}

function SmallChip({ label, value }: { label: string; value: number }) {
  return (
    <span className="rounded-full bg-white px-3 py-1.5 text-[11px] font-medium text-[var(--jp-text-secondary)] ring-1 ring-[#E5E0D7]">
      {label} {value}
    </span>
  );
}

function ExceptionList({
  title,
  students,
}: {
  title: string;
  students: ReturnType<typeof flattenGroupStudents>;
}) {
  return (
    <div className="space-y-2 rounded-[12px] bg-[#FFF8F8] px-3.5 py-3">
      <p className="text-sm font-semibold text-[#D32F2F]">{title}</p>
      <div className="max-h-32 space-y-1.5 overflow-y-auto">
        {students.map((student) => (
          <p key={`${student.courseSessionId}-${student.id}`} className="text-[12px] leading-5 text-[#7A3940]">
            {`${student.courseTitle} · ${student.name} · ${student.homeroomClass}`}
          </p>
        ))}
      </div>
    </div>
  );
}

function SubmitActions({
  isSubmitting,
  onSubmit,
}: {
  isSubmitting: boolean;
  onSubmit: () => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-3 pt-1">
      <DialogClose asChild>
        <Button
          variant="outline"
          className="h-11 rounded-[8px] border-0 bg-[#F5F5F5] text-[15px] font-medium text-[var(--jp-text)] hover:bg-[#F5F5F5]"
        >
          返回修改
        </Button>
      </DialogClose>
      <Button
        type="button"
        disabled={isSubmitting}
        onClick={onSubmit}
        className="h-11 rounded-[8px] bg-[#1E3A5F] text-[15px] font-semibold text-white hover:bg-[#1E3A5F]/90"
      >
        {isSubmitting ? "提交中" : "完成点名"}
      </Button>
    </div>
  );
}
