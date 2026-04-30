import { buildStudentUpsertRequest } from "@/lib/services/student-upsert";

describe("student upsert validation", () => {
  it("requires the student name", () => {
    expect(
      buildStudentUpsertRequest({
        name: "   ",
        homeroomClassId: 10,
      }),
    ).toEqual({
      body: null,
      error: "请输入学生姓名",
    });
  });

  it("does not require the external student id", () => {
    expect(
      buildStudentUpsertRequest({
        name: "王一诺",
        homeroomClassId: 10,
      }),
    ).toEqual({
      body: {
        name: "王一诺",
        homeroomClassId: 10,
      },
      error: null,
    });
  });

  it("requires the homeroom class selection", () => {
    expect(
      buildStudentUpsertRequest({
        name: "王一诺",
        homeroomClassId: null,
      }),
    ).toEqual({
      body: null,
      error: "请选择行政班",
    });
  });

  it("returns the normalized request body when all required fields are present", () => {
    expect(
      buildStudentUpsertRequest({
        name: " 王一诺 ",
        externalStudentId: " STU-001 ",
        homeroomClassId: 10,
      }),
    ).toEqual({
      body: {
        name: "王一诺",
        externalStudentId: "STU-001",
        homeroomClassId: 10,
      },
      error: null,
    });
  });

  it("omits the external student id when it is blank", () => {
    expect(
      buildStudentUpsertRequest({
        name: " 王一诺 ",
        externalStudentId: "   ",
        homeroomClassId: 10,
      }),
    ).toEqual({
      body: {
        name: "王一诺",
        homeroomClassId: 10,
      },
      error: null,
    });
  });
});
