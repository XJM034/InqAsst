const ROLL_CALL_TEACHER_CONFLICT_PATTERN =
  /^teacher schedule conflict:\s*(.+?)\s+(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2}-\d{2}:\d{2})$/i;

export function normalizeRollCallTeacherConflictMessage(message?: string | null) {
  const normalizedMessage = message?.trim();
  if (!normalizedMessage) {
    return null;
  }

  const matched = normalizedMessage.match(ROLL_CALL_TEACHER_CONFLICT_PATTERN);
  if (!matched) {
    return null;
  }

  const [, teacherName, date, timeRange] = matched;
  return `老师「${teacherName}」在 ${date} ${timeRange} 已有排课，暂时不能设为当前点名老师`;
}

export function isRollCallTeacherConflictMessage(message?: string | null) {
  if (normalizeRollCallTeacherConflictMessage(message)) {
    return true;
  }

  return message?.includes("暂时不能设为当前点名老师") ?? false;
}
