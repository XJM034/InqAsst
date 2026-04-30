"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";

import { resolveStaticExportParam } from "@/lib/admin-route-hrefs";
import { AdminContextCard } from "@/components/app/admin-context-card";
import { AdminSubpageHeader } from "@/components/app/admin-subpage-header";
import { MobileTabBar } from "@/components/app/mobile-tab-bar";
import { PageShell } from "@/components/app/page-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { buildAdminTabItems, normalizeAdminCampus, withCampusQuery } from "@/lib/admin-campus";
import {
  removeAdminCourseSettingsEffectiveCourse,
  updateAdminCourseLocation,
} from "@/lib/services/mobile-client";
import { getAdminCourseSettingsData } from "@/lib/services/mobile-app";
import type { AdminCourseSettingsCourse, AdminCourseSettingsData } from "@/lib/domain/types";
import { navigateTo } from "@/lib/static-navigation";

type CourseEditorData = {
  id: string;
  title: string;
  badge: string;
  intro: string;
  courseTitle: string;
  timeStart: string;
  timeEnd: string;
  location: string;
  teacherLabel: string;
  saveLabel: string;
  canRemoveFromToday: boolean;
  courseSessionId?: string;
};

function splitTimeLabel(timeLabel?: string) {
  if (!timeLabel) {
    return {
      timeStart: "",
      timeEnd: "",
    };
  }

  const [timeStart = "", timeEnd = ""] = timeLabel.split("-");
  return {
    timeStart,
    timeEnd,
  };
}

function findEffectiveCourse(
  baseData: AdminCourseSettingsData,
  courseId: string,
  courseSessionId?: string,
) {
  const preferredId = courseSessionId ? `${courseId}:${courseSessionId}` : courseId;

  return (
    baseData.courses.find((course) => course.id === preferredId) ??
    baseData.courses.find(
      (course) =>
        course.courseId === courseId &&
        (!courseSessionId || course.sessionId === courseSessionId),
    ) ??
    baseData.courses.find((course) => course.courseId === courseId) ??
    null
  );
}

function buildCourseEditorData(
  baseData: AdminCourseSettingsData,
  courseId: string,
  courseSessionId?: string,
): CourseEditorData | null {
  const course = findEffectiveCourse(baseData, courseId, courseSessionId);
  if (!course) {
    return null;
  }

  const { timeStart, timeEnd } = splitTimeLabel(course.timeLabel);

  return {
    id: course.id,
    title: "编辑课程信息",
    badge: course.badgeLabel,
    intro: "当前页面只保留真实接口能力，不再提供本地草稿或浏览器内测试数据。",
    courseTitle: course.title,
    timeStart,
    timeEnd,
    location: course.locationLabel ?? "",
    teacherLabel: course.teacherLabel ?? "待分配老师",
    saveLabel: "保存课程信息",
    canRemoveFromToday: Boolean(course.canRemoveFromToday),
    courseSessionId: courseSessionId ?? course.sessionId,
  };
}

function buildBackHref(returnTo: string | undefined) {
  if (returnTo === "alternate-day") {
    return "/admin/course-settings/alternate-day";
  }

  return "/admin/course-settings";
}

function buildRuleDetail(course: AdminCourseSettingsCourse) {
  if (course.badgeTone !== "today") {
    return "当前课程已进入真实联动链路，老师、学生名单和课程设置都读取同一份今日生效课程数据。";
  }

  // “按其它行课日行课”不是参考旧数据，而是今天整天直接按另一行课日执行。
  return "当前课程属于今日生效课程。若启用“按其它行课日行课”，今天原有课程会整体失效，今天的课程与课程时间会整体切换为所选行课日那一套。";
}

