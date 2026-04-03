import { AdminCourseTeachersClient } from "@/components/app/admin-course-teachers-client";
import { AdminSubpageHeader } from "@/components/app/admin-subpage-header";
import { MobileTabBar } from "@/components/app/mobile-tab-bar";
import { PageShell } from "@/components/app/page-shell";
import { getAdminCourseTeachersData } from "@/lib/services/mobile-app";

export default async function AdminCourseTeachersPage() {
  const data = await getAdminCourseTeachersData();

  return (
    <PageShell>
      <div className="app-screen">
        <div className="app-scroll pb-4">
          <AdminSubpageHeader title={data.title} backHref="/admin/home" />

          <AdminCourseTeachersClient data={data} />
        </div>

        <MobileTabBar
          active="home"
          items={[
            { key: "home", href: "/admin/home" },
            { key: "attendance", href: "/admin/control" },
            { key: "profile", href: "/admin/me" },
          ]}
        />
      </div>
    </PageShell>
  );
}
