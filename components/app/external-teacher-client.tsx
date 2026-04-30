"use client";

import { useEffect, useRef, useState } from "react";

import {
  appendQueryHref,
  buildAdminEmergencyCourseHref,
  buildAdminSelectTeacherHref,
} from "@/lib/admin-route-hrefs";
import { buildAdminTabItems, withCampusQuery } from "@/lib/admin-campus";
import { AdminSubpageHeader } from "@/components/app/admin-subpage-header";
import { MobileTabBar } from "@/components/app/mobile-tab-bar";
import { PageShell } from "@/components/app/page-shell";
import { StaticLink } from "@/components/app/static-link";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { RollCallTeacherOptionDto } from "@/lib/services/mobile-schema";
import {
  createExternalTeacher,
  fetchRollCallTeacherOptionsClient,
} from "@/lib/services/mobile-client";
import { navigateTo } from "@/lib/static-navigation";

type Props = {
  campus: string;
  courseId: string;
  courseSessionId: string;
  courseTitle: string;
  courseMeta: string;
  currentTeacherLabel: string;
  returnHref?: string;
  prefillName?: string;
  prefillPhone?: string;
};

type ExternalTeacherFieldErrors = {
  name?: string;
  phone?: string;
};

type InternalTeacherPhoneMatch = {
  teacherId: number;
  teacherName: string;
  phone: string;
};

type InternalTeacherPhoneMatchState = {
  phone: string;
  status: "idle" | "pending" | "resolved";
  match: InternalTeacherPhoneMatch | null;
};

const COPY = {
  title: "录入系统外老师",
  name: "老师姓名",
  phone: "手机号",
  namePlaceholder: "请输入代课老师姓名",
  phonePlaceholder: "请输入手机号",
  requiredName: "请输入系统外老师姓名",
  invalidName: "请输入老师真实姓名，至少 2 个字，可使用中文、英文和中间点",
  requiredPhone: "请输入系统外老师手机号",
  invalidPhone: "请输入正确的 11 位手机号",
  submitError: "保存失败，请稍后重试",
  submitIdle: "保存并选择",
  submitPending: "保存并选择中...",
  dialogTitle: "确认保存并选择",
  dialogDescription:
    "保存后会新建系统外老师「{nextTeacher}」，并将 {courseTitle} 的点名老师从「{currentTeacher}」更换为该老师。",
  dialogCurrent: "当前：{currentTeacher}",
  dialogNext: "保存并选择后：{nextTeacher}",
  cancel: "取消",
  confirm: "保存并选择",
  success: "已保存并选择新建系统外老师：{nextTeacher}",
  internalTeacherMatchTitle: "该账号为 {teacherName} 老师账号，是否选择为点名老师？",
  internalTeacherMatchDescription:
    "该手机号已在系统内登记。若要用于当前课节，请返回上一页直接选择该老师，不需要再录入系统外老师。",
  internalTeacherMatchAction: "去选择该老师",
  internalTeacherMatchBlocked: "该手机号老师已在系统内，请改用系统内老师",
  internalTeacherMatchChecking: "正在检查手机号是否为系统内老师，请稍候...",
} as const;

function formatCopy(template: string, values: Record<string, string>) {
  return template.replace(/\{(\w+)\}/g, (_, key) => values[key] ?? "");
}

