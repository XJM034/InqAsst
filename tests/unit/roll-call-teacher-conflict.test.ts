import {
  isRollCallTeacherConflictMessage,
  normalizeRollCallTeacherConflictMessage,
} from "@/lib/roll-call-teacher-conflict";

describe("roll-call teacher conflict helpers", () => {
  it("translates backend teacher conflict messages into actionable Chinese copy", () => {
    expect(
      normalizeRollCallTeacherConflictMessage(
        "teacher schedule conflict: 何伟 2026-04-22 16:45-17:45",
      ),
    ).toBe("老师「何伟」在 2026-04-22 16:45-17:45 已有排课，暂时不能设为当前点名老师");
  });

  it("returns null for non-conflict messages", () => {
    expect(normalizeRollCallTeacherConflictMessage("forbidden")).toBeNull();
    expect(isRollCallTeacherConflictMessage("forbidden")).toBe(false);
    expect(
      isRollCallTeacherConflictMessage(
        "teacher schedule conflict: 魏雅婷 2026-04-22 16:45-17:45",
      ),
    ).toBe(true);
    expect(
      isRollCallTeacherConflictMessage(
        "老师「魏雅婷」在 2026-04-22 16:45-17:45 已有排课，暂时不能设为当前点名老师",
      ),
    ).toBe(true);
  });
});
