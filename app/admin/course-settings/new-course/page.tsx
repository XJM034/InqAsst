"use client";

import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";

import { AdminSubpageHeader } from "@/components/app/admin-subpage-header";
import { MobileTabBar } from "@/components/app/mobile-tab-bar";
import { PageShell } from "@/components/app/page-shell";
import { SearchField } from "@/components/app/search-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { buildAdminTabItems, normalizeAdminCampus, withCampusQuery } from "@/lib/admin-campus";
import type {
  AdminCourseSettingsTemporaryCourseOptionDto,
  CampusStudentSearchItemDto,
  CourseSessionTimeSettingDto,
  HomeroomClassListItemDto,
  TeacherEntityDto,
} from "@/lib/services/mobile-schema";
import {
  addAdminCourseSettingsTemporaryCourse,
  fetchAdminCampusClassesClient,
  fetchAdminHomeSummaryClient,
  fetchAdminCourseSettingsTemporaryOptions,
  fetchAdminMeProfileClient,
  fetchAdminTeachersClient,
  fetchAdminTimeSettingsSessionsClient,
  searchAdminCampusStudents,
} from "@/lib/services/mobile-client";
import { navigateTo } from "@/lib/static-navigation";
import { cn } from "@/lib/utils";

type CreateMode = "existing" | "blank";
type BlankTeacherMode = "internal" | "external";
type BlankStudentMode = "internal" | "external";

type BlankCourseForm = {
  courseName: string;
  location: string;
  externalTeacherName: string;
  externalTeacherPhone: string;
  externalStudentName: string;
  externalStudentClassId: string;
};

type BlankCourseStudent =
  | {
      key: string;
      source: "internal";
      studentId: number;
      name: string;
      homeroomClassName?: string | null;
    }
  | {
      key: string;
      source: "external";
      name: string;
      homeroomClassId: number;
      homeroomClassName: string;
    };

function formatDateLabel(value: string) {
  const date = new Date(`${value}T00:00:00+08:00`);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("zh-CN", {
    month: "numeric",
    day: "numeric",
    weekday: "short",
    timeZone: "Asia/Shanghai",
  });
}

function formatTimeLabel(value: string) {
  return new Date(value).toLocaleTimeString("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Shanghai",
  });
}

function formatTimeRange(startAt: string, endAt: string) {
  return `${formatTimeLabel(startAt)}-${formatTimeLabel(endAt)}`;
}

function formatClockText(value?: string | null) {
  if (!value) {
    return "";
  }

  const [hour = "", minute = ""] = value.split(":");
  if (!hour || !minute) {
    return value;
  }

  return `${hour.padStart(2, "0")}:${minute.padStart(2, "0")}`;
}

function formatClockRange(start?: string | null, end?: string | null) {
  const startText = formatClockText(start);
  const endText = formatClockText(end);

  if (!startText || !endText) {
    return null;
  }

  return `${startText}-${endText}`;
}

