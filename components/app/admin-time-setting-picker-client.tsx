"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";

import { StaticLink } from "@/components/app/static-link";
import type { AdminTimePickerData } from "@/lib/domain/types";
import { appendQueryHref } from "@/lib/admin-route-hrefs";
import { navigateTo } from "@/lib/static-navigation";

type AdminTimeSettingPickerClientProps = {
  data: AdminTimePickerData;
};

const HOURS = Array.from({ length: 24 }, (_, index) => String(index).padStart(2, "0"));
const MINUTES = Array.from({ length: 12 }, (_, index) => String(index * 5).padStart(2, "0"));
const GESTURE_THRESHOLD = 18;

function parseTime(value: string) {
  const match = value.match(/^(\d{2}):(\d{2})$/);
  if (!match) {
    return null;
  }

  return { hour: match[1], minute: match[2] };
}

function toMinutes(value: string) {
  const parsed = parseTime(value);
  if (!parsed) {
    return null;
  }

  return Number(parsed.hour) * 60 + Number(parsed.minute);
}

function isTimeValue(value: string | null) {
  return value !== null && /^\d{2}:\d{2}$/.test(value);
}

function buildRangeLabel(startTime: string, endTime: string) {
  return `${startTime} - ${endTime}`;
}

function getValueIndex(value: string, values: string[]) {
  const index = values.indexOf(value);
  return index >= 0 ? index : 0;
}

function shiftValue(value: string, values: string[], step: number) {
  const length = values.length;
  const currentIndex = getValueIndex(value, values);
  const nextIndex = ((currentIndex + step) % length + length) % length;
  return values[nextIndex];
}

function buildVisibleValues(value: string, values: string[]) {
  return [
    shiftValue(value, values, -1),
    value,
    shiftValue(value, values, 1),
  ];
}

function composeTime(hour: string, minute: string) {
  return `${hour}:${minute}`;
}

function splitTime(value: string) {
  const parsed = parseTime(value);
  return {
    hour: parsed?.hour ?? "00",
    minute: parsed?.minute ?? "00",
  };
}

type PickerColumnProps = {
  activeValue: string;
  values: string[];
  testId: string;
  disabled?: boolean;
  onChange: (value: string) => void;
};

function PickerColumn({ activeValue, values, testId, disabled = false, onChange }: PickerColumnProps) {
  const columnRef = useRef<HTMLDivElement | null>(null);
  const touchStartRef = useRef<number | null>(null);
  const touchDeltaRef = useRef(0);
  const wheelLockRef = useRef(false);
  const displayValues = useMemo(
    () => buildVisibleValues(activeValue, values),
    [activeValue, values],
  );

  function shift(step: number) {
    if (disabled) {
      return;
    }
    onChange(shiftValue(activeValue, values, step));
  }

  useEffect(() => {
    const node = columnRef.current;
    if (!node) {
      return;
    }

    function handleWheel(event: WheelEvent) {
      if (wheelLockRef.current) {
        event.preventDefault();
        return;
      }

      if (Math.abs(event.deltaY) < 4) {
        return;
      }

      event.preventDefault();
      if (disabled) {
        return;
      }
      wheelLockRef.current = true;
      shift(event.deltaY > 0 ? 1 : -1);

      window.setTimeout(() => {
        wheelLockRef.current = false;
      }, 120);
    }

    node.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      node.removeEventListener("wheel", handleWheel);
    };
  }, [disabled, shift]);

  function handleTouchStart(event: React.TouchEvent<HTMLDivElement>) {
    touchStartRef.current = event.touches[0]?.clientY ?? null;
    touchDeltaRef.current = 0;
  }

  function handleTouchMove(event: React.TouchEvent<HTMLDivElement>) {
    if (touchStartRef.current === null) {
      return;
    }

    touchDeltaRef.current = (event.touches[0]?.clientY ?? 0) - touchStartRef.current;
  }

  function handleTouchEnd() {
    if (touchStartRef.current === null) {
      return;
    }

    if (disabled) {
      touchStartRef.current = null;
      touchDeltaRef.current = 0;
      return;
    }

    if (Math.abs(touchDeltaRef.current) >= GESTURE_THRESHOLD) {
      shift(touchDeltaRef.current < 0 ? 1 : -1);
    }

    touchStartRef.current = null;
    touchDeltaRef.current = 0;
  }

  return (
    <div
      ref={columnRef}
      data-testid={testId}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="relative touch-pan-y select-none"
      aria-disabled={disabled}
      aria-label={testId}
    >
      <div className="space-y-1 text-center">
        <button
          type="button"
          data-testid={`${testId}-option-${displayValues[0]}`}
          disabled={disabled}
          onClick={() => shift(-1)}
          className="block w-14 text-sm font-medium text-[#B8B8B8] disabled:cursor-default disabled:opacity-70"
        >
          {displayValues[0]}
        </button>
        <button
          type="button"
          data-testid={`${testId}-option-${displayValues[1]}`}
          disabled={disabled}
          onClick={() => onChange(displayValues[1])}
          className="block w-14 text-2xl font-bold text-[var(--jp-text)] disabled:cursor-default disabled:opacity-85"
        >
          {displayValues[1]}
        </button>
        <button
          type="button"
          data-testid={`${testId}-option-${displayValues[2]}`}
          disabled={disabled}
          onClick={() => shift(1)}
          className="block w-14 text-sm font-medium text-[#B8B8B8] disabled:cursor-default disabled:opacity-70"
        >
          {displayValues[2]}
        </button>
      </div>
    </div>
  );
}

