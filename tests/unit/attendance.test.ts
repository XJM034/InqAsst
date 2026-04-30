import {
  cycleAttendanceStatus,
  getAttendanceSummary,
  getBannerToneByWindowState,
} from "@/lib/domain/attendance";
import type { AttendanceStudent } from "@/lib/domain/types";

describe("attendance domain helpers", () => {
  it("cycles attendance status in the expected order", () => {
    expect(cycleAttendanceStatus("unmarked")).toBe("absent");
    expect(cycleAttendanceStatus("absent")).toBe("leave");
    expect(cycleAttendanceStatus("leave")).toBe("present");
    expect(cycleAttendanceStatus("present")).toBe("absent");
  });

  it("summarizes attendance counts and manager updates", () => {
    const students: AttendanceStudent[] = [
      {
        id: "1",
        name: "小明",
        homeroomClass: "一班",
        status: "present",
      },
      {
        id: "2",
        name: "小红",
        homeroomClass: "一班",
        status: "leave",
        managerUpdated: true,
      },
      {
        id: "3",
        name: "小刚",
        homeroomClass: "二班",
        status: "unmarked",
      },
      {
        id: "4",
        name: "小丽",
        homeroomClass: "二班",
        status: "absent",
        managerUpdated: true,
      },
    ];

    expect(getAttendanceSummary(students)).toEqual({
      expected: 4,
      present: 1,
      leave: 1,
      unmarked: 1,
      absent: 1,
      managerUpdated: 2,
    });
  });

  it("maps late windows to warning tone and all others to info", () => {
    expect(getBannerToneByWindowState("late")).toBe("warning");
    expect(getBannerToneByWindowState("active")).toBe("info");
    expect(getBannerToneByWindowState("upcoming")).toBe("info");
  });
});
