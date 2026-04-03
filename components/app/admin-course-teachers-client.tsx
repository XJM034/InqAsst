"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";

import type { AdminCourseTeachersData } from "@/lib/domain/types";
import { cn } from "@/lib/utils";

type AdminCourseTeachersClientProps = {
  data: AdminCourseTeachersData;
};

export function AdminCourseTeachersClient({
  data,
}: AdminCourseTeachersClientProps) {
  const [selectedDayKey, setSelectedDayKey] = useState(data.defaultDayKey);

  const visibleTeachers = useMemo(
    () => data.teachers.filter((teacher) => teacher.dayKey === selectedDayKey),
    [data.teachers, selectedDayKey],
  );

  return (
    <div className="space-y-3.5 px-5 pt-2.5">
      <section className="rounded-[16px] border border-[#E8E5E0] bg-white p-3.5 shadow-[0_10px_22px_rgba(28,28,28,0.04)]">
        <div className="flex flex-wrap gap-2">
          {data.days.map((day) => {
            const isSelected = day.key === selectedDayKey;

            return (
              <button
                key={day.key}
                type="button"
                onClick={() => setSelectedDayKey(day.key)}
                className={cn(
                  "flex h-9 min-w-[60px] items-center justify-center rounded-full border px-4 text-xs font-semibold transition-colors",
                  isSelected
                    ? "border-transparent bg-[#1E3A5F] text-white"
                    : "border-[#E8E5E0] bg-[#F5F3F0] text-[var(--jp-text)]",
                )}
              >
                {day.label}
              </button>
            );
          })}
        </div>

        <div className="mt-3 flex h-[42px] items-center gap-2 rounded-[12px] border border-[#E8E5E0] bg-white px-3.5 text-xs text-[var(--jp-text-muted)] shadow-[0_8px_18px_rgba(28,28,28,0.03)]">
          <Search className="size-4" />
          <span>{data.searchPlaceholder}</span>
        </div>
      </section>

      <section className="rounded-[16px] border border-[#E8E5E0] bg-white p-3.5 shadow-[0_10px_22px_rgba(28,28,28,0.04)]">
        <div className="space-y-2.5">
          {visibleTeachers.map((teacher) => (
            <div
              key={teacher.id}
              className={cn(
                "rounded-[14px] border px-3 py-3 shadow-[0_8px_18px_rgba(28,28,28,0.03)]",
                teacher.tone === "substitute"
                  ? "border-[#E59A52] bg-[#FFFDF8]"
                  : "border-[#E8E5E0] bg-white",
              )}
            >
              <div className="flex items-center gap-2">
                <p className="text-[13px] font-bold text-[var(--jp-text)]">{teacher.label}</p>
                {teacher.tone === "substitute" ? (
                  <span className="rounded-[6px] bg-[#FFF4EA] px-2 py-0.5 text-[10px] font-semibold text-[#9A5A1F]">
                    代课老师
                  </span>
                ) : null}
              </div>
              <p className="mt-1 text-[11px] text-[var(--jp-text-secondary)]">
                {teacher.note}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
