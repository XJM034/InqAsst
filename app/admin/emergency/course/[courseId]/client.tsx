"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";

import { normalizeAdminCampus, withCampusQuery } from "@/lib/admin-campus";
import { resolveStaticExportParam } from "@/lib/admin-route-hrefs";
import { TeacherSettingCourseClient } from "@/components/app/teacher-setting-course-client";
import { PageLoading } from "@/components/app/page-loading";
import { PageStatus } from "@/components/app/page-status";
import { getAdminTeacherSettingCourse } from "@/lib/services/mobile-app";

export function AdminTeacherCourseClient() {
  const params = useParams<{ courseId: string }>();
  const searchParams = useSearchParams();
  const courseId = resolveStaticExportParam(params.courseId, searchParams.get("courseId"));
  const courseSessionId = searchParams.get("courseSessionId") ?? courseId;
  const campus = searchParams.get("campus") ?? undefined;
  const successMessage = searchParams.get("notice") ?? undefined;
  const activeCampus = normalizeAdminCampus(campus);

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<Awaited<ReturnType<typeof getAdminTeacherSettingCourse>>>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    getAdminTeacherSettingCourse(courseId, courseSessionId)
      .then((nextData) => {
        if (!cancelled) {
          setData(nextData);
          setError("");
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setData(null);
          setError(err instanceof Error ? err.message : "课程老师信息加载失败，请稍后重试");
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [courseId, courseSessionId]);

  if (loading) {
    return <PageLoading />;
  }

  if (error) {
    return (
      <PageStatus
        title="课程老师信息加载失败"
        description={error}
        secondaryActionLabel="返回代课处理"
        secondaryActionHref={withCampusQuery("/admin/emergency", activeCampus)}
        primaryActionLabel="重新加载"
        onPrimaryAction={() => window.location.reload()}
      />
    );
  }

  if (!data) {
    return (
      <PageStatus
        title="暂无课程老师信息"
        description="当前课程还没有可展示的老师配置。"
        secondaryActionLabel="返回代课处理"
        secondaryActionHref={withCampusQuery("/admin/emergency", activeCampus)}
      />
    );
  }

  return (
    <TeacherSettingCourseClient
      campus={activeCampus}
      courseId={courseId}
      courseSessionId={courseSessionId}
      courseTitle={data.title}
      courseMeta={data.meta}
      currentTeacherLabel={data.currentTeacherLabel ?? "待分配老师"}
      currentTeacherMode={data.currentTeacherMode}
      defaultTeacherLabel={data.defaultTeacherLabel ?? "待分配老师"}
      swapRestoreTarget={data.swapRestoreTarget}
      successMessage={successMessage}
    />
  );
}
