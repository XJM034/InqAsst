import type { AdminEmergencyData } from "@/lib/domain/types";
import {
  buildEmergencyBatchSelectionHint,
  buildEmergencyCoursesLoadingLabel,
  resolveSelectedEmergencyDayLabel,
  withSelectedEmergencyDay,
} from "@/components/app/admin-emergency-client";

const emergencyData: AdminEmergencyData = {
  days: [
    { key: "mon", label: "周一", active: true },
    { key: "tue", label: "周二", active: false },
    { key: "wed", label: "周三", active: false },
  ],
  selectedDayKey: "mon",
  featuredDateLabel: "今日代课老师",
  featuredCourses: [],
  courses: {
    items: [],
    page: 0,
    size: 20,
    totalPages: 0,
    totalElements: 0,
    hasNextPage: false,
    hasPrevPage: false,
  },
};

describe("admin emergency day selection helpers", () => {
  it("overrides the selected day immediately for the rendered tabs", () => {
    expect(withSelectedEmergencyDay(emergencyData, "tue")).toEqual({
      ...emergencyData,
      selectedDayKey: "tue",
      days: [
        { key: "mon", label: "周一", active: false },
        { key: "tue", label: "周二", active: true },
        { key: "wed", label: "周三", active: false },
      ],
    });
  });

  it("builds a loading label for the selected day while courses refresh", () => {
    expect(
      buildEmergencyCoursesLoadingLabel({
        days: emergencyData.days,
        selectedDayKey: "tue",
      }),
    ).toBe("正在切换到周二课程...");
  });

  it("resolves the current day label for the section title", () => {
    expect(
      resolveSelectedEmergencyDayLabel({
        days: emergencyData.days,
        selectedDayKey: "tue",
      }),
    ).toBe("周二");
  });

  it("builds a helpful batch-selection hint based on the selected count", () => {
    expect(buildEmergencyBatchSelectionHint(0)).toBe("勾选同一天内需要一起调整的课节");
    expect(buildEmergencyBatchSelectionHint(1)).toBe("至少再选 1 节课后才能进入批量互换");
    expect(buildEmergencyBatchSelectionHint(3)).toBe("已选 3 节课，可以进入批量互换");
  });
});
