"use client";

import { useEffect, useRef, useState } from "react";

import { buildAdminCourseRosterHref } from "@/lib/admin-route-hrefs";
import { buildAdminTabItems, withCampusQuery } from "@/lib/admin-campus";
import { AdminContextCard } from "@/components/app/admin-context-card";
import { AdminSubpageHeader } from "@/components/app/admin-subpage-header";
import { MobileTabBar } from "@/components/app/mobile-tab-bar";
import { PageShell } from "@/components/app/page-shell";
import { StaticLink } from "@/components/app/static-link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  addExistingStudentToCourse,
  createStudent,
  searchAdminCampusStudents,
  updateStudent,
} from "@/lib/services/mobile-client";
import type { CampusStudentSearchItemDto } from "@/lib/services/mobile-schema";
import { buildStudentUpsertRequest } from "@/lib/services/student-upsert";
import { navigateTo } from "@/lib/static-navigation";

type HomeroomClass = {
  id: number;
  name: string;
};

type Props = {
  courseId: string;
  studentId: string;
  courseCampusId: number | null;
  title: string;
  badge: string;
  courseTitle: string;
  courseContext?: string;
  nameValue: string;
  studentIdValue: string;
  homeroomClassId: number | null;
  homeroomClasses: HomeroomClass[];
  submitLabel: string;
  backHref?: string;
  campus?: string;
};

