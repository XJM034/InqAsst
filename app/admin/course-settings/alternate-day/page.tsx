"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

import { AdminSubpageHeader } from "@/components/app/admin-subpage-header";
import { MobileTabBar } from "@/components/app/mobile-tab-bar";
import { PageShell } from "@/components/app/page-shell";
import { Button } from "@/components/ui/button";
import { buildAdminTabItems, normalizeAdminCampus, withCampusQuery } from "@/lib/admin-campus";
import { fetchAdminCourseSettingsOverviewClient, updateAdminCourseSettingsRule } from "@/lib/services/mobile-client";
import { navigateTo } from "@/lib/static-navigation";

const DAY_OPTIONS = [
  { value: 1, label: "周一" },
  { value: 2, label: "周二" },
  { value: 3, label: "周三" },
  { value: 4, label: "周四" },
  { value: 5, label: "周五" },
  { value: 6, label: "周六" },
  { value: 7, label: "周日" },
];

export default function AdminCourseAlternateDayPage() {
  const searchParams = useSearchParams();
  const campus = searchParams.get("campus") ?? undefined;
  const activeCampus = normalizeAdminCampus(campus);
  const [selectedWeekday, setSelectedWeekday] = useState<number>(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    fetchAdminCourseSettingsOverviewClient()
      .then((overview) => {
        if (cancelled) {
          return;
        }
        setSelectedWeekday(overview.alternateWeekday ?? overview.defaultWeekday ?? 1);
        setLoading(false);
      })
      .catch((error) => {
        if (cancelled) {
          return;
        }
        setMessage(error instanceof Error ? error.message : "加载失败，请稍后重试");
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleConfirm() {
    setSaving(true);
    setMessage("");

    try {
      // Business semantics:
      // switching to another weekday does not partially "reference" that day.
      // It makes today execute that weekday's full course/time set, while the
      // effective date still stays on today and downstream readers rely on the
      // returned "today effective overview" to stay in sync.
      await updateAdminCourseSettingsRule({
        ruleMode: "ALTERNATE_DAY",
        alternateWeekday: selectedWeekday,
      });
      navigateTo(withCampusQuery("/admin/course-settings", activeCampus));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "提交失败，请稍后重试");
      setSaving(false);
    }
  }

  return (
    <PageShell>
      <div className="app-screen">
        <div className="app-scroll pb-4">
          <AdminSubpageHeader
            title="按照其他行课日行课"
            backHref={withCampusQuery("/admin/course-settings", activeCampus)}
          />

          <div className="space-y-3 px-5 pt-3">
            <section className="rounded-[16px] border border-[#E8E5E0] bg-white p-4 shadow-[0_10px_22px_rgba(28,28,28,0.04)]">
              <h2 className="text-[15px] font-semibold text-[var(--jp-text)]">选择今天按哪一天行课</h2>
              <p className="mt-2 text-[13px] leading-6 text-[var(--jp-text-secondary)]">
                选择后会实时提交到接口，并重新计算今天的生效课程集合。
              </p>

              {loading ? (
                <div className="mt-4 rounded-[14px] border border-dashed border-[#D8D5D0] px-4 py-8 text-center text-[13px] text-[var(--jp-text-muted)]">
                  正在加载当前规则...
                </div>
              ) : (
                <div className="mt-4 grid grid-cols-4 gap-2 sm:grid-cols-7">
                  {DAY_OPTIONS.map((day) => (
                    <button
                      key={day.value}
                      type="button"
                      disabled={saving}
                      onClick={() => setSelectedWeekday(day.value)}
                      className={[
                        "rounded-[12px] px-2 py-3 text-center text-[13px] font-medium",
                        selectedWeekday === day.value
                          ? "bg-[#1E3A5F] text-white"
                          : "border border-[#E8E5E0] bg-[#F5F3F0] text-[var(--jp-text)]",
                        saving ? "cursor-not-allowed opacity-60" : "",
                      ].join(" ")}
                    >
                      {day.label}
                    </button>
                  ))}
                </div>
              )}

              {message ? (
                <p className="mt-4 text-[12px] font-medium text-[#A55B14]">{message}</p>
              ) : null}

              <Button
                type="button"
                onClick={handleConfirm}
                disabled={loading || saving}
                className="mt-4 h-10 w-full rounded-[10px] bg-[#1E3A5F] text-[13px] font-semibold text-white hover:bg-[#1E3A5F]/90"
              >
                {saving ? "提交中..." : "按所选行课日生效"}
              </Button>
            </section>
          </div>
        </div>

        <MobileTabBar active="home" items={buildAdminTabItems(activeCampus)} />
      </div>
    </PageShell>
  );
}
