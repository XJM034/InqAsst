import type {
  AttendanceStatus,
  AttendanceStudent,
  TimeWindowState,
} from "@/lib/domain/types";

export function cycleAttendanceStatus(
  current: AttendanceStatus,
): AttendanceStatus {
  if (current === "present") {
    return "absent";
  }

  if (current === "absent") {
    return "leave";
  }

  return "present";
}

export function getAttendanceSummary(students: AttendanceStudent[]) {
  return students.reduce(
    (summary, student) => {
      if (student.status === "present") {
        summary.present += 1;
      } else if (student.status === "leave") {
        summary.leave += 1;
      } else {
        summary.absent += 1;
      }

      if (student.managerUpdated) {
        summary.managerUpdated += 1;
      }

      return summary;
    },
    {
      expected: students.length,
      present: 0,
      leave: 0,
      absent: 0,
      managerUpdated: 0,
    },
  );
}

export function getBannerToneByWindowState(state: TimeWindowState) {
  if (state === "late") {
    return "warning" as const;
  }

  return "info" as const;
}
