import type { AdminUnarrivedData } from "@/lib/domain/types";
import {
  buildUnarrivedCollapsedByGroupId,
  filterUnarrivedGroups,
  getManagedStudentCount,
  getResolvedStudentCount,
  isUnarrivedGroupCollapsed,
  toggleUnarrivedGroupCollapsed,
} from "@/components/app/admin-unarrived-client";
import {
  ADMIN_ATTENDANCE_COPY_FEEDBACK_LABELS,
  ADMIN_ATTENDANCE_COPY_LABELS,
} from "@/components/app/admin-attendance-top-tools";
import {
  buildAdminAttendanceSessionTimingLabel,
  buildAdminAttendanceSubtitle,
  buildTeacherAttendanceSubtitle,
} from "@/lib/admin-attendance-header";

const groups: AdminUnarrivedData["groups"] = [
  {
    id: "class:1",
    label: "Class One",
    meta: "",
    students: [
      {
        id: "student-1",
        studentId: "1",
        name: "Alice",
        courseId: "101",
        courseSessionId: "1001",
        courseName: "Basketball",
        homeroomClassId: 1,
        homeroomClass: "Class One",
        note: "Basketball",
        status: "absent",
      },
      {
        id: "student-2",
        studentId: "2",
        name: "Bob",
        courseId: "101",
        courseSessionId: "1001",
        courseName: "Basketball",
        homeroomClassId: 1,
        homeroomClass: "Class One",
        note: "Basketball",
        status: "leave",
      },
    ],
  },
  {
    id: "class:2",
    label: "Class Two",
    meta: "",
    students: [
      {
        id: "student-3",
        studentId: "3",
        name: "Carol",
        courseId: "202",
        courseSessionId: "2002",
        courseName: "Painting",
        homeroomClassId: 2,
        homeroomClass: "Class Two",
        note: "Painting",
        status: "absent",
      },
    ],
  },
];

