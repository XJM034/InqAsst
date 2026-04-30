import {
  buildExternalTeacherSuccessMessage,
  findInternalTeacherPhoneMatch,
  getActiveInternalTeacherPhoneMatch,
  isInternalTeacherPhoneLookupPending,
  normalizeExternalTeacherPhone,
  validateExternalTeacherDraft,
} from "@/components/app/external-teacher-client";

describe("external teacher form helpers", () => {
  it("rejects missing and malformed values with field-level guidance", () => {
    expect(
      validateExternalTeacherDraft({
        name: "",
        phone: "",
      }).errors,
    ).toEqual({
      name: "请输入系统外老师姓名",
      phone: "请输入系统外老师手机号",
    });

    expect(
      validateExternalTeacherDraft({
        name: "王1",
        phone: "12345",
      }).errors,
    ).toEqual({
      name: "请输入老师真实姓名，至少 2 个字，可使用中文、英文和中间点",
      phone: "请输入正确的 11 位手机号",
    });
  });

  it("normalizes name and phone before submit", () => {
    expect(
      validateExternalTeacherDraft({
        name: "  阿布都热依木 · 买买提  ",
        phone: "138-0013-8000",
      }),
    ).toEqual({
      normalizedName: "阿布都热依木 · 买买提",
      normalizedPhone: "13800138000",
      errors: {},
    });

    expect(normalizeExternalTeacherPhone(" 138 0013 8000 ")).toBe("13800138000");
  });

  it("builds the saved-and-selected success copy", () => {
    expect(
      buildExternalTeacherSuccessMessage({
        name: "张老师",
        phone: "13800138000",
      }),
    ).toBe("已保存并选择新建系统外老师：张老师 · 13800138000");
  });

  it("finds an internal teacher by exact phone match", () => {
    expect(
      findInternalTeacherPhoneMatch(
        [
          {
            teacherId: 11,
            teacherName: "王老师",
            phone: "13800138000",
          },
          {
            teacherId: 12,
            teacherName: "系统外老师",
            phone: "13900001111",
            externalTeacher: true,
          },
        ],
        "138 0013 8000",
      ),
    ).toEqual({
      teacherId: 11,
      teacherName: "王老师",
      phone: "13800138000",
    });
  });

  it("only trusts an internal teacher phone match for the current phone", () => {
    const match = {
      teacherId: 11,
      teacherName: "王老师",
      phone: "13800138000",
    };

    expect(
      getActiveInternalTeacherPhoneMatch(
        {
          phone: "13800138000",
          status: "resolved",
          match,
        },
        "138 0013 8000",
      ),
    ).toEqual(match);

    expect(
      getActiveInternalTeacherPhoneMatch(
        {
          phone: "13800138000",
          status: "resolved",
          match,
        },
        "13900139000",
      ),
    ).toBeNull();

    expect(
      getActiveInternalTeacherPhoneMatch(
        {
          phone: "13800138000",
          status: "pending",
          match,
        },
        "13800138000",
      ),
    ).toBeNull();
  });

  it("treats valid unresolved internal teacher phone lookups as pending", () => {
    expect(
      isInternalTeacherPhoneLookupPending(
        {
          phone: "13800138000",
          status: "resolved",
          match: null,
        },
        "13800138000",
      ),
    ).toBe(false);

    expect(
      isInternalTeacherPhoneLookupPending(
        {
          phone: "13800138000",
          status: "pending",
          match: null,
        },
        "13800138000",
      ),
    ).toBe(true);

    expect(
      isInternalTeacherPhoneLookupPending(
        {
          phone: "13800138000",
          status: "resolved",
          match: null,
        },
        "13900139000",
      ),
    ).toBe(true);

    expect(
      isInternalTeacherPhoneLookupPending(
        {
          phone: "",
          status: "idle",
          match: null,
        },
        "12345",
      ),
    ).toBe(false);
  });
});