function getShanghaiTodayDate() {
  const shanghaiNow = new Date(
    new Date().toLocaleString("en-US", { timeZone: "Asia/Shanghai" }),
  );
  const year = shanghaiNow.getFullYear();
  const month = String(shanghaiNow.getMonth() + 1).padStart(2, "0");
  const day = String(shanghaiNow.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function buildSessionDateTime(date: string, time: string) {
  const normalizedTime = time.length === 5 ? `${time}:00` : time;
  return `${date}T${normalizedTime}+08:00`;
}

function parseActualClassTimeRange(range?: string | null) {
  const normalized = range?.trim();
  if (!normalized) {
    return null;
  }

  const [start, end] = normalized.split(/\s*-\s*/);
  if (!start || !end) {
    return null;
  }

  return {
    start: start.trim(),
    end: end.trim(),
  };
}

function getPrimaryTimeSetting(settings: CourseSessionTimeSettingDto[]) {
  return settings[0] ?? null;
}

function getTeacherSearchLabel(teacher: TeacherEntityDto) {
  return `${teacher.name} ${teacher.phone ?? ""}`.trim().toLowerCase();
}

export default function AdminCourseNewCoursePage() {
  const searchParams = useSearchParams();
  const campus = searchParams.get("campus") ?? undefined;
  const activeCampus = normalizeAdminCampus(campus);
  const [options, setOptions] = useState<AdminCourseSettingsTemporaryCourseOptionDto[]>([]);
  const [createMode, setCreateMode] = useState<CreateMode>("existing");
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [setupLoading, setSetupLoading] = useState(true);
  const [setupError, setSetupError] = useState("");
  const [savingSessionId, setSavingSessionId] = useState<string | null>(null);
  const [savingBlankCourse, setSavingBlankCourse] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [teacherQuery, setTeacherQuery] = useState("");
  const [studentQuery, setStudentQuery] = useState("");
  const [message, setMessage] = useState("");
  const [teacherMode, setTeacherMode] = useState<BlankTeacherMode>("internal");
  const [studentMode, setStudentMode] = useState<BlankStudentMode>("internal");
  const [selectedInternalTeacher, setSelectedInternalTeacher] = useState<TeacherEntityDto | null>(
    null,
  );
  const [selectedStudents, setSelectedStudents] = useState<BlankCourseStudent[]>([]);
  const [studentSearchResults, setStudentSearchResults] = useState<CampusStudentSearchItemDto[]>(
    [],
  );
  const [studentSearchError, setStudentSearchError] = useState("");
  const [studentSearchLoading, setStudentSearchLoading] = useState(false);
  const [campusId, setCampusId] = useState<number | null>(null);
  const [teachers, setTeachers] = useState<TeacherEntityDto[]>([]);
  const [homeroomClasses, setHomeroomClasses] = useState<HomeroomClassListItemDto[]>([]);
  const [timeSetting, setTimeSetting] = useState<CourseSessionTimeSettingDto | null>(null);
  const [actualClassTime, setActualClassTime] = useState<{ start: string; end: string } | null>(
    null,
  );
  const [blankForm, setBlankForm] = useState<BlankCourseForm>({
    courseName: "",
    location: "",
    externalTeacherName: "",
    externalTeacherPhone: "",
    externalStudentName: "",
    externalStudentClassId: "",
  });
  const todayDate = useMemo(() => getShanghaiTodayDate(), []);
  const deferredTeacherQuery = useDeferredValue(teacherQuery);
  const deferredStudentQuery = useDeferredValue(studentQuery);
  const studentSearchRequestVersionRef = useRef(0);
  const externalStudentCountRef = useRef(0);

  useEffect(() => {
    let cancelled = false;

    fetchAdminCourseSettingsTemporaryOptions()
      .then((items) => {
        if (cancelled) {
          return;
        }
        setOptions(items);
        setLoadingOptions(false);
      })
      .catch((error) => {
        if (cancelled) {
          return;
        }
        setMessage(error instanceof Error ? error.message : "加载失败，请稍后重试");
        setLoadingOptions(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadBlankCourseSetup() {
      try {
        const [me, internalTeachers, timeSettings, homeSummary] = await Promise.all([
          fetchAdminMeProfileClient(),
          fetchAdminTeachersClient(),
          fetchAdminTimeSettingsSessionsClient({
            date: todayDate,
          }),
          fetchAdminHomeSummaryClient(todayDate),
        ]);
        const nextCampusId = me.campusId ?? null;
        const classes = nextCampusId ? await fetchAdminCampusClassesClient(nextCampusId) : [];

        if (cancelled) {
          return;
        }

        setCampusId(nextCampusId);
        setTeachers(internalTeachers);
        setTimeSetting(getPrimaryTimeSetting(timeSettings));
        setActualClassTime(parseActualClassTimeRange(homeSummary.actualClassTimeRange));
        setHomeroomClasses(classes);
        setSetupError("");
        setSetupLoading(false);
      } catch (error) {
        if (cancelled) {
          return;
        }
        setCampusId(null);
        setTeachers([]);
        setTimeSetting(null);
        setActualClassTime(null);
        setHomeroomClasses([]);
        setSetupError(error instanceof Error ? error.message : "空白课程配置加载失败，请稍后重试");
        setSetupLoading(false);
      }
    }

    void loadBlankCourseSetup();

    return () => {
      cancelled = true;
    };
  }, [todayDate]);

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const visibleOptions = useMemo(
    () =>
      normalizedQuery
        ? options.filter((item) =>
            `${item.courseName} ${item.location ?? ""} ${item.effectiveTeacherName ?? ""}`
              .toLowerCase()
              .includes(normalizedQuery),
          )
        : options,
    [normalizedQuery, options],
  );
  const sortedTeachers = useMemo(
    () => [...teachers].sort((left, right) => left.name.localeCompare(right.name, "zh-CN")),
    [teachers],
  );
  const filteredTeachers = useMemo(() => {
    const keyword = deferredTeacherQuery.trim().toLowerCase();
    const items = sortedTeachers.filter((teacher) => teacher.id !== selectedInternalTeacher?.id);

    if (!keyword) {
      return [];
    }

    return items.filter((teacher) => getTeacherSearchLabel(teacher).includes(keyword));
  }, [deferredTeacherQuery, selectedInternalTeacher?.id, sortedTeachers]);
  const selectedInternalStudentIds = useMemo(
    () =>
      new Set(
        selectedStudents
          .filter((student) => student.source === "internal")
          .map((student) => student.studentId),
      ),
    [selectedStudents],
  );
  const internalStudentCount = useMemo(
    () => selectedStudents.filter((student) => student.source === "internal").length,
    [selectedStudents],
  );
  const externalStudentCount = useMemo(
    () => selectedStudents.filter((student) => student.source === "external").length,
    [selectedStudents],
  );
  const actualTimeRange = formatClockRange(actualClassTime?.start, actualClassTime?.end);
  const rollCallTimeRange = formatClockRange(
    timeSetting?.rollCallStartTime,
    timeSetting?.rollCallEndTime,
  );
  const resolvedSessionStartAt =
    actualClassTime?.start && actualClassTime.end
      ? buildSessionDateTime(todayDate, actualClassTime.start)
      : null;
  const resolvedSessionEndAt =
    actualClassTime?.start && actualClassTime.end
      ? buildSessionDateTime(todayDate, actualClassTime.end)
      : null;

  function findInternalTeacherByPhone(phone: string) {
    const normalizedPhone = phone.trim();
    if (!normalizedPhone) {
      return null;
    }

    return (
      sortedTeachers.find((teacher) => (teacher.phone ?? "").trim() === normalizedPhone) ?? null
    );
  }

  function switchToInternalTeacher(teacher: TeacherEntityDto) {
    setTeacherMode("internal");
    setSelectedInternalTeacher(teacher);
    setTeacherQuery("");
    setBlankForm((current) => ({
      ...current,
      externalTeacherName: "",
      externalTeacherPhone: "",
    }));
    setMessage("该手机号老师已在系统，已切换为系统内老师，请确认后再提交");
  }

  function maybeHandleExternalTeacherPhoneConflict(options?: {
    requireAbortMessage?: boolean;
  }) {
    if (teacherMode !== "external") {
      return false;
    }

    const matchedTeacher = findInternalTeacherByPhone(blankForm.externalTeacherPhone);
    if (!matchedTeacher) {
      return false;
    }

    const shouldSwitch = window.confirm(
      `该手机号老师已在系统：${matchedTeacher.name}，是否改为该系统老师？`,
    );
    if (shouldSwitch) {
      switchToInternalTeacher(matchedTeacher);
      return true;
    }

    if (options?.requireAbortMessage) {
      setMessage("该手机号老师已在系统，请改为系统内老师后再提交");
      return true;
    }

    return false;
  }

  useEffect(() => {
    const requestVersion = studentSearchRequestVersionRef.current + 1;
    studentSearchRequestVersionRef.current = requestVersion;

    if (createMode !== "blank" || studentMode !== "internal") {
      setStudentSearchResults([]);
      setStudentSearchError("");
      setStudentSearchLoading(false);
      return;
    }

    const keyword = deferredStudentQuery.trim();
    if (!keyword) {
      setStudentSearchResults([]);
      setStudentSearchError("");
      setStudentSearchLoading(false);
      return;
    }

    if (keyword.length < 2) {
      setStudentSearchResults([]);
      setStudentSearchError("");
      setStudentSearchLoading(false);
      return;
    }

    if (!campusId) {
      setStudentSearchResults([]);
      setStudentSearchError("当前校区信息缺失，无法搜索系统内学生");
      setStudentSearchLoading(false);
      return;
    }

    setStudentSearchLoading(true);
    setStudentSearchError("");

    const timer = window.setTimeout(() => {
      searchAdminCampusStudents(campusId, keyword, 10)
        .then((results) => {
          if (studentSearchRequestVersionRef.current === requestVersion) {
            setStudentSearchResults(
              results.filter((item) => !selectedInternalStudentIds.has(item.studentId)),
            );
            setStudentSearchLoading(false);
          }
        })
        .catch((error) => {
          if (studentSearchRequestVersionRef.current === requestVersion) {
            setStudentSearchResults([]);
            setStudentSearchError(
              error instanceof Error ? error.message : "搜索系统内学生失败，请稍后重试",
            );
            setStudentSearchLoading(false);
          }
        });
    }, 300);

    return () => {
      window.clearTimeout(timer);
    };
  }, [
    campusId,
    createMode,
    deferredStudentQuery,
    selectedInternalStudentIds,
    studentMode,
  ]);

  async function handleAdd(sessionId: number) {
    setSavingSessionId(String(sessionId));
    setMessage("");

    try {
      await addAdminCourseSettingsTemporaryCourse({
        sessionId: String(sessionId),
      });
      navigateTo(withCampusQuery("/admin/course-settings", activeCampus));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "新增失败，请稍后重试");
    } finally {
      setSavingSessionId(null);
    }
  }

  async function handleCreateBlankCourse() {
    const courseName = blankForm.courseName.trim();
    const location = blankForm.location.trim();
    const externalTeacherName = blankForm.externalTeacherName.trim();
    const externalTeacherPhone = blankForm.externalTeacherPhone.trim();

    if (!courseName) {
      setMessage("请填写课程名称");
      return;
    }

    if (!resolvedSessionStartAt || !resolvedSessionEndAt) {
      setMessage("请先在时间设置里配置实际上课时间");
      return;
    }

    if (selectedStudents.length === 0) {
      setMessage("请至少添加 1 名学生");
      return;
    }

    if (teacherMode === "internal" && !selectedInternalTeacher) {
      setMessage("请至少添加 1 名老师");
      return;
    }

    if (teacherMode === "external" && !externalTeacherName && !externalTeacherPhone) {
      setMessage("请至少添加 1 名老师");
      return;
    }

    if (teacherMode === "external" && !externalTeacherPhone) {
      setMessage("请输入系统外老师手机号");
      return;
    }

    if (
      teacherMode === "external" &&
      (externalTeacherName.length > 0 || externalTeacherPhone.length > 0) &&
      !externalTeacherName
    ) {
      setMessage("请输入系统外老师姓名");
      return;
    }

    if (
      teacherMode === "external" &&
      maybeHandleExternalTeacherPhoneConflict({ requireAbortMessage: true })
    ) {
      return;
    }

    setSavingBlankCourse(true);
    setMessage("");

    try {
      await addAdminCourseSettingsTemporaryCourse({
        date: todayDate,
        courseName,
        sessionStartAt: resolvedSessionStartAt,
        sessionEndAt: resolvedSessionEndAt,
        location: location || undefined,
        teacher:
          teacherMode === "internal" && selectedInternalTeacher
            ? {
                source: "INTERNAL",
                teacherId: selectedInternalTeacher.id,
              }
            : teacherMode === "external" && externalTeacherName
              ? {
                  source: "EXTERNAL",
                  name: externalTeacherName,
                  phone: externalTeacherPhone,
                }
              : undefined,
        students: selectedStudents.map((student) =>
          student.source === "internal"
            ? {
                source: "INTERNAL" as const,
                studentId: student.studentId,
              }
            : {
                source: "EXTERNAL" as const,
                name: student.name,
                homeroomClassId: student.homeroomClassId,
              },
        ),
      });
      navigateTo(withCampusQuery("/admin/course-settings", activeCampus));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "新增失败，请稍后重试");
    } finally {
      setSavingBlankCourse(false);
    }
  }

  function handleModeChange(mode: CreateMode) {
    setCreateMode(mode);
    setMessage("");
  }

  function updateBlankForm<Key extends keyof BlankCourseForm>(
    key: Key,
    value: BlankCourseForm[Key],
  ) {
    setBlankForm((current) => ({
      ...current,
      [key]: value,
    }));
    setMessage("");
  }

  function handleTeacherModeChange(mode: BlankTeacherMode) {
    setTeacherMode(mode);
    setMessage("");
  }

  function handleStudentModeChange(mode: BlankStudentMode) {
    setStudentMode(mode);
    setMessage("");
    setStudentSearchError("");
  }

  function selectInternalTeacher(teacher: TeacherEntityDto) {
    setSelectedInternalTeacher(teacher);
    setTeacherQuery("");
    setMessage("");
  }

  function clearInternalTeacherSelection() {
    setSelectedInternalTeacher(null);
    setTeacherQuery("");
    setMessage("");
  }

  function addInternalStudent(student: CampusStudentSearchItemDto) {
    setSelectedStudents((current) => {
      if (current.some((item) => item.source === "internal" && item.studentId === student.studentId)) {
        return current;
      }

      return [
        ...current,
        {
          key: `internal-${student.studentId}`,
          source: "internal",
          studentId: student.studentId,
          name: student.name,
          homeroomClassName: student.homeroomClassName,
        },
      ];
    });
    setStudentQuery("");
    setStudentSearchResults([]);
    setStudentSearchError("");
    setMessage("");
  }

  function addExternalStudent() {
    const name = blankForm.externalStudentName.trim();
    const classId = Number(blankForm.externalStudentClassId);
    const homeroomClass = homeroomClasses.find((item) => item.id === classId);

    if (!name) {
      setMessage("请输入系统外学生姓名");
      return;
    }

    if (!homeroomClass) {
      setMessage("请选择系统外学生的行政班");
      return;
    }

    externalStudentCountRef.current += 1;

    setSelectedStudents((current) => [
      ...current,
      {
        key: `external-${externalStudentCountRef.current}`,
        source: "external",
        name,
        homeroomClassId: homeroomClass.id,
        homeroomClassName: homeroomClass.name,
      },
    ]);
    setBlankForm((current) => ({
      ...current,
      externalStudentName: "",
      externalStudentClassId: "",
    }));
    setMessage("");
  }

  function removeStudent(studentKey: string) {
    setSelectedStudents((current) => current.filter((student) => student.key !== studentKey));
    setMessage("");
  }

  return (
    <PageShell>
      <div className="app-screen">
        <div className="app-scroll pb-4">
          <AdminSubpageHeader
            title="临时新增课程"
            backHref={withCampusQuery("/admin/course-settings", activeCampus)}
            trailing={
              !loadingOptions ? (
                <span className="rounded-full bg-[#F5F3F0] px-2.5 py-1 text-[10px] font-semibold text-[var(--jp-text-muted)]">
                  {createMode === "blank"
                    ? "空白课程"
                    : options.length > 0
                      ? `候选 ${options.length} 节`
                      : "暂无候选课程"}
                </span>
              ) : null
            }
          />

          <div className="space-y-3 px-5 pt-3">
            <section className="rounded-[16px] border border-[#E8E5E0] bg-white p-4 shadow-[0_10px_22px_rgba(28,28,28,0.04)]">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-[15px] font-semibold text-[var(--jp-text)]">选择新增方式</h2>
                  <p className="mt-2 text-[13px] leading-6 text-[var(--jp-text-secondary)]">
                    已有课节适合快速加入今天，空白课程适合管理员补一条临时课，并当场补齐老师和学生。
                  </p>
                </div>
                <span className="shrink-0 rounded-full bg-[#FFF4EA] px-2.5 py-1 text-[10px] font-semibold text-[var(--jp-accent)]">
                  {formatDateLabel(todayDate)}
                </span>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleModeChange("existing")}
                  className={cn(
                    "rounded-[12px] px-3 py-3 text-left text-[13px] font-medium transition-colors",
                    createMode === "existing"
                      ? "bg-[#1E3A5F] text-white"
                      : "border border-[#E8E5E0] bg-[#F5F3F0] text-[var(--jp-text)]",
                  )}
                >
                  从已有课程添加
                </button>
                <button
                  type="button"
                  onClick={() => handleModeChange("blank")}
                  className={cn(
                    "rounded-[12px] px-3 py-3 text-left text-[13px] font-medium transition-colors",
                    createMode === "blank"
                      ? "bg-[#1E3A5F] text-white"
                      : "border border-[#E8E5E0] bg-[#F5F3F0] text-[var(--jp-text)]",
                  )}
                >
                  添加空白课程
                </button>
              </div>

              {createMode === "existing" ? (
                <>
                  <p className="mt-4 text-[12px] leading-5 text-[var(--jp-text-secondary)]">
                    当前还不在“今日生效课程”里的候选课节会显示在下面，加入后会实时同步到接口。
                  </p>
                  <SearchField
                    value={searchQuery}
                    onChange={setSearchQuery}
                    placeholder="搜索课程名 / 上课地点 / 老师"
                    className="mt-4 h-[42px]"
                  />
                </>
              ) : (
                <p className="mt-4 text-[12px] leading-5 text-[var(--jp-text-secondary)]">
                  空白课程不再手填时间，会上下课时间设置里当天的已配置结果；学生至少添加 1 人，老师可按系统内 / 系统外两种来源补充。
                </p>
              )}
            </section>

            <section className="rounded-[16px] border border-[#E8E5E0] bg-white p-3 shadow-[0_10px_22px_rgba(28,28,28,0.04)]">
              {createMode === "existing" ? (
                loadingOptions ? (
                  <div className="rounded-[14px] border border-dashed border-[#D8D5D0] px-4 py-8 text-center text-[13px] text-[var(--jp-text-muted)]">
                    正在加载候选课程...
                  </div>
                ) : visibleOptions.length === 0 ? (
                  <div className="rounded-[14px] border border-dashed border-[#D8D5D0] px-4 py-8 text-center text-[13px] text-[var(--jp-text-muted)]">
                    当前没有可加入今天的候选课程，可以切到“添加空白课程”手动新增。
                  </div>
                ) : (
                  <div className="space-y-3">
                    {visibleOptions.map((item) => (
                      <article
                        key={item.sessionId}
                        className="rounded-[14px] border border-[#E8E5E0] bg-white p-3 shadow-[0_8px_18px_rgba(28,28,28,0.03)]"
                      >
                        <div className="space-y-1">
                          <p className="text-sm font-semibold text-[var(--jp-text)]">{item.courseName}</p>
                          <p className="text-xs text-[var(--jp-text-secondary)]">
                            {`${formatDateLabel(item.sessionDate)} · ${formatTimeRange(item.sessionStartAt, item.sessionEndAt)} · ${item.location?.trim() || "地点待定"} · ${item.effectiveTeacherName?.trim() || "待分配老师"} · ${item.studentCount} 人`}
                          </p>
                        </div>

                        <Button
                          type="button"
                          onClick={() => handleAdd(item.sessionId)}
                          disabled={savingSessionId !== null || savingBlankCourse}
                          className="mt-3 h-8 rounded-[10px] bg-[#1E3A5F] px-4 text-[11px] font-semibold text-white hover:bg-[#1E3A5F]/90"
                        >
                          {savingSessionId === String(item.sessionId) ? "加入中..." : "加入今日生效课程"}
                        </Button>
                      </article>
                    ))}
                  </div>
                )
              ) : setupLoading ? (
                <div className="rounded-[14px] border border-dashed border-[#D8D5D0] px-4 py-8 text-center text-[13px] text-[var(--jp-text-muted)]">
                  正在加载空白课程配置...
                </div>
              ) : setupError ? (
                <div className="rounded-[14px] border border-dashed border-[#E8D2C7] bg-[#FFF8F2] px-4 py-6 text-[13px] leading-6 text-[#A55B14]">
                  {setupError}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <p className="text-[11px] font-semibold text-[var(--jp-text-secondary)]">
                      课程名称
                    </p>
                    <Input
                      value={blankForm.courseName}
                      onChange={(event) => updateBlankForm("courseName", event.target.value)}
                      placeholder="例如：篮球加练 / 周末补课"
                      className="h-11 rounded-[12px] border border-[#E8E5E0] bg-white px-3.5 text-sm shadow-none focus-visible:ring-0"
                    />
                  </div>

                  <div className="rounded-[14px] border border-[#E8E5E0] bg-[#FAF8F5] p-3.5">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-[12px] bg-white px-3 py-3 shadow-[0_8px_18px_rgba(28,28,28,0.03)]">
                        <p className="text-[11px] font-semibold text-[var(--jp-text-secondary)]">
                          上课时间
                        </p>
                        <p className="mt-1.5 text-[13px] font-semibold text-[var(--jp-text)]">
                          {actualTimeRange ?? "未配置"}
                        </p>
                      </div>
                      <div className="rounded-[12px] bg-white px-3 py-3 shadow-[0_8px_18px_rgba(28,28,28,0.03)]">
                        <p className="text-[11px] font-semibold text-[var(--jp-text-secondary)]">
                          点名时间
                        </p>
                        <p className="mt-1.5 text-[13px] font-semibold text-[var(--jp-text)]">
                          {rollCallTimeRange}
                        </p>
                      </div>
                    </div>
                    <p className="mt-3 text-[11px] leading-5 text-[var(--jp-text-secondary)]">
                      空白课程会直接读取今天时间设置里的实际上课时间；点名时间会按实际上课开始时间前后 5 分钟自动带出，并与时间设置页保持一致。
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <p className="text-[11px] font-semibold text-[var(--jp-text-secondary)]">
                      上课地点
                    </p>
                    <Input
                      value={blankForm.location}
                      onChange={(event) => updateBlankForm("location", event.target.value)}
                      placeholder="可选，未填则显示地点待定"
                      className="h-11 rounded-[12px] border border-[#E8E5E0] bg-white px-3.5 text-sm shadow-none focus-visible:ring-0"
                    />
                  </div>

                  <div className="space-y-3 rounded-[14px] border border-[#E8E5E0] bg-[#FCFBF9] p-3.5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-[13px] font-semibold text-[var(--jp-text)]">上课老师</h3>
                        <p className="mt-1 text-[11px] leading-5 text-[var(--jp-text-secondary)]">
                          老师支持系统内直接选择，也支持系统外手动录入；未填写时会显示为待分配老师。
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => handleTeacherModeChange("internal")}
                        className={cn(
                          "rounded-[11px] px-3 py-2.5 text-left text-[12px] font-medium",
                          teacherMode === "internal"
                            ? "bg-[#1E3A5F] text-white"
                            : "border border-[#E8E5E0] bg-white text-[var(--jp-text)]",
                        )}
                      >
                        系统内老师
                      </button>
                      <button
                        type="button"
                        onClick={() => handleTeacherModeChange("external")}
                        className={cn(
                          "rounded-[11px] px-3 py-2.5 text-left text-[12px] font-medium",
                          teacherMode === "external"
                            ? "bg-[#1E3A5F] text-white"
                            : "border border-[#E8E5E0] bg-white text-[var(--jp-text)]",
                        )}
                      >
                        系统外老师
                      </button>
                    </div>

                    {teacherMode === "internal" ? (
                      <div className="space-y-3">
                        {selectedInternalTeacher ? (
                          <div className="flex items-start justify-between rounded-[12px] border border-[#D4E1EF] bg-[#EEF4FA] px-3 py-3">
                            <div>
                              <p className="text-[13px] font-semibold text-[#1E3A5F]">
                                {selectedInternalTeacher.name}
                              </p>
                              <p className="mt-1 text-[11px] text-[#56718D]">
                                {selectedInternalTeacher.phone?.trim()
                                  ? `手机号 ${selectedInternalTeacher.phone}`
                                  : "后端未返回手机号"}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={clearInternalTeacherSelection}
                              className="text-[11px] font-semibold text-[#1E3A5F]"
                            >
                              改选
                            </button>
                          </div>
                        ) : (
                          <>
                            <SearchField
                              value={teacherQuery}
                              onChange={setTeacherQuery}
                              placeholder="搜索系统内老师姓名 / 手机号"
                              className="h-[42px]"
                            />
                            <div className="max-h-[220px] space-y-2 overflow-y-auto">
                              {filteredTeachers.length > 0 ? (
                                filteredTeachers.map((teacher) => (
                                  <button
                                    key={teacher.id}
                                    type="button"
                                    onClick={() => selectInternalTeacher(teacher)}
                                    className="w-full rounded-[12px] border border-[#E8E5E0] bg-white px-3 py-3 text-left shadow-[0_8px_18px_rgba(28,28,28,0.03)]"
                                  >
                                    <p className="text-[13px] font-semibold text-[var(--jp-text)]">
                                      {teacher.name}
                                    </p>
                                    <p className="mt-1 text-[11px] text-[var(--jp-text-secondary)]">
                                      {teacher.phone?.trim()
                                        ? `手机号 ${teacher.phone}`
                                        : "后端未返回手机号"}
                                    </p>
                                  </button>
                                ))
                              ) : (
                                <div className="rounded-[12px] border border-dashed border-[#D8D5D0] px-3 py-4 text-center text-[12px] text-[var(--jp-text-muted)]">
                                  未找到匹配的系统内老师
                                </div>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="space-y-1.5">
                          <p className="text-[11px] font-semibold text-[var(--jp-text-secondary)]">
                            老师姓名
                          </p>
                          <Input
                            value={blankForm.externalTeacherName}
                            onChange={(event) =>
                              updateBlankForm("externalTeacherName", event.target.value)
                            }
                            placeholder="请输入系统外老师姓名"
                            className="h-11 rounded-[12px] border border-[#E8E5E0] bg-white px-3.5 text-sm shadow-none focus-visible:ring-0"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <p className="text-[11px] font-semibold text-[var(--jp-text-secondary)]">
                            手机号
                          </p>
                          <Input
                            value={blankForm.externalTeacherPhone}
                            onChange={(event) =>
                              updateBlankForm("externalTeacherPhone", event.target.value)
                            }
                            onBlur={() => {
                              maybeHandleExternalTeacherPhoneConflict();
                            }}
                            placeholder="可选，便于后续识别"
                            className="h-11 rounded-[12px] border border-[#E8E5E0] bg-white px-3.5 text-sm shadow-none focus-visible:ring-0"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3 rounded-[14px] border border-[#E8E5E0] bg-[#FCFBF9] p-3.5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-[13px] font-semibold text-[var(--jp-text)]">学生名单</h3>
                        <p className="mt-1 text-[11px] leading-5 text-[var(--jp-text-secondary)]">
                          至少添加 1 名学生，可混合系统内与系统外学生一起创建。
                        </p>
                      </div>
                      <span className="rounded-full bg-[#FFF4EA] px-2.5 py-1 text-[10px] font-semibold text-[#A55B14]">
                        已添加 {selectedStudents.length} 人
                      </span>
                    </div>

                    <div className="rounded-[12px] border border-[#E8E5E0] bg-white px-3 py-3 text-[11px] leading-5 text-[var(--jp-text-secondary)]">
                      系统内 {internalStudentCount} 人，系统外 {externalStudentCount} 人
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => handleStudentModeChange("internal")}
                        className={cn(
                          "rounded-[11px] px-3 py-2.5 text-left text-[12px] font-medium",
                          studentMode === "internal"
                            ? "bg-[#1E3A5F] text-white"
                            : "border border-[#E8E5E0] bg-white text-[var(--jp-text)]",
                        )}
                      >
                        系统内学生
                      </button>
                      <button
                        type="button"
                        onClick={() => handleStudentModeChange("external")}
                        className={cn(
                          "rounded-[11px] px-3 py-2.5 text-left text-[12px] font-medium",
                          studentMode === "external"
                            ? "bg-[#1E3A5F] text-white"
                            : "border border-[#E8E5E0] bg-white text-[var(--jp-text)]",
                        )}
                      >
                        系统外学生
                      </button>
                    </div>

                    {studentMode === "internal" ? (
                      <div className="space-y-3">
                        <SearchField
                          value={studentQuery}
                          onChange={setStudentQuery}
                          placeholder="搜索系统内学生姓名"
                          className="h-[42px]"
                        />
                        {studentQuery.trim().length > 0 ? (
                          <div className="rounded-[12px] border border-[#E8E5E0] bg-white p-2">
                            {studentQuery.trim().length < 2 ? (
                              <p className="px-2 py-2 text-[12px] text-[var(--jp-text-secondary)]">
                                输入至少 2 个字后开始搜索系统内学生。
                              </p>
                            ) : studentSearchLoading ? (
                              <p className="px-2 py-2 text-[12px] text-[var(--jp-text-secondary)]">
                                正在搜索系统内学生...
                              </p>
                            ) : studentSearchError ? (
                              <p className="px-2 py-2 text-[12px] text-[#D32F2F]">
                                {studentSearchError}
                              </p>
                            ) : studentSearchResults.length > 0 ? (
                              <div className="space-y-1">
                                {studentSearchResults.map((student) => (
                                  <button
                                    key={student.studentId}
                                    type="button"
                                    onClick={() => addInternalStudent(student)}
                                    className="w-full rounded-[10px] px-2 py-2 text-left transition-colors hover:bg-[#F8F6F3]"
                                  >
                                    <p className="text-[13px] font-semibold text-[var(--jp-text)]">
                                      {student.name}
                                    </p>
                                    <p className="mt-1 text-[11px] text-[var(--jp-text-secondary)]">
                                      {`学生ID ${student.studentId} · ${student.homeroomClassName ?? "未分班"}`}
                                    </p>
                                  </button>
                                ))}
                              </div>
                            ) : (
                              <p className="px-2 py-2 text-[12px] text-[var(--jp-text-secondary)]">
                                当前没有匹配的系统内学生，可切到“系统外学生”手动添加。
                              </p>
                            )}
                          </div>
                        ) : null}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="space-y-1.5">
                          <p className="text-[11px] font-semibold text-[var(--jp-text-secondary)]">
                            学生姓名
                          </p>
                          <Input
                            value={blankForm.externalStudentName}
                            onChange={(event) =>
                              updateBlankForm("externalStudentName", event.target.value)
                            }
                            placeholder="请输入系统外学生姓名"
                            className="h-11 rounded-[12px] border border-[#E8E5E0] bg-white px-3.5 text-sm shadow-none focus-visible:ring-0"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <p className="text-[11px] font-semibold text-[var(--jp-text-secondary)]">
                            行政班
                          </p>
                          <select
                            value={blankForm.externalStudentClassId}
                            onChange={(event) =>
                              updateBlankForm("externalStudentClassId", event.target.value)
                            }
                            className="h-11 w-full rounded-[12px] border border-[#E8E5E0] bg-white px-3.5 text-sm text-[var(--jp-text)] shadow-none focus:outline-none"
                          >
                            <option value="">请选择行政班</option>
                            {homeroomClasses.map((item) => (
                              <option key={item.id} value={item.id}>
                                {item.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        {homeroomClasses.length === 0 ? (
                          <div className="rounded-[12px] border border-dashed border-[#D8D5D0] px-3 py-4 text-center text-[12px] text-[var(--jp-text-muted)]">
                            当前校区还没有可用行政班，暂时无法录入系统外学生。
                          </div>
                        ) : (
                          <Button
                            type="button"
                            onClick={addExternalStudent}
                            className="h-10 rounded-[10px] bg-[#FFF4EA] text-[12px] font-semibold text-[#A55B14] hover:bg-[#FFF4EA]/90"
                          >
                            添加系统外学生
                          </Button>
                        )}
                      </div>
                    )}

                    <div className="space-y-2">
                      {selectedStudents.length > 0 ? (
                        selectedStudents.map((student) => (
                          <div
                            key={student.key}
                            className="flex items-start justify-between rounded-[12px] border border-[#E8E5E0] bg-white px-3 py-3 shadow-[0_8px_18px_rgba(28,28,28,0.03)]"
                          >
                            <div>
                              <div className="flex flex-wrap items-center gap-1.5">
                                <p className="text-[13px] font-semibold text-[var(--jp-text)]">
                                  {student.name}
                                </p>
                                <span
                                  className={cn(
                                    "rounded-full px-2 py-0.5 text-[10px] font-semibold",
                                    student.source === "internal"
                                      ? "bg-[#E8F0FB] text-[#1E3A5F]"
                                      : "bg-[#FFF4EA] text-[#A55B14]",
                                  )}
                                >
                                  {student.source === "internal" ? "系统内" : "系统外"}
                                </span>
                              </div>
                              <p className="mt-1 text-[11px] text-[var(--jp-text-secondary)]">
                                {student.source === "internal"
                                  ? `学生ID ${student.studentId} · ${student.homeroomClassName ?? "未分班"}`
                                  : `行政班 ${student.homeroomClassName}`}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeStudent(student.key)}
                              className="text-[11px] font-semibold text-[var(--jp-text-secondary)]"
                            >
                              移除
                            </button>
                          </div>
                        ))
                      ) : (
                        <div className="rounded-[12px] border border-dashed border-[#D8D5D0] px-3 py-4 text-center text-[12px] text-[var(--jp-text-muted)]">
                          还没有添加学生，保存前至少补 1 名学生。
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="rounded-[14px] border border-dashed border-[#D8D5D0] bg-[#FAF8F5] px-3.5 py-3 text-[12px] leading-6 text-[var(--jp-text-secondary)]">
                    保存后会按
                    <span className="font-semibold text-[var(--jp-text)]">
                      {` ${formatDateLabel(todayDate)} `}
                    </span>
                    创建临时课记录，实际上课时间直接带出
                    <span className="font-semibold text-[var(--jp-text)]">
                      {` ${actualTimeRange ?? "未配置"} `}
                    </span>
                    ，点名时间当前显示为
                    <span className="font-semibold text-[var(--jp-text)]">
                      {` ${rollCallTimeRange} `}
                    </span>
                    。
                  </div>

                  <Button
                    type="button"
                    onClick={handleCreateBlankCourse}
                    disabled={
                      savingBlankCourse ||
                      savingSessionId !== null ||
                      !resolvedSessionStartAt ||
                      !resolvedSessionEndAt
                    }
                    className="h-10 w-full rounded-[10px] bg-[#1E3A5F] text-[13px] font-semibold text-white hover:bg-[#1E3A5F]/90"
                  >
                    {savingBlankCourse
                      ? "新增中..."
                      : resolvedSessionStartAt && resolvedSessionEndAt
                        ? "新增空白课程"
                        : "请先配置上课时间"}
                  </Button>
                </div>
              )}

              {message ? (
                <p className="mt-3 text-[12px] font-medium text-[#A55B14]">{message}</p>
              ) : null}
            </section>
          </div>
        </div>

        <MobileTabBar active="home" items={buildAdminTabItems(activeCampus)} />
      </div>
    </PageShell>
  );
}
