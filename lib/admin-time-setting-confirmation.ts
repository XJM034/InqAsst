type AdminTimeSettingKind = "actual" | "roll-call";

const COPY = {
  actual: {
    title: "确认保存并生效上课时间",
    description: "将上课时间从「{currentRange}」修改为「{nextRange}」后会立即生效，请确认是否继续。",
  },
  "roll-call": {
    title: "确认保存并生效点名时间",
    description: "将点名时间从「{currentRange}」修改为「{nextRange}」后会立即生效，请确认是否继续。",
  },
  current: "当前：{currentRange}",
  next: "生效后：{nextRange}",
  cancel: "取消",
  confirm: "确认生效",
  pending: "生效中...",
} as const;

function formatCopy(template: string, values: Record<string, string>) {
  return template.replace(/\{(\w+)\}/g, (_, key) => values[key] ?? "");
}

export function buildAdminTimeSettingSaveConfirmCopy(payload: {
  kind: AdminTimeSettingKind;
  currentRange: string;
  nextRange: string;
}) {
  const values = {
    currentRange: payload.currentRange,
    nextRange: payload.nextRange,
  };

  return {
    title: COPY[payload.kind].title,
    description: formatCopy(COPY[payload.kind].description, values),
    current: formatCopy(COPY.current, values),
    next: formatCopy(COPY.next, values),
    cancelLabel: COPY.cancel,
    confirmLabel: COPY.confirm,
    pendingLabel: COPY.pending,
  };
}
