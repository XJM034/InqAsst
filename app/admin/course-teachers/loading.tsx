"use client";

import { AdminCourseTeachersClient } from "@/components/app/admin-course-teachers-client";
import { AdminSubpageHeader } from "@/components/app/admin-subpage-header";
import { MobileTabBar } from "@/components/app/mobile-tab-bar";
import { PageShell } from "@/components/app/page-shell";
import { buildAdminTabItems, normalizeAdminCampus, withCampusQuery } from "@/lib/admin-campus";
import type { AdminCourseTeachersData } from "@/lib/domain/types";

const FALLBACK_DAY_KEY = "mon";

const LOADING_DATA: AdminCourseTeachersData = {
  title: "查看课程老师",
  searchPlaceholder: "搜索老师姓名 / 手机号",
  days: [
    { key: "mon", label: "周一", active: true },
    { key: "tue", label: "周二" },
    { key: "wed", label: "周三" },
    { key: "thu", label: "周四" },
    { key: "fri", label: "周五" },
    { key: "sat", label: "周六" },
    { key: "sun", label: "周日" },
  ],
  defaultDayKey: FALLBACK_DAY_KEY,
  selectedDayKey: FALLBACK_DAY_KEY,
  teachers: [],
  teachersPage: {
    page: 0,
    size: 20,
    totalPages: 0,
    totalElements: 0,
    hasNextPage: false,
    hasPrevPage: false,
  },
};

export default function Loading() {
  const campus = normalizeAdminCampus(undefined);

  return (
    <PageShell>
      <div className="app-screen">
        <div className="app-scroll pb-4">
          <AdminSubpageHeader
            title={LOADING_DATA.title}
            backHref={withCampusQuery("/admin/home", campus)}
          />
          <AdminCourseTeachersClient
            data={LOADING_DATA}
            loading
            searchQuery=""
            onSearchQueryChange={() => undefined}
            onDayChange={() => undefined}
            onPrevPage={() => undefined}
            onNextPage={() => undefined}
          />
        </div>
        <MobileTabBar active="home" items={buildAdminTabItems(campus)} />
      </div>
    </PageShell>
  );
}