export function normalizeExternalTeacherName(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

export function normalizeExternalTeacherPhone(value: string) {
  return value.replace(/\D/g, "").slice(0, 11);
}

export function validateExternalTeacherDraft(draft: { name: string; phone: string }) {
  const normalizedName = normalizeExternalTeacherName(draft.name);
  const normalizedPhone = normalizeExternalTeacherPhone(draft.phone);
  const errors: ExternalTeacherFieldErrors = {};

  if (!normalizedName) {
    errors.name = COPY.requiredName;
  } else if (
    normalizedName.length < 2 ||
    normalizedName.length > 50 ||
    !/^[A-Za-z\u3400-\u9FFF·•・\s]+$/u.test(normalizedName)
  ) {
    errors.name = COPY.invalidName;
  }

  if (!normalizedPhone) {
    errors.phone = COPY.requiredPhone;
  } else if (!/^1\d{10}$/.test(normalizedPhone)) {
    errors.phone = COPY.invalidPhone;
  }

  return {
    normalizedName,
    normalizedPhone,
    errors,
  };
}

export function buildExternalTeacherSuccessMessage(payload: { name: string; phone: string }) {
  return formatCopy(COPY.success, {
    nextTeacher: `${payload.name} · ${payload.phone}`,
  });
}

export function findInternalTeacherPhoneMatch(
  teachers: RollCallTeacherOptionDto[],
  phone: string,
): InternalTeacherPhoneMatch | null {
  const normalizedPhone = normalizeExternalTeacherPhone(phone);
  if (!normalizedPhone) {
    return null;
  }

  const matchedTeacher = teachers.find((teacher) => {
    if (teacher.externalTeacher) {
      return false;
    }

    return normalizeExternalTeacherPhone(teacher.phone ?? "") === normalizedPhone;
  });

  if (!matchedTeacher?.teacherName) {
    return null;
  }

  return {
    teacherId: matchedTeacher.teacherId,
    teacherName: matchedTeacher.teacherName,
    phone: normalizeExternalTeacherPhone(matchedTeacher.phone ?? normalizedPhone),
  };
}

export function getActiveInternalTeacherPhoneMatch(
  state: InternalTeacherPhoneMatchState,
  phone: string,
) {
  const normalizedPhone = normalizeExternalTeacherPhone(phone);

  if (state.status !== "resolved" || state.phone !== normalizedPhone) {
    return null;
  }

  return state.match;
}

export function isInternalTeacherPhoneLookupPending(
  state: InternalTeacherPhoneMatchState,
  phone: string,
) {
  const normalizedPhone = normalizeExternalTeacherPhone(phone);

  return /^1\d{10}$/.test(normalizedPhone) && (
    state.phone !== normalizedPhone || state.status !== "resolved"
  );
}

export function ExternalTeacherFormClient({
  campus,
  courseId,
  courseSessionId,
  courseTitle,
  courseMeta,
  currentTeacherLabel,
  returnHref,
  prefillName,
  prefillPhone,
}: Props) {
  const nameInputRef = useRef<HTMLInputElement>(null);
  const phoneInputRef = useRef<HTMLInputElement>(null);
  const phoneMatchRequestVersionRef = useRef(0);
  const [name, setName] = useState(prefillName ?? "");
  const [phone, setPhone] = useState(normalizeExternalTeacherPhone(prefillPhone ?? ""));
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<ExternalTeacherFieldErrors>({});
  const [submitError, setSubmitError] = useState("");
  const [phoneMatchState, setPhoneMatchState] = useState<InternalTeacherPhoneMatchState>({
    phone: normalizeExternalTeacherPhone(prefillPhone ?? ""),
    status: "idle",
    match: null,
  });
  const matchedInternalTeacher = getActiveInternalTeacherPhoneMatch(phoneMatchState, phone);
  const isCheckingInternalTeacherPhone = isInternalTeacherPhoneLookupPending(
    phoneMatchState,
    phone,
  );
  const resolvedReturnHref =
    returnHref ??
    buildAdminEmergencyCourseHref(courseId, {
      courseSessionId,
    });
  const selectMatchedTeacherHref = matchedInternalTeacher
    ? withCampusQuery(
        buildAdminSelectTeacherHref(courseId, {
          courseSessionId,
          returnHref,
          q: matchedInternalTeacher.phone,
        }),
        campus,
      )
    : null;

  useEffect(() => {
    setName(prefillName ?? "");
    setPhone(normalizeExternalTeacherPhone(prefillPhone ?? ""));
  }, [prefillName, prefillPhone]);

  useEffect(() => {
    const requestVersion = phoneMatchRequestVersionRef.current + 1;
    phoneMatchRequestVersionRef.current = requestVersion;
    const normalizedPhone = normalizeExternalTeacherPhone(phone);
    if (!/^1\d{10}$/.test(normalizedPhone)) {
      setPhoneMatchState({
        phone: normalizedPhone,
        status: "idle",
        match: null,
      });
      return;
    }

    setPhoneMatchState({
      phone: normalizedPhone,
      status: "pending",
      match: null,
    });

    const timeoutId = window.setTimeout(() => {
      fetchRollCallTeacherOptionsClient(courseSessionId, {
        teacherType: "INTERNAL",
        q: normalizedPhone,
        page: 0,
        size: 20,
      })
        .then((response) => {
          if (phoneMatchRequestVersionRef.current !== requestVersion) {
            return;
          }

          setPhoneMatchState({
            phone: normalizedPhone,
            status: "resolved",
            match: findInternalTeacherPhoneMatch(response.items, normalizedPhone),
          });
        })
        .catch(() => {
          if (phoneMatchRequestVersionRef.current !== requestVersion) {
            return;
          }

          setPhoneMatchState({
            phone: normalizedPhone,
            status: "resolved",
            match: null,
          });
        });
    }, 180);

    return () => window.clearTimeout(timeoutId);
  }, [courseSessionId, phone]);

  function focusFirstInvalidField(errors: ExternalTeacherFieldErrors) {
    if (errors.name) {
      nameInputRef.current?.focus();
      return;
    }

    if (errors.phone) {
      phoneInputRef.current?.focus();
    }
  }

  function handleNameChange(value: string) {
    setName(value);
    setSubmitError("");
    setFieldErrors((current) => ({ ...current, name: undefined }));
  }

  function handlePhoneChange(value: string) {
    setPhone(normalizeExternalTeacherPhone(value));
    setSubmitError("");
    setFieldErrors((current) => ({ ...current, phone: undefined }));
  }

  function handleSubmit() {
    const validationResult = validateExternalTeacherDraft({ name, phone });
    if (validationResult.errors.name || validationResult.errors.phone) {
      setFieldErrors(validationResult.errors);
      setSubmitError("");
      focusFirstInvalidField(validationResult.errors);
      return;
    }

    if (isCheckingInternalTeacherPhone) {
      setFieldErrors({});
      setSubmitError(COPY.internalTeacherMatchChecking);
      phoneInputRef.current?.focus();
      return;
    }

    if (matchedInternalTeacher) {
      setFieldErrors({});
      setSubmitError(COPY.internalTeacherMatchBlocked);
      phoneInputRef.current?.focus();
      return;
    }

    setFieldErrors({});
    setSubmitError("");
    setConfirmOpen(true);
  }

  async function handleConfirm() {
    const validationResult = validateExternalTeacherDraft({ name, phone });
    if (validationResult.errors.name || validationResult.errors.phone) {
      setConfirmOpen(false);
      setFieldErrors(validationResult.errors);
      focusFirstInvalidField(validationResult.errors);
      return;
    }

    if (isCheckingInternalTeacherPhone) {
      setConfirmOpen(false);
      setFieldErrors({});
      setSubmitError(COPY.internalTeacherMatchChecking);
      phoneInputRef.current?.focus();
      return;
    }

    if (matchedInternalTeacher) {
      setConfirmOpen(false);
      setFieldErrors({});
      setSubmitError(COPY.internalTeacherMatchBlocked);
      phoneInputRef.current?.focus();
      return;
    }

    const normalizedName = validationResult.normalizedName;
    const normalizedPhone = validationResult.normalizedPhone;

    setIsSubmitting(true);
    setSubmitError("");

    try {
      await createExternalTeacher(courseSessionId, {
        name: normalizedName,
        phone: normalizedPhone,
      });
      setConfirmOpen(false);
      navigateTo(
        withCampusQuery(
          appendQueryHref(resolvedReturnHref, {
            notice: buildExternalTeacherSuccessMessage({
              name: normalizedName,
              phone: normalizedPhone,
            }),
          }),
          campus,
        ),
        { replace: true },
      );
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : COPY.submitError);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <PageShell>
      <div className="app-screen">
        <div className="app-scroll pb-4">
          <AdminSubpageHeader
            title={COPY.title}
            backHref={withCampusQuery(
              buildAdminSelectTeacherHref(courseId, {
                courseSessionId,
                returnHref,
              }),
              campus,
            )}
          />

          <div className="space-y-3.5 px-5 pt-3">
            <section className="rounded-[16px] border border-[#E8E5E0] bg-white p-3.5 shadow-[0_10px_22px_rgba(28,28,28,0.04)]">
              <h1 className="text-base font-bold text-[var(--jp-text)]">{courseTitle}</h1>
              <p className="mt-2 text-xs text-[var(--jp-text-secondary)]">{courseMeta}</p>
            </section>

            <section className="rounded-[16px] border border-[#E8E5E0] bg-white p-3.5 shadow-[0_10px_22px_rgba(28,28,28,0.04)]">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[var(--jp-text-secondary)]">
                    {COPY.name}
                  </label>
                  <Input
                    ref={nameInputRef}
                    placeholder={COPY.namePlaceholder}
                    value={name}
                    onChange={(event) => handleNameChange(event.target.value)}
                    aria-invalid={Boolean(fieldErrors.name)}
                    className="h-11 rounded-[12px] border-[#E8E5E0] bg-white shadow-none"
                  />
                  {fieldErrors.name ? (
                    <p className="text-[12px] font-medium text-[#D32F2F]">{fieldErrors.name}</p>
                  ) : (
                    <p className="text-[12px] text-[var(--jp-text-muted)]">
                      请填写老师真实姓名，保存后会立即用于当前课节。
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-[var(--jp-text-secondary)]">
                    {COPY.phone}
                  </label>
                  <Input
                    ref={phoneInputRef}
                    placeholder={COPY.phonePlaceholder}
                    value={phone}
                    onChange={(event) => handlePhoneChange(event.target.value)}
                    inputMode="numeric"
                    autoComplete="tel"
                    aria-invalid={Boolean(fieldErrors.phone)}
                    className="h-11 rounded-[12px] border-[#E8E5E0] bg-white shadow-none"
                  />
                  {fieldErrors.phone ? (
                    <p className="text-[12px] font-medium text-[#D32F2F]">{fieldErrors.phone}</p>
                  ) : (
                    <p className="text-[12px] text-[var(--jp-text-muted)]">
                      请输入 11 位手机号，保存后会立即绑定为当前点名老师。
                    </p>
                  )}
                </div>
              </div>
            </section>

            {matchedInternalTeacher && selectMatchedTeacherHref ? (
              <section className="rounded-[14px] border border-[#F2DEC2] bg-[#FFF7EA] px-4 py-3 shadow-[0_8px_18px_rgba(196,106,26,0.08)]">
                <p className="text-[12px] font-semibold text-[#A55B14]">
                  {formatCopy(COPY.internalTeacherMatchTitle, {
                    teacherName: matchedInternalTeacher.teacherName,
                  })}
                </p>
                <p className="mt-1 text-[12px] leading-5 text-[#7A5A2A]">
                  {COPY.internalTeacherMatchDescription}
                </p>
                <StaticLink
                  href={selectMatchedTeacherHref}
                  className="mt-3 inline-flex h-9 items-center justify-center rounded-[10px] border border-[#F2DEC2] bg-white px-3 text-[12px] font-semibold text-[#A55B14]"
                >
                  {COPY.internalTeacherMatchAction}
                </StaticLink>
              </section>
            ) : null}

            {submitError ? (
              <p className="px-0.5 text-[13px] font-medium text-[#D32F2F]">{submitError}</p>
            ) : null}

            <Button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting || isCheckingInternalTeacherPhone}
              className="h-11 w-full rounded-[12px] bg-[#1E3A5F] text-white hover:bg-[#1E3A5F]/90 disabled:opacity-70"
            >
              {isSubmitting
                ? COPY.submitPending
                : isCheckingInternalTeacherPhone
                  ? COPY.internalTeacherMatchChecking
                  : COPY.submitIdle}
            </Button>
          </div>
        </div>

        <MobileTabBar active="home" items={buildAdminTabItems(campus)} />
      </div>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent
          showCloseButton={false}
          overlayClassName="bg-[rgba(15,23,42,0.35)]"
          className="max-w-[320px] gap-4 rounded-[16px] border-0 bg-white p-6 shadow-none ring-0"
        >
          <div className="space-y-2.5">
            <DialogTitle className="text-[18px] font-semibold text-[#1E3A5F]">
              {COPY.dialogTitle}
            </DialogTitle>
            <DialogDescription className="text-sm leading-6 text-[#666666]">
              {formatCopy(COPY.dialogDescription, {
                courseTitle,
                currentTeacher: currentTeacherLabel,
                nextTeacher: normalizeExternalTeacherName(name),
              })}
            </DialogDescription>
          </div>

          <div className="rounded-[12px] bg-[#FFF8F0] px-3.5 py-3 text-[12px] leading-6 text-[#7C5A22]">
            {formatCopy(COPY.dialogCurrent, {
              currentTeacher: currentTeacherLabel,
            })}
            <br />
            {formatCopy(COPY.dialogNext, {
              nextTeacher: `${normalizeExternalTeacherName(name)} · ${normalizeExternalTeacherPhone(phone)}`,
            })}
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting}
              onClick={() => setConfirmOpen(false)}
              className="h-11 rounded-[8px] border-0 bg-[#F5F5F5] text-[15px] font-medium text-[var(--jp-text)] hover:bg-[#F5F5F5]"
            >
              {COPY.cancel}
            </Button>
            <Button
              type="button"
              disabled={isSubmitting}
              onClick={handleConfirm}
              className="h-11 rounded-[8px] bg-[#1E3A5F] text-[15px] font-semibold text-white hover:bg-[#1E3A5F]/90"
            >
              {isSubmitting ? COPY.submitPending : COPY.confirm}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}
