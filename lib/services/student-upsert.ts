import type { StudentUpsertRequestDto } from "@/lib/services/mobile-schema";

type StudentUpsertInput = {
  externalStudentId?: string | null;
  name: string;
  homeroomClassId: number | null;
};

type StudentUpsertResult =
  | { body: StudentUpsertRequestDto; error: null }
  | { body: null; error: string };

export function buildStudentUpsertRequest(
  input: StudentUpsertInput,
): StudentUpsertResult {
  const name = input.name.trim();
  if (!name) {
    return {
      body: null,
      error: "请输入学生姓名",
    };
  }

  if (input.homeroomClassId == null) {
    return {
      body: null,
      error: "请选择行政班",
    };
  }

  return {
    body: {
      ...(input.externalStudentId?.trim()
        ? { externalStudentId: input.externalStudentId.trim() }
        : {}),
      name,
      homeroomClassId: input.homeroomClassId,
    },
    error: null,
  };
}
