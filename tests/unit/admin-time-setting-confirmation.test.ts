import { buildAdminTimeSettingSaveConfirmCopy } from "@/lib/admin-time-setting-confirmation";

describe("admin time setting save confirmation copy", () => {
  it("builds actual-time confirmation copy", () => {
    expect(
      buildAdminTimeSettingSaveConfirmCopy({
        kind: "actual",
        currentRange: "17:30-18:30",
        nextRange: "17:25-18:35",
      }),
    ).toEqual({
      title: "确认保存并生效上课时间",
      description: "将上课时间从「17:30-18:30」修改为「17:25-18:35」后会立即生效，请确认是否继续。",
      current: "当前：17:30-18:30",
      next: "生效后：17:25-18:35",
      cancelLabel: "取消",
      confirmLabel: "确认生效",
      pendingLabel: "生效中...",
    });
  });

  it("builds roll-call confirmation copy", () => {
    expect(
      buildAdminTimeSettingSaveConfirmCopy({
        kind: "roll-call",
        currentRange: "17:20-17:40",
        nextRange: "17:25-17:35",
      }),
    ).toEqual({
      title: "确认保存并生效点名时间",
      description: "将点名时间从「17:20-17:40」修改为「17:25-17:35」后会立即生效，请确认是否继续。",
      current: "当前：17:20-17:40",
      next: "生效后：17:25-17:35",
      cancelLabel: "取消",
      confirmLabel: "确认生效",
      pendingLabel: "生效中...",
    });
  });
});