describe("admin unarrived collapse helpers", () => {
  it("keeps attendance management copy actions shared and short", () => {
    expect(ADMIN_ATTENDANCE_COPY_LABELS).toEqual({
      courses: "复制课程信息",
      details: "复制点名明细",
    });
    expect(ADMIN_ATTENDANCE_COPY_FEEDBACK_LABELS).toEqual({
      courses: "课程信息",
      details: "点名明细",
    });
  });

  it("formats future session timing as time remaining before class starts", () => {
    expect(
      buildAdminAttendanceSessionTimingLabel(
        "2026-04-22T15:35:00+08:00",
        new Date("2026-04-22T15:20:00+08:00"),
      ),
    ).toBe("15 min后行课");
  });

  it("formats elapsed time once class has started", () => {
    expect(
      buildAdminAttendanceSessionTimingLabel(
        "2026-04-22T15:35:00+08:00",
        new Date("2026-04-22T15:40:00+08:00"),
      ),
    ).toBe("已上课 5 min，请及时确认学生点名情况");
  });

  it("builds the subtitle from campus, date, and session timing", () => {
    expect(
      buildAdminAttendanceSubtitle(
        {
          campusLabel: "成都嘉祥外国语学校",
          dateLabel: "2026/4/22（周三）",
          referenceSessionStartAt: "2026-04-22T15:35:00+08:00",
        },
        new Date("2026-04-22T15:20:00+08:00"),
      ),
    ).toBe("成都嘉祥外国语学校 · 2026/4/22（周三） · 15 min后行课");
  });

  it("builds the teacher attendance subtitle with deadline before class starts", () => {
    expect(
      buildTeacherAttendanceSubtitle(
        {
          campusLabel: "成都嘉祥外国语学校",
          courseTitle: "3D打印",
          referenceSessionStartAt: "2026-04-22T15:40:00+08:00",
          sessionTimeLabel: "15:40-16:40",
          rollCallDeadlineAt: "2026-04-22T15:45:00+08:00",
        },
        new Date("2026-04-22T15:20:00+08:00"),
      ),
    ).toBe(
      "2026/4/22（周三） · 成都嘉祥外国语学校 · 3D打印 · 15:40-16:40 · 请于 15:45 前完成点名",
    );
  });

  it("builds the teacher attendance subtitle with an urgent reminder after class starts", () => {
    expect(
      buildTeacherAttendanceSubtitle(
        {
          campusLabel: "成都嘉祥外国语学校",
          courseTitle: "3D打印",
          referenceSessionStartAt: "2026-04-22T15:40:00+08:00",
          sessionTimeLabel: "15:40-16:40",
          rollCallDeadlineAt: "2026-04-22T15:45:00+08:00",
        },
        new Date("2026-04-22T15:46:00+08:00"),
      ),
    ).toBe(
      "2026/4/22（周三） · 成都嘉祥外国语学校 · 3D打印 · 15:40-16:40 · 已上课 6 min，请及时确认学生点名情况 · 请于 15:45 前完成点名",
    );
  });

  it("omits the deadline segment when the teacher deadline is unavailable", () => {
    expect(
      buildTeacherAttendanceSubtitle(
        {
          campusLabel: "成都嘉祥外国语学校",
          courseTitle: "3D打印",
          referenceSessionStartAt: "2026-04-22T15:40:00+08:00",
          sessionTimeLabel: "15:40-16:40",
        },
        new Date("2026-04-22T15:20:00+08:00"),
      ),
    ).toBe("2026/4/22（周三） · 成都嘉祥外国语学校 · 3D打印 · 15:40-16:40");
  });

  it("initializes every group as collapsed", () => {
    expect(buildUnarrivedCollapsedByGroupId(groups)).toEqual({
      "class:1": true,
      "class:2": true,
    });
  });

  it("toggles only the targeted group", () => {
    const initialState = buildUnarrivedCollapsedByGroupId(groups);

    expect(toggleUnarrivedGroupCollapsed(initialState, "class:1")).toEqual({
      "class:1": false,
      "class:2": true,
    });
  });

  it("filters groups by search query and keeps only matching students", () => {
    expect(filterUnarrivedGroups(groups, "alice")).toEqual([
      {
        ...groups[0],
        students: [groups[0].students[0]],
      },
    ]);
  });

  it("counts all students currently managed on the page", () => {
    expect(getManagedStudentCount(groups)).toBe(3);
  });

  it("counts only admin-adjusted leave/present students as resolved", () => {
    const resolvedGroups: AdminUnarrivedData["groups"] = [
      {
        id: "class:1",
        label: "Class One",
        meta: "",
        students: [
          {
            id: "student-1",
            studentId: "1",
            name: "Alice",
            courseId: "101",
            courseSessionId: "1001",
            courseName: "Basketball",
            homeroomClassId: 1,
            homeroomClass: "Class One",
            note: "Basketball",
            status: "present",
            managerUpdated: true,
          },
          {
            id: "student-2",
            studentId: "2",
            name: "Bob",
            courseId: "101",
            courseSessionId: "1001",
            courseName: "Basketball",
            homeroomClassId: 1,
            homeroomClass: "Class One",
            note: "Basketball",
            status: "leave",
            managerUpdated: true,
          },
          {
            id: "student-3",
            studentId: "3",
            name: "Carol",
            courseId: "101",
            courseSessionId: "1001",
            courseName: "Basketball",
            homeroomClassId: 1,
            homeroomClass: "Class One",
            note: "Basketball",
            status: "absent",
            managerUpdated: true,
          },
        ],
      },
    ];

    expect(getResolvedStudentCount(resolvedGroups)).toBe(2);
  });

  it("treats search results as expanded and restores manual collapse state after clearing", () => {
    const collapsedByGroupId = toggleUnarrivedGroupCollapsed(
      buildUnarrivedCollapsedByGroupId(groups),
      "class:1",
    );

    expect(isUnarrivedGroupCollapsed(collapsedByGroupId, "class:1", "alice")).toBe(false);
    expect(isUnarrivedGroupCollapsed(collapsedByGroupId, "class:1", "")).toBe(false);
    expect(isUnarrivedGroupCollapsed(collapsedByGroupId, "class:2", "")).toBe(true);
  });
});
