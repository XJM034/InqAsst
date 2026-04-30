"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";

import { normalizeAdminCampus, withCampusQuery } from "@/lib/admin-campus";
import {
  buildAdminEmergencyCourseHref,
  resolveStaticExportParam,
} from "@/lib/admin-route-hrefs";
import { ExternalTeacherFormClient } from "@/components/app/external-teacher-client";
import { PageLoading } from "@/components/app/page-loading";
import { PageStatus } from "@/components/app/page-status";
import { getAdminExternalTeacherForm } from "@/lib/services/mobile-app";

export function AdminExternalTeacherClient() {
  const params = useParams<{ courseId: string }>();
  const searchParams = useSearchParams();
  const courseId = resolveStaticExportParam(params.courseId, searchParams.get("courseId"));
  const courseSessionId = searchParams.get("courseSessionId") ?? courseId;
  const returnHref = searchParams.get("returnHref") ?? undefined;
  const prefillName = searchParams.get("prefillName") ?? undefined;
  const prefillPhone = searchParams.get("prefillPhone") ?? undefined;
  const campus = searchParams.get("campus") ?? undefined;
  const activeCampus = normalizeAdminCampus(campus);

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<Awaited<ReturnType<typeof getAdminExternalTeacherForm>>>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    getAdminExternalTeacherForm(courseId, courseSessionId, activeCampus)
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
          setError(err instanceof Error ? err.message : "外部老师表单加载失败，请稍后重试");
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [activeCampus, courseId, courseSessionId]);

  const backHref = withCampusQuery(
    buildAdminEmergencyCourseHref(courseId, {
      courseSessionId,
    }),
    activeCampus,
  );

  if (loading) {
    return <PageLoading />;
  }

  if (error) {
    return (
      <PageStatus
        title="外部老师表单加载失败"
        description={error}
        secondaryActionLabel="返回课程"
        secondaryActionHref={backHref}
        primaryActionLabel="重新加载"
        onPrimaryAction={() => window.location.reload()}
      />
    );
  }

  if (!data) {
    return (
      <PageStatus
        title="暂无课程信息"
        description="当前课程还没有可录入外部老师的上下文数据。"
        secondaryActionLabel="返回课程"
        secondaryActionHref={backHref}
      />
    );
  }

  return (
    <ExternalTeacherFormClient
      campus={activeCampus}
      courseId={courseId}
      courseSessionId={courseSessionId}
      courseTitle={data.courseTitle}
      courseMeta={data.courseMeta}
      currentTeacherLabel={data.currentTeacherLabel ?? "待分配老师"}
      returnHref={returnHref}
      prefillName={prefillName}
      prefillPhone={prefillPhone}
    />
  );
}