export function AdminTimeSettingPickerClient({
  data,
}: AdminTimeSettingPickerClientProps) {
  const searchParams = useSearchParams();
  const [activeField, setActiveField] = useState<"start" | "end">("start");
  const [feedback, setFeedback] = useState("");
  const draftStartTime = isTimeValue(searchParams.get("draftStartTime"))
    ? (searchParams.get("draftStartTime") as string)
    : data.startTime;
  const draftEndTime = isTimeValue(searchParams.get("draftEndTime"))
    ? (searchParams.get("draftEndTime") as string)
    : data.endTime;
  const sourceKey = `${draftStartTime}|${draftEndTime}`;

  type TimeRangeState = {
    sourceKey: string;
    startTime: string;
    endTime: string;
  };

  function buildTimeRangeState(): TimeRangeState {
    return {
      sourceKey,
      startTime: draftStartTime,
      endTime: draftEndTime,
    };
  }

  const [timeRange, setTimeRange] = useState<TimeRangeState>(() => buildTimeRangeState());
  const effectiveTimeRange = timeRange.sourceKey === sourceKey ? timeRange : buildTimeRangeState();
  const startTime = effectiveTimeRange.startTime;
  const endTime = effectiveTimeRange.endTime;

  const activeValue = activeField === "start" ? startTime : endTime;
  const activeParts = useMemo(() => splitTime(activeValue), [activeValue]);

  function updateActiveFieldTime(nextHour: string, nextMinute: string) {
    const nextValue = composeTime(nextHour, nextMinute);

    setTimeRange((currentTimeRange) => {
      const baseTimeRange =
        currentTimeRange.sourceKey === sourceKey ? currentTimeRange : buildTimeRangeState();

      if (activeField === "start") {
        return {
          ...baseTimeRange,
          sourceKey,
          startTime: nextValue,
        };
      }

      return {
        ...baseTimeRange,
        sourceKey,
        endTime: nextValue,
      };
    });
  }

  function handleConfirm() {
    setFeedback("");

    if (!data.editable) {
      setFeedback("历史日期仅支持查看，不能修改。");
      return;
    }

    const startMinutes = toMinutes(startTime);
    const endMinutes = toMinutes(endTime);

    if (startMinutes === null || endMinutes === null) {
      setFeedback("请先选择完整的时间范围。");
      return;
    }

    if (endMinutes <= startMinutes) {
      setFeedback("结束时间需要晚于开始时间。");
      return;
    }

    navigateTo(
      appendQueryHref(data.backHref, {
        draftStartTime: startTime,
        draftEndTime: endTime,
      }),
      { replace: true },
    );
  }

  return (
    <div className="space-y-3.5">
      <section className="rounded-[16px] border border-[#E8E5E0] bg-white p-4 shadow-[0_10px_22px_rgba(28,28,28,0.04)]">
        <h1 className="text-base font-semibold text-[var(--jp-text)]">{data.introTitle}</h1>
        <p className="mt-2 text-xs font-medium text-[var(--jp-text-secondary)]">
          {data.introSubtitle}
        </p>
        {!data.editable ? (
          <p className="mt-2 text-xs font-medium text-[var(--jp-text-secondary)]">
            历史日期仅支持查看，不能修改。
          </p>
        ) : null}
        <p className="mt-2 text-xs font-semibold text-[#C46A1A]">
          当前时间范围 {buildRangeLabel(startTime, endTime)}
        </p>
      </section>

      <section className="rounded-[16px] border border-[#E8E5E0] bg-white p-4 shadow-[0_10px_22px_rgba(28,28,28,0.04)]">
        <h2 className="text-base font-bold text-[var(--jp-text)]">设置时间范围</h2>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <button
            type="button"
            className={
              activeField === "start"
                ? "flex h-9 items-center justify-center rounded-[10px] bg-[#1E3A5F] text-xs font-semibold text-white"
                : "flex h-9 items-center justify-center rounded-[10px] border border-[#E8E5E0] bg-white text-xs font-semibold text-[var(--jp-text-secondary)]"
            }
            disabled={!data.editable}
            onClick={() => setActiveField("start")}
          >
            开始时间
          </button>
          <button
            type="button"
            className={
              activeField === "end"
                ? "flex h-9 items-center justify-center rounded-[10px] bg-[#1E3A5F] text-xs font-semibold text-white"
                : "flex h-9 items-center justify-center rounded-[10px] border border-[#E8E5E0] bg-white text-xs font-semibold text-[var(--jp-text-secondary)]"
            }
            disabled={!data.editable}
            onClick={() => setActiveField("end")}
          >
            结束时间
          </button>
        </div>

        <div className="mt-4 flex items-center justify-center gap-6 rounded-[14px] border border-[#E8E5E0] bg-[#F5F3F0] px-4 py-4">
          <PickerColumn
            testId={`${activeField}-hour-wheel`}
            activeValue={activeParts.hour}
            values={HOURS}
            disabled={!data.editable}
            onChange={(hour) => updateActiveFieldTime(hour, activeParts.minute)}
          />
          <span className="text-xl font-bold text-[var(--jp-text)]">:</span>
          <PickerColumn
            testId={`${activeField}-minute-wheel`}
            activeValue={activeParts.minute}
            values={MINUTES}
            disabled={!data.editable}
            onChange={(minute) => updateActiveFieldTime(activeParts.hour, minute)}
          />
        </div>

        <div className="mt-4 flex items-center justify-between rounded-[12px] border border-[#E8E5E0] bg-white px-3 py-3">
          <span className="text-xs font-medium text-[var(--jp-text-secondary)]">当前范围</span>
          <span className="text-base font-bold text-[var(--jp-text)]">
            {buildRangeLabel(startTime, endTime)}
          </span>
        </div>

        {feedback ? (
          <p className="mt-3 text-[12px] font-medium text-[#D32F2F]">{feedback}</p>
        ) : null}

        <div className="mt-4 grid grid-cols-2 gap-3">
          <StaticLink
            href={data.backHref}
            className="flex h-10 items-center justify-center rounded-[10px] border border-[#E8E5E0] bg-white text-xs font-semibold text-[var(--jp-text-secondary)]"
          >
            {data.cancelLabel}
          </StaticLink>
          <button
            type="button"
            disabled={!data.editable}
            onClick={handleConfirm}
            className="flex h-10 items-center justify-center rounded-[10px] bg-[#1E3A5F] text-xs font-semibold text-white disabled:opacity-50"
          >
            {data.confirmLabel}
          </button>
        </div>
      </section>
    </div>
  );
}