export function StudentFormClient({
  courseId,
  studentId,
  courseCampusId,
  title,
  badge,
  courseTitle,
  courseContext,
  nameValue: initialName,
  studentIdValue: initialStudentIdValue,
  homeroomClassId: initialClassId,
  homeroomClasses,
  submitLabel,
  backHref,
  campus = "chenghua",
}: Props) {
  const isNew = studentId === "new";
  const resolvedBackHref = backHref ?? buildAdminCourseRosterHref(courseId);
  const [name, setName] = useState(initialName);
  const [selectedClassId, setSelectedClassId] = useState(initialClassId);
  const [selectedExistingStudent, setSelectedExistingStudent] =
    useState<CampusStudentSearchItemDto | null>(null);
  const [searchResults, setSearchResults] = useState<CampusStudentSearchItemDto[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const searchRequestVersionRef = useRef(0);

  useEffect(() => {
    setName(initialName);
  }, [initialName]);

  useEffect(() => {
    setSelectedClassId(initialClassId);
  }, [initialClassId]);

  useEffect(() => {
    setSelectedExistingStudent(null);
    setSearchResults([]);
    setSearchError("");
    setIsSearching(false);
    setIsSearchOpen(false);
    setError("");
  }, [courseId, isNew, studentId]);

  useEffect(() => {
    const requestVersion = searchRequestVersionRef.current + 1;
    searchRequestVersionRef.current = requestVersion;

    if (!isNew || selectedExistingStudent || !isSearchOpen) {
      setSearchResults([]);
      setSearchError("");
      setIsSearching(false);
      return;
    }

    const keyword = name.trim();
    if (!keyword) {
      setSearchResults([]);
      setSearchError("");
      setIsSearching(false);
      return;
    }

    if (!courseCampusId) {
      setSearchResults([]);
      setSearchError(
        keyword.length >= 2 ? "当前课程缺少校区信息，无法搜索已有学生，可直接按临时学生创建。" : "",
      );
      setIsSearching(false);
      return;
    }

    if (keyword.length < 2) {
      setSearchResults([]);
      setSearchError("");
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    setSearchError("");

    const timer = window.setTimeout(() => {
      searchAdminCampusStudents(courseCampusId, keyword, 10)
        .then((results) => {
          if (searchRequestVersionRef.current === requestVersion) {
            setSearchResults(results);
            setIsSearching(false);
          }
        })
        .catch((err) => {
          if (searchRequestVersionRef.current === requestVersion) {
            setSearchResults([]);
            setSearchError(err instanceof Error ? err.message : "搜索学生失败，请稍后重试");
            setIsSearching(false);
          }
        });
    }, 300);

    return () => {
      window.clearTimeout(timer);
    };
  }, [courseCampusId, isNew, isSearchOpen, name, selectedExistingStudent]);

  const trimmedName = name.trim();
  const showSearchPanel =
    isNew && !selectedExistingStudent && isSearchOpen && trimmedName.length > 0;
  const displayedStudentId = isNew
    ? selectedExistingStudent
      ? String(selectedExistingStudent.studentId)
      : ""
    : initialStudentIdValue;

  function handleExistingStudentSelect(option: CampusStudentSearchItemDto) {
    setSelectedExistingStudent(option);
    setName(option.name);
    setSelectedClassId(option.homeroomClassId ?? null);
    setSearchResults([]);
    setSearchError("");
    setError("");
    setIsSearchOpen(false);
  }

  function clearExistingStudentSelection() {
    setSelectedExistingStudent(null);
    setSearchResults([]);
    setSearchError("");
    setError("");
    setIsSearchOpen(false);
  }

  function handleNameChange(value: string) {
    setName(value);
    setError("");

    if (!isNew) {
      return;
    }

    if (selectedExistingStudent && value.trim() !== selectedExistingStudent.name) {
      setSelectedExistingStudent(null);
      setSelectedClassId(null);
    }

    setIsSearchOpen(true);
  }

  async function handleSubmit() {
    setError("");

    if (isNew && selectedExistingStudent) {
      setIsSubmitting(true);
      try {
        await addExistingStudentToCourse(courseId, {
          studentId: selectedExistingStudent.studentId,
        });
        navigateTo(withCampusQuery(resolvedBackHref, campus));
      } catch (err) {
        setError(err instanceof Error ? err.message : "保存失败，请稍后重试");
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    const { body, error: validationError } = buildStudentUpsertRequest({
      name,
      homeroomClassId: selectedClassId,
    });

    if (!body) {
      setError(validationError);
      return;
    }

    if (
      isNew &&
      !window.confirm(
        "选修课系统中没有该学生，将按临时学生创建。保存成功后由数据库生成学生ID。是否继续？",
      )
    ) {
      return;
    }

    setIsSubmitting(true);

    try {
      if (isNew) {
        const created = await createStudent(courseId, body);
        if (created.studentId != null) {
          window.alert(`临时新增学生已创建，学生ID：${created.studentId}`);
        }
      } else {
        await updateStudent(courseId, studentId, body);
      }
      navigateTo(withCampusQuery(resolvedBackHref, campus));
    } catch (err) {
      setError(err instanceof Error ? err.message : "保存失败，请稍后重试");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <PageShell>
      <div className="app-screen">
        <div className="app-scroll pb-4">
          <AdminSubpageHeader
            title={title}
            backHref={withCampusQuery(resolvedBackHref, campus)}
            trailing={
              <span className="rounded-full bg-[#E8F0FB] px-2.5 py-1 text-[11px] font-semibold text-[#1E3A5F]">
                {badge}
              </span>
            }
          />

          <div className="space-y-3.5 px-5 pt-3">
            <AdminContextCard
              title={courseTitle}
              description={isNew ? "向当前课程新增学生" : "编辑当前课程学生信息"}
              detail={courseContext}
            />

            <section className="rounded-[16px] border border-[#E8E5E0] bg-white p-4 shadow-[0_10px_22px_rgba(28,28,28,0.04)]">
              <h2 className="text-[15px] font-semibold text-[var(--jp-text)]">学生信息</h2>
              <div className="mt-3.5 space-y-3.5">
                {isNew ? (
                  <div className="rounded-[12px] border border-[#E8E5E0] bg-[#F8F6F3] px-3.5 py-3 text-[11px] leading-5 text-[var(--jp-text-secondary)]">
                    先输入学生姓名，可从当前校区已有学生里直接选择。未匹配到已有学生时，将按临时新增学生处理。
                  </div>
                ) : null}

                <div className="space-y-1.5">
                  <p className="text-[11px] font-semibold text-[var(--jp-text-secondary)]">姓名</p>
                  <div className="relative">
                    <Input
                      value={name}
                      onChange={(event) => handleNameChange(event.target.value)}
                      onFocus={() => {
                        if (isNew) {
                          setIsSearchOpen(true);
                        }
                      }}
                      onBlur={() => {
                        if (isNew) {
                          window.setTimeout(() => setIsSearchOpen(false), 120);
                        }
                      }}
                      autoComplete="off"
                      placeholder="请输入学生姓名"
                      className="h-11 rounded-[12px] border border-[#E8E5E0] bg-white px-3.5 text-sm text-[var(--jp-text)] shadow-none focus-visible:ring-0"
                    />

                    {showSearchPanel ? (
                      <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-20 rounded-[14px] border border-[#E8E5E0] bg-white p-2 shadow-[0_18px_36px_rgba(28,28,28,0.08)]">
                        {trimmedName.length < 2 ? (
                          <p className="px-2 py-2 text-[12px] text-[var(--jp-text-secondary)]">
                            输入至少 2 个字后开始搜索当前校区已有学生。
                          </p>
                        ) : isSearching ? (
                          <p className="px-2 py-2 text-[12px] text-[var(--jp-text-secondary)]">
                            正在搜索当前校区已有学生...
                          </p>
                        ) : searchError ? (
                          <p className="px-2 py-2 text-[12px] text-[#D32F2F]">{searchError}</p>
                        ) : searchResults.length > 0 ? (
                          <div className="space-y-1">
                            {searchResults.map((option) => (
                              <button
                                key={option.studentId}
                                type="button"
                                onPointerDown={(event) => {
                                  event.preventDefault();
                                  handleExistingStudentSelect(option);
                                }}
                                className="flex w-full items-start justify-between rounded-[12px] px-2.5 py-2 text-left hover:bg-[#F8F6F3]"
                              >
                                <div>
                                  <p className="text-[13px] font-semibold text-[var(--jp-text)]">
                                    {option.name}
                                  </p>
                                  <p className="mt-0.5 text-[11px] text-[var(--jp-text-secondary)]">
                                    {option.homeroomClassName || "未绑定行政班"}
                                  </p>
                                </div>
                                <span className="pl-3 text-[11px] font-medium text-[var(--jp-text-muted)]">
                                  ID {option.studentId}
                                </span>
                              </button>
                            ))}
                          </div>
                        ) : (
                          <p className="px-2 py-2 text-[12px] text-[var(--jp-text-secondary)]">
                            未找到匹配学生，将按临时学生创建。
                          </p>
                        )}
                      </div>
                    ) : null}
                  </div>

                  {isNew ? (
                    selectedExistingStudent ? (
                      <div className="flex items-center justify-between rounded-[12px] border border-[#D7E4F5] bg-[#E8F0FB] px-3.5 py-3">
                        <div className="text-[11px] leading-5 text-[#1E3A5F]">
                          <p className="font-semibold">已选择本校区已有学生</p>
                          <p>保存后会直接加入当前课程名单，并沿用数据库中的学生ID与行政班。</p>
                        </div>
                        <button
                          type="button"
                          onClick={clearExistingStudentSelection}
                          className="text-[11px] font-semibold text-[#1E3A5F]"
                        >
                          改为临时新增
                        </button>
                      </div>
                    ) : (
                      <p className="text-[11px] text-[var(--jp-text-secondary)]">
                        输入至少 2 个字可搜索当前校区已有学生；若没有匹配项，系统会按临时学生创建，学生ID将在保存成功后生成。
                      </p>
                    )
                  ) : null}
                </div>

                <div className="space-y-1.5">
                  <p className="text-[11px] font-semibold text-[var(--jp-text-secondary)]">学生ID</p>
                  <Input
                    readOnly
                    value={displayedStudentId}
                    placeholder={isNew ? "保存后生成" : "数据库 studentId"}
                    className="h-11 rounded-[12px] border border-[#E8E5E0] bg-[#F8F6F3] px-3.5 text-sm text-[var(--jp-text)] shadow-none focus-visible:ring-0"
                  />
                  <p className="text-[11px] text-[var(--jp-text-secondary)]">
                    {isNew
                      ? selectedExistingStudent
                        ? "已按所选已有学生带出数据库 studentId。"
                        : "临时新增学生的数据库 studentId 会在保存成功后生成。"
                      : "这里显示数据库 studentId，不可修改。"}
                  </p>
                </div>

                <div className="space-y-1.5">
                  <p className="text-[11px] font-semibold text-[var(--jp-text-secondary)]">行政班</p>
                  {homeroomClasses.length > 0 ? (
                    <>
                      <select
                        value={selectedClassId ?? ""}
                        disabled={Boolean(isNew && selectedExistingStudent)}
                        onChange={(event) =>
                          setSelectedClassId(
                            event.target.value ? Number(event.target.value) : null,
                          )
                        }
                        className="h-11 w-full rounded-[12px] border border-[#E8E5E0] bg-white px-3.5 text-sm text-[var(--jp-text)] outline-none focus:ring-0 disabled:bg-[#F8F6F3] disabled:text-[var(--jp-text-secondary)]"
                      >
                        <option value="">请选择行政班</option>
                        {homeroomClasses.map((homeroomClass) => (
                          <option key={homeroomClass.id} value={homeroomClass.id}>
                            {homeroomClass.name}
                          </option>
                        ))}
                      </select>
                      {isNew && selectedExistingStudent ? (
                        <p className="text-[11px] text-[var(--jp-text-secondary)]">
                          已按所选已有学生自动带出行政班；如需录入临时学生，请先点“改为临时新增”。
                        </p>
                      ) : null}
                    </>
                  ) : (
                    <Input
                      disabled
                      placeholder="未获取到行政班数据"
                      className="h-11 rounded-[12px] border border-[#E8E5E0] bg-white px-3.5 text-sm shadow-none focus-visible:ring-0"
                    />
                  )}
                </div>
              </div>
            </section>

            {error ? (
              <p className="px-0.5 text-[13px] font-medium text-[#D32F2F]">{error}</p>
            ) : null}

            <div className="grid grid-cols-2 gap-3">
              <Button
                asChild
                variant="outline"
                className="h-11 rounded-[12px] border border-[#E8E5E0] bg-white text-[13px] font-semibold text-[var(--jp-text-secondary)] hover:bg-white"
              >
                <StaticLink href={withCampusQuery(resolvedBackHref, campus)}>
                  返回名单
                </StaticLink>
              </Button>
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="h-11 rounded-[12px] bg-[#1E3A5F] text-[13px] font-semibold text-white hover:bg-[#1E3A5F]/90 disabled:opacity-70"
              >
                {isSubmitting ? "保存中..." : submitLabel}
              </Button>
            </div>
          </div>
        </div>

        <MobileTabBar active="home" items={buildAdminTabItems(campus)} />
      </div>
    </PageShell>
  );
}
