"use client";

import { useMemo, useState } from "react";
import { Plus, Upload } from "lucide-react";

import { SearchField } from "@/components/app/search-field";
import { StaticLink } from "@/components/app/static-link";
import { Button } from "@/components/ui/button";
import { withCampusQuery } from "@/lib/admin-campus";
import type { AdminCourseRosterData } from "@/lib/domain/types";
import { cn } from "@/lib/utils";

type Props = {
  data: AdminCourseRosterData;
  campus: string;
};

export function AdminCourseRosterClient({ data, campus }: Props) {
  const [searchQuery, setSearchQuery] = useState("");
  const normalizedQuery = searchQuery.trim().toLowerCase();
  const visibleStudents = useMemo(
    () =>
      normalizedQuery
        ? data.students.filter((student) =>
            `${student.name} ${student.studentCode} ${student.homeroomClass}`
              .toLowerCase()
              .includes(normalizedQuery),
          )
        : data.students,
    [data.students, normalizedQuery],
  );

  return (
    <div className="space-y-3.5 px-5 pt-3">
      <section className="rounded-[16px] border border-[#E8E5E0] bg-white p-3 shadow-[0_10px_22px_rgba(28,28,28,0.04)]">
        <h1 className="text-base font-bold text-[var(--jp-text)]">{data.courseTitle}</h1>
        <div className="mt-2 rounded-[12px] bg-[#F5F3F0] px-3 py-2">
          <p className="text-xs font-medium text-[var(--jp-text-secondary)]">{data.courseMeta}</p>
        </div>
      </section>

      <section className="rounded-[16px] border border-[#E8E5E0] bg-white p-3 shadow-[0_10px_22px_rgba(28,28,28,0.04)]">
        <SearchField
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder={data.searchPlaceholder}
          className="bg-[var(--jp-surface-muted)]"
        />
        <div className="mt-3 grid grid-cols-2 gap-3">
          <Button
            className="h-11 rounded-[12px] bg-[#1E3A5F] text-xs font-semibold text-white hover:bg-[#1E3A5F]/90"
            asChild
          >
            <StaticLink
              className="inline-flex items-center justify-center gap-2"
              href={withCampusQuery(data.addHref, campus)}
            >
              <Plus className="size-4" />
              新增学生
            </StaticLink>
          </Button>
          <Button
            variant="outline"
            className="h-11 rounded-[12px] border-[#E8E5E0] bg-white text-xs font-semibold text-[var(--jp-text)] hover:bg-white"
            asChild
          >
            <StaticLink
              className="inline-flex items-center justify-center gap-2"
              href={withCampusQuery(data.importHref, campus)}
            >
              <Upload className="size-4" />
              批量导入
            </StaticLink>
          </Button>
        </div>
      </section>

      <section className="rounded-[16px] border border-[#E8E5E0] bg-white p-3 shadow-[0_10px_22px_rgba(28,28,28,0.04)]">
        <div className="flex items-center justify-between px-0.5 pb-2.5">
          <h2 className="text-sm font-bold text-[var(--jp-text)]">学生名单</h2>
          <span className="rounded-full bg-[var(--jp-surface-muted)] px-2.5 py-1 text-[10px] font-semibold text-[var(--jp-text-secondary)]">
            共 {visibleStudents.length} 人
          </span>
        </div>

        {data.students.length === 0 ? (
          <div className="rounded-[14px] border border-dashed border-[#D8D5D0] px-4 py-8 text-center text-[13px] text-[var(--jp-text-muted)]">
            当前课程还没有学生
          </div>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-2">
              {visibleStudents.map((student) => (
                <article
                  key={student.id}
                  className={cn(
                    "flex min-h-[108px] flex-col rounded-[14px] p-2.5 shadow-[0_8px_18px_rgba(28,28,28,0.03)]",
                    student.highlighted
                      ? "border border-[#E8E5E0] bg-[#F5F3F0]"
                      : "border border-[#E8E5E0] bg-white",
                  )}
                >
                  <div className="space-y-1">
                    <p className="text-[13px] font-semibold text-[var(--jp-text)]">{student.name}</p>
                    <p className="text-[10px] leading-4 text-[var(--jp-text-secondary)]">
                      {student.studentCode}
                    </p>
                    <p className="text-[10px] leading-4 text-[var(--jp-text-secondary)]">
                      {student.homeroomClass}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    className="mt-auto h-7 rounded-full border-[#D4E1EF] bg-white px-2 py-0 text-[10px] font-semibold text-[#1E3A5F] hover:bg-white"
                    asChild
                  >
                    <StaticLink href={withCampusQuery(student.editHref, campus)}>
                      编辑
                    </StaticLink>
                  </Button>
                </article>
              ))}
            </div>
            {visibleStudents.length === 0 ? (
              <div className="mt-3 rounded-[14px] border border-dashed border-[#D8D5D0] px-4 py-6 text-center text-[13px] text-[var(--jp-text-muted)]">
                未找到匹配的学生
              </div>
            ) : null}
          </>
        )}
      </section>
    </div>
  );
}
