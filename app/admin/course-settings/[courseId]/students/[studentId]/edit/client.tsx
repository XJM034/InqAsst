"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";

import {
  buildAdminCourseRosterHref,
  resolveStaticExportParam,
} from "@/lib/admin-route-hrefs";
import { StudentFormClient } from "@/components/app/student-form-client";
import { PageLoading } from "@/components/app/page-loading";
import { PageStatus } from "@/components/app/page-status";
import { getAdminCourseStudentForm } from "@/lib/services/mobile-app";

function buildBackHref(courseId: string, courseSessionId?: string) {
  return buildAdminCourseRosterHref(courseId, {
    courseSessionId,
  });
}

export function AdminCourseStudentEditClient() {
  const params = useParams<{ courseId: string; studentId: string }>();
  const searchParams = useSearchParams();
  const courseId = resolveStaticExportParam(params.courseId, searchParams.get("courseId"));
  const studentId = resolveStaticExportParam(params.studentId, searchParams.get("studentId"));
  const courseSessionId = searchParams.get("courseSessionId") ?? undefined;
  const campus = searchParams.get("campus") ?? "chenghua";
  const [data, setData] = useState<Awaited<ReturnType<typeof getAdminCourseStudentForm>>>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    getAdminCourseStudentForm(courseId, studentId, courseSessionId, campus)
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
          setError(err instanceof Error ? err.message : "学生表单加载失败，请稍后重试");
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [campus, courseId, studentId, courseSessionId]);

  const backHref = buildBackHref(courseId, courseSessionId);

  if (loading) {
    return <PageLoading />;
  }

  if (error) {
    return (
      <PageStatus
        title="学生表单加载失败"
        description={error}
        secondaryActionLabel="返回名单"
        secondaryActionHref={backHref}
        primaryActionLabel="重新加载"
        onPrimaryAction={() => window.location.reload()}
      />
    );
  }

  if (!data) {
    return (
      <PageStatus
        title="暂无学生信息"
        description="当前学生不存在，或已不在该课程名单中。"
        secondaryActionLabel="返回名单"
        secondaryActionHref={backHref}
      />
    );
  }

  return (
    <StudentFormClient
      courseId={data.courseId}
      studentId={studentId}
      courseCampusId={data.courseCampusId ?? null}
      title={data.title}
      badge={data.badge}
      courseTitle={data.courseTitle}
      courseContext={data.courseContext}
      nameValue={data.nameValue}
      studentIdValue={data.studentIdValue}
      homeroomClassId={data.homeroomClassId ?? null}
      homeroomClasses={data.homeroomClasses ?? []}
      submitLabel={data.submitLabel}
      backHref={backHref}
      campus={campus}
    />
  );
}
