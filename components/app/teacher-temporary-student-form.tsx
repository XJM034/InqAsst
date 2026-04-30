"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";

import type {
  AttendanceStudent,
  TemporaryStudentHomeroomClass,
} from "@/lib/domain/types";
import { createTeacherTemporaryStudent } from "@/lib/services/mobile-client";
import { buildStudentUpsertRequest } from "@/lib/services/student-upsert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type CreatedTemporaryStudent = Pick<
  AttendanceStudent,
  "id" | "externalStudentId" | "name" | "homeroomClass" | "homeroomClassId" | "status"
>;

type TeacherTemporaryStudentFormProps = {
  courseId?: string;
  courseSessionId?: string;
  homeroomClasses?: TemporaryStudentHomeroomClass[];
  disabled?: boolean;
  disabledReason?: string;
  label?: string;
  description?: string;
  className?: string;
  onCreated: (student: CreatedTemporaryStudent) => void;
};

export function TeacherTemporaryStudentForm({
  courseId,
  courseSessionId,
  homeroomClasses = [],
  disabled = false,
  disabledReason,
  label = "补录临时学生",
  description = "名单里没有但实际来上课的学生，可在提交前补录。",
  className = "",
  onCreated,
}: TeacherTemporaryStudentFormProps) {
  const [expanded, setExpanded] = useState(false);
  const [name, setName] = useState("");
  const [selectedClassId, setSelectedClassId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const resolvedDisabled = disabled || !courseId || homeroomClasses.length === 0;
  let fallbackDisabledReason = "";
  if (disabled) {
    fallbackDisabledReason = "当前不能补录临时学生。";
  } else if (!courseId) {
    fallbackDisabledReason = "当前课节缺少课程信息，暂时无法补录临时学生。";
  } else if (homeroomClasses.length === 0) {
    fallbackDisabledReason = "当前没有可选行政班，暂时无法补录临时学生。";
  }
  const resolvedDisabledReason = disabledReason ?? fallbackDisabledReason;

  function resetForm() {
    setName("");
    setSelectedClassId("");
    setError("");
  }

  async function handleSubmit() {
    setError("");
    setMessage("");

    if (!courseId) {
      setError("当前课节缺少课程信息，暂时无法补录临时学生。");
      return;
    }

    const classId = selectedClassId ? Number(selectedClassId) : null;
    const selectedClass = homeroomClasses.find((item) => item.id === classId);
    const { body, error: validationError } = buildStudentUpsertRequest({
      name,
      homeroomClassId: classId,
    });

    if (!body) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);

    try {
      const created = await createTeacherTemporaryStudent(courseId, body, {
        courseSessionId,
      });
      const createdName = created.studentName?.trim() || body.name;
      const createdClassName =
        created.homeroomClassName?.trim() || selectedClass?.name || "未分班";
      const createdClassId = created.homeroomClassId ?? body.homeroomClassId;

      onCreated({
        id: String(created.studentId),
        externalStudentId: created.externalStudentId ?? undefined,
        name: createdName,
        homeroomClass: createdClassName,
        homeroomClassId: createdClassId,
        status: "present",
      });
      setMessage(`${createdName} 已加入本次点名名单`);
      resetForm();
      setExpanded(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "临时学生补录失败，请稍后重试");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className={`rounded-[14px] border border-[#E8E5E0] bg-white ${className}`}>
      <div className="flex items-start justify-between gap-3 px-3.5 py-3">
        <div className="min-w-0">
          <p className="text-[13px] font-semibold text-[var(--jp-text)]">{label}</p>
          <p className="mt-0.5 text-[11px] leading-5 text-[var(--jp-text-secondary)]">
            {resolvedDisabled ? resolvedDisabledReason : description}
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          disabled={resolvedDisabled}
          onClick={() => {
            setExpanded((current) => !current);
            setError("");
            setMessage("");
          }}
          className="h-8 shrink-0 rounded-full border-[#E8E5E0] bg-[#F8F6F3] px-2.5 text-[11px] font-semibold text-[var(--jp-text)] hover:bg-[#F8F6F3] disabled:opacity-60"
        >
          {expanded ? <X className="size-3.5" /> : <Plus className="size-3.5" />}
          {expanded ? "收起" : "添加"}
        </Button>
      </div>

      {message ? (
        <p className="border-t border-[#F0ECE6] px-3.5 py-2 text-[11px] font-medium text-[#3D6B4F]">
          {message}
        </p>
      ) : null}

      {expanded ? (
        <div className="space-y-3 border-t border-[#F0ECE6] px-3.5 py-3">
          <div className="space-y-1.5">
            <p className="text-[11px] font-semibold text-[var(--jp-text-secondary)]">姓名</p>
            <Input
              value={name}
              onChange={(event) => {
                setName(event.target.value);
                setError("");
              }}
              autoComplete="off"
              placeholder="请输入学生姓名"
              className="h-10 rounded-[12px] border border-[#E8E5E0] bg-white px-3 text-[13px] text-[var(--jp-text)] shadow-none focus-visible:ring-0"
            />
          </div>

          <div className="space-y-1.5">
            <p className="text-[11px] font-semibold text-[var(--jp-text-secondary)]">行政班</p>
            <select
              value={selectedClassId}
              onChange={(event) => {
                setSelectedClassId(event.target.value);
                setError("");
              }}
              className="h-10 w-full rounded-[12px] border border-[#E8E5E0] bg-white px-3 text-[13px] text-[var(--jp-text)] outline-none focus:ring-0"
            >
              <option value="">请选择行政班</option>
              {homeroomClasses.map((homeroomClass) => (
                <option key={homeroomClass.id} value={homeroomClass.id}>
                  {homeroomClass.name}
                </option>
              ))}
            </select>
          </div>

          {error ? (
            <p className="text-[12px] font-medium text-[#D32F2F]">{error}</p>
          ) : (
            <p className="text-[11px] leading-5 text-[var(--jp-text-secondary)]">
              保存后会生成学生 ID，并默认按“已到”加入本次点名。
            </p>
          )}

          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting}
              onClick={() => {
                resetForm();
                setExpanded(false);
              }}
              className="h-10 rounded-[12px] border-[#E8E5E0] bg-white text-[12px] font-semibold text-[var(--jp-text-secondary)] hover:bg-white"
            >
              取消
            </Button>
            <Button
              type="button"
              disabled={isSubmitting}
              onClick={handleSubmit}
              className="h-10 rounded-[12px] bg-[var(--jp-accent)] text-[12px] font-semibold text-white hover:bg-[var(--jp-accent)]/90 disabled:opacity-70"
            >
              {isSubmitting ? "保存中..." : "加入名单"}
            </Button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
