import type {
  AdminRollCallTeacherBatchConflict,
  AdminRollCallTeacherBatchConflictSource,
} from "@/lib/domain/types";
import type { RollCallTeacherBatchConflictDto } from "@/lib/services/mobile-schema";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function normalizeConflictSource(
  source: RollCallTeacherBatchConflictDto["conflictSource"],
): AdminRollCallTeacherBatchConflictSource {
  return source === "GROUP" || source === "group" || source === "组内"
    ? "group"
    : "outside-group";
}

function buildConflictMessage(conflict: {
  teacherName: string;
  conflictDate: string;
  conflictTimeRange: string;
  conflictSource: AdminRollCallTeacherBatchConflictSource;
}) {
  const sourceLabel = conflict.conflictSource === "group" ? "组内互换" : "组外课程";
  return `老师「${conflict.teacherName}」在 ${conflict.conflictDate} ${conflict.conflictTimeRange} 与${sourceLabel}冲突`;
}

function parseConflictItem(value: unknown): AdminRollCallTeacherBatchConflict | null {
  if (!isRecord(value)) {
    return null;
  }

  const {
    courseSessionId,
    teacherId,
    teacherName,
    conflictDate,
    conflictTimeRange,
    conflictSource,
  } = value;

  if (
    typeof courseSessionId !== "number" ||
    typeof teacherId !== "number" ||
    typeof teacherName !== "string" ||
    typeof conflictDate !== "string" ||
    typeof conflictTimeRange !== "string" ||
    typeof conflictSource !== "string"
  ) {
    return null;
  }

  const normalizedSource = normalizeConflictSource(
    conflictSource as RollCallTeacherBatchConflictDto["conflictSource"],
  );
  return {
    courseSessionId: String(courseSessionId),
    teacherId: String(teacherId),
    teacherName,
    conflictDate,
    conflictTimeRange,
    conflictSource: normalizedSource,
    message: buildConflictMessage({
      teacherName,
      conflictDate,
      conflictTimeRange,
      conflictSource: normalizedSource,
    }),
  };
}

function readConflictArray(payload: unknown): unknown[] {
  if (!isRecord(payload)) {
    return [];
  }

  const directConflicts = payload.conflicts;
  if (Array.isArray(directConflicts)) {
    return directConflicts;
  }

  const nestedData = payload.data;
  if (isRecord(nestedData) && Array.isArray(nestedData.conflicts)) {
    return nestedData.conflicts;
  }

  return [];
}

export function extractRollCallTeacherBatchConflicts(payload: unknown) {
  return readConflictArray(payload)
    .map((item) => parseConflictItem(item))
    .filter((item): item is AdminRollCallTeacherBatchConflict => Boolean(item));
}

export function summarizeRollCallTeacherBatchConflicts(
  conflicts: AdminRollCallTeacherBatchConflict[],
) {
  if (conflicts.length === 0) {
    return "老师排课冲突，请调整后重试";
  }

  if (conflicts.length === 1) {
    return conflicts[0].message;
  }

  return `共有 ${conflicts.length} 条老师排课冲突，请逐项调整后再提交`;
}

export class RollCallTeacherBatchConflictError extends Error {
  conflicts: AdminRollCallTeacherBatchConflict[];

  constructor(message: string, conflicts: AdminRollCallTeacherBatchConflict[]) {
    super(message);
    this.name = "RollCallTeacherBatchConflictError";
    this.conflicts = conflicts;
  }
}