export function AdminCourseEditClient() {
  const params = useParams<{ courseId: string }>();
  const searchParams = useSearchParams();
  const courseId = resolveStaticExportParam(params.courseId, searchParams.get("courseId"));
  const courseSessionId = searchParams.get("courseSessionId") ?? undefined;
  const returnTo = searchParams.get("returnTo") ?? undefined;
  const campus = searchParams.get("campus") ?? undefined;
  const activeCampus = normalizeAdminCampus(campus);
  const [loading, setLoading] = useState(true);
  const [editorData, setEditorData] = useState<CourseEditorData | null>(null);
  const [detailText, setDetailText] = useState("");
  const [courseTitle, setCourseTitle] = useState("");
  const [timeStart, setTimeStart] = useState("");
  const [timeEnd, setTimeEnd] = useState("");
  const [location, setLocation] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    setLoading(true);

    getAdminCourseSettingsData(activeCampus)
      .then((baseData) => {
        const nextData = buildCourseEditorData(baseData, courseId, courseSessionId);
        const matchedCourse = findEffectiveCourse(baseData, courseId, courseSessionId);
        if (cancelled) {
          return;
        }

        setEditorData(nextData);
        setDetailText(matchedCourse ? buildRuleDetail(matchedCourse) : "");
        setCourseTitle(nextData?.courseTitle ?? "");
        setTimeStart(nextData?.timeStart ?? "");
        setTimeEnd(nextData?.timeEnd ?? "");
        setLocation(nextData?.location ?? "");
        setLoading(false);
      })
      .catch(() => {
        if (!cancelled) {
          setEditorData(null);
          setDetailText("");
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [activeCampus, courseId, courseSessionId]);

  const resolvedBackHref = useMemo(
    () => withCampusQuery(buildBackHref(returnTo), activeCampus),
    [activeCampus, returnTo],
  );
  const courseSettingsHref = useMemo(
    () => withCampusQuery("/admin/course-settings", activeCampus),
    [activeCampus],
  );

  async function handleSave() {
    if (!editorData) {
      return;
    }

    setIsSaving(true);
    setMessage("");

    try {
      const saved = await updateAdminCourseLocation(courseId, {
        location: location.trim(),
      });
      setLocation(saved.location ?? "");
      setMessage("上课地点已提交到后端并保存。");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "保存失败，请稍后重试");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleRemoveFromToday() {
    if (!editorData?.courseSessionId || !editorData.canRemoveFromToday) {
      return;
    }

    setIsRemoving(true);
    setMessage("");

    try {
      await removeAdminCourseSettingsEffectiveCourse({
        sessionId: editorData.courseSessionId,
      });
      navigateTo(courseSettingsHref);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "移出失败，请稍后重试");
    } finally {
      setIsRemoving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center text-sm text-[var(--jp-text-muted)]">
        加载中...
      </div>
    );
  }

  if (!editorData) {
    return (
      <div className="flex h-screen items-center justify-center text-sm text-[var(--jp-text-muted)]">
        未找到课程信息
      </div>
    );
  }

  return (
    <PageShell>
      <div className="app-screen">
        <div className="app-scroll pb-4">
          <AdminSubpageHeader title={editorData.title} backHref={resolvedBackHref} />

          <div className="space-y-3.5 px-5 pt-3">
            <AdminContextCard
              title={editorData.courseTitle}
              description={editorData.intro}
              detail={detailText}
            />

            <section className="rounded-[16px] border border-[#E8E5E0] bg-white p-4 shadow-[0_10px_22px_rgba(28,28,28,0.04)]">
              <div className="flex items-center justify-between">
                <h2 className="text-[15px] font-semibold text-[var(--jp-text)]">课程信息</h2>
                <span className="rounded-full bg-[#E8F0FB] px-2.5 py-1 text-[11px] font-semibold text-[#1E3A5F]">
                  {editorData.badge}
                </span>
              </div>

              <div className="mt-3.5 space-y-3.5">
                <div className="space-y-1.5">
                  <p className="text-[11px] font-semibold text-[var(--jp-text-secondary)]">
                    课程名称
                  </p>
                  <Input
                    value={courseTitle}
                    onChange={(event) => setCourseTitle(event.target.value)}
                    disabled
                    className="h-11 rounded-[12px] border border-[#E8E5E0] bg-white px-3.5 text-sm shadow-none focus-visible:ring-0 disabled:opacity-100"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <p className="text-[11px] font-semibold text-[var(--jp-text-secondary)]">
                      开始时间
                    </p>
                    <Input
                      type="time"
                      value={timeStart}
                      onChange={(event) => setTimeStart(event.target.value)}
                      disabled
                      className="h-11 rounded-[12px] border border-[#E8E5E0] bg-white px-3.5 text-sm shadow-none focus-visible:ring-0 disabled:opacity-100"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-[11px] font-semibold text-[var(--jp-text-secondary)]">
                      结束时间
                    </p>
                    <Input
                      type="time"
                      value={timeEnd}
                      onChange={(event) => setTimeEnd(event.target.value)}
                      disabled
                      className="h-11 rounded-[12px] border border-[#E8E5E0] bg-white px-3.5 text-sm shadow-none focus-visible:ring-0 disabled:opacity-100"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <p className="text-[11px] font-semibold text-[var(--jp-text-secondary)]">
                    上课地点
                  </p>
                  <Input
                    value={location}
                    onChange={(event) => setLocation(event.target.value)}
                    placeholder="请输入上课地点"
                    className="h-11 rounded-[12px] border border-[#E8E5E0] bg-white px-3.5 text-sm shadow-none focus-visible:ring-0"
                  />
                </div>

                <div className="space-y-1.5">
                  <p className="text-[11px] font-semibold text-[var(--jp-text-secondary)]">
                    点名老师
                  </p>
                  <Input
                    value={editorData.teacherLabel}
                    disabled
                    className="h-11 rounded-[12px] border border-[#E8E5E0] bg-white px-3.5 text-sm shadow-none focus-visible:ring-0 disabled:opacity-100"
                  />
                </div>
              </div>
            </section>

            <section className="rounded-[16px] border border-[#F2DEC2] bg-[#FFF7EA] p-4 shadow-[0_10px_22px_rgba(196,106,26,0.08)]">
              <div className="space-y-2">
                <p className="text-[15px] font-semibold text-[var(--jp-text)]">今日行课管理</p>
                <p className="text-[12px] leading-5 text-[var(--jp-text-secondary)]">
                  从今日生效课程中移出后，这门课将不再继续出现在今天的课程设置与点名主链里。
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={handleRemoveFromToday}
                disabled={!editorData.canRemoveFromToday || isRemoving || isSaving}
                className="mt-3 h-10 w-full rounded-[10px] border-[#E7CDA9] bg-white text-[12px] font-semibold text-[#A55B14] hover:bg-white disabled:cursor-not-allowed disabled:border-[#E8DCCB] disabled:bg-[#F9F4EC] disabled:text-[#B8A28A]"
              >
                {isRemoving ? "移出中..." : "移出今日行课"}
              </Button>
            </section>

            {message ? (
              <p className="px-0.5 text-[13px] font-medium text-[#1E3A5F]">{message}</p>
            ) : null}

            <Button
              type="button"
              onClick={handleSave}
              disabled={isSaving || isRemoving}
              className="h-11 w-full rounded-[12px] bg-[#1E3A5F] text-[13px] font-semibold text-white hover:bg-[#1E3A5F]/90 disabled:opacity-70"
            >
              {isSaving ? "保存中..." : editorData.saveLabel}
            </Button>
          </div>
        </div>

        <MobileTabBar active="home" items={buildAdminTabItems(activeCampus)} />
      </div>
    </PageShell>
  );
}
