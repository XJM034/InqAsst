import { buildRestoreDefaultTeacherDialogCopy } from "@/components/app/teacher-setting-course-client";

describe("teacher setting course dialog copy", () => {
  it("builds restore-default-teacher confirmation copy", () => {
    expect(
      buildRestoreDefaultTeacherDialogCopy({
        courseTitle: "周三篮球课",
        currentTeacherLabel: "张老师 · 13800138000",
        defaultTeacherLabel: "李老师 · 13900139000",
      }),
    ).toEqual({
      description:
        "将 周三篮球课 的点名老师从「张老师 · 13800138000」恢复为默认老师「李老师 · 13900139000」后，后续点名会按默认老师身份继续进行。",
      current: "当前：张老师 · 13800138000",
      next: "恢复后：李老师 · 13900139000",
    });
  });
});
