"use client";

import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { GraduationCap, Phone, ShieldCheck } from "lucide-react";

import { CampusSelectionDialog } from "@/components/app/campus-selection-dialog";
import { StaticLink } from "@/components/app/static-link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  loginWithCode,
  selectCampusAfterLogin,
  sendLoginCode,
  type LoginCampusOption,
} from "@/lib/services/mobile-client";

export function LoginForm() {
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectionToken, setSelectionToken] = useState<string | null>(null);
  const [campusOptions, setCampusOptions] = useState<LoginCampusOption[]>([]);
  const [selectingCampusId, setSelectingCampusId] = useState<number | null>(null);

  const hasPendingCampusSelection = Boolean(selectionToken && campusOptions.length > 0);
  const submitDisabled = isSubmitting || hasPendingCampusSelection;

  useEffect(() => {
    if (!isSendingCode && !isSubmitting) {
      return;
    }

    const timer = window.setTimeout(() => {
      setNotice((current) => {
        if (current) {
          return current;
        }

        return isSendingCode
          ? "共享开发环境响应较慢，请稍候..."
          : "共享开发环境响应较慢，正在继续处理...";
      });
    }, 4000);

    return () => window.clearTimeout(timer);
  }, [isSendingCode, isSubmitting]);

  function clearCampusSelection() {
    setSelectionToken(null);
    setCampusOptions([]);
    setSelectingCampusId(null);
  }

  function handlePhoneChange(value: string) {
    const digits = value.replace(/\D/g, "").slice(0, 11);
    setPhone(digits);

    if (hasPendingCampusSelection) {
      clearCampusSelection();
    }
  }

  function handleCodeChange(value: string) {
    const digits = value.replace(/\D/g, "").slice(0, 6);
    setCode(digits);

    if (hasPendingCampusSelection) {
      clearCampusSelection();
    }
  }

  async function handleSendCode() {
    const normalizedPhone = phone.replace(/\D/g, "");

    if (normalizedPhone.length !== 11) {
      setError("请输入正确的手机号");
      return;
    }

    setError("");
    setNotice("");
    setIsSendingCode(true);

    try {
      const message = await sendLoginCode(normalizedPhone);
      setNotice(message);
      setCooldown(60);

      const timer = setInterval(() => {
        setCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }

          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      setNotice(
        err instanceof Error
          ? err.message
          : "验证码接口暂不可用，可直接输入验证码继续演示",
      );
    } finally {
      setIsSendingCode(false);
    }
  }

  async function handleSubmit() {
    const normalizedPhone = phone.replace(/\D/g, "");

    if (normalizedPhone.length !== 11 || code.trim().length === 0) {
      setError("请输入正确的手机号和验证码");
      return;
    }

    setError("");
    setNotice("");
    setIsSubmitting(true);

    try {
      const result = await loginWithCode(normalizedPhone, code.trim());

      if (result.mode === "selection") {
        setSelectionToken(result.selectionToken);
        setCampusOptions(result.campusOptions);
        setNotice("请选择登录校区");
        return;
      }

      clearCampusSelection();
      window.location.href = result.homeHref;
    } catch (err) {
      setError(err instanceof Error ? err.message : "登录失败，请稍后重试");
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleFormSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (submitDisabled) {
      return;
    }

    void handleSubmit();
  }

  async function handleSelectCampus(option: LoginCampusOption) {
    if (!selectionToken || isSubmitting) {
      return;
    }

    setError("");
    setNotice("正在登录...");
    setSelectingCampusId(option.adminUserId);
    setIsSubmitting(true);

    try {
      const result = await selectCampusAfterLogin(
        selectionToken,
        option.adminUserId,
        campusOptions,
      );
      clearCampusSelection();
      window.location.href = result.homeHref;
    } catch (err) {
      const message = err instanceof Error ? err.message : "校区选择失败，请重新登录";
      setError(message);
      setNotice("");

      if (message.includes("重新登录")) {
        clearCampusSelection();
      }
    } finally {
      setIsSubmitting(false);
      setSelectingCampusId(null);
    }
  }

  return (
    <div className="flex min-h-full overflow-y-auto px-6 pb-[calc(32px+env(safe-area-inset-bottom))] pt-12 sm:items-center sm:px-8 sm:pt-16">
      <div className="mx-auto w-full max-w-[430px]">
        <section className="flex items-start justify-between gap-5">
          <div className="min-w-0">
            <p className="text-[12px] font-semibold text-[var(--jp-accent)]">
              现场点名入口
            </p>
            <h1 className="mt-3 text-[30px] font-semibold leading-tight text-[var(--jp-text)]">
              到了么
            </h1>
            <p className="mt-2 text-[14px] leading-6 text-[var(--jp-text-secondary)]">
              安心确认每一堂课
            </p>
          </div>
          <div className="flex size-14 shrink-0 items-center justify-center rounded-[20px] bg-[color:var(--jp-surface)] text-[var(--jp-accent)] shadow-[0_16px_36px_rgba(30,58,95,0.12)] ring-1 ring-[color:var(--jp-border)]">
            <GraduationCap className="size-8" strokeWidth={1.8} />
          </div>
        </section>

        <form
          className="mt-8 rounded-[24px] bg-[var(--jp-surface)] p-4 shadow-[0_18px_48px_rgba(28,28,28,0.07)] ring-1 ring-[color:var(--jp-border)]"
          onSubmit={handleFormSubmit}
        >
          <div className="space-y-4">
            <div>
              <label
                htmlFor="phone"
                className="text-[13px] font-medium text-[var(--jp-text-secondary)]"
              >
                手机号
              </label>
              <div className="mt-2 flex h-12 items-center gap-3 rounded-[14px] bg-[var(--jp-surface-muted)] px-4 transition-[box-shadow,background-color] duration-200 focus-within:bg-white focus-within:shadow-[0_0_0_2px_color-mix(in_srgb,var(--jp-accent)_18%,transparent)]">
                <Phone className="size-[18px] shrink-0 text-[var(--jp-text-muted)]" />
                <Input
                  id="phone"
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel"
                  placeholder="请输入手机号"
                  value={phone}
                  aria-invalid={Boolean(error && phone.replace(/\D/g, "").length !== 11)}
                  onChange={(event) => handlePhoneChange(event.target.value)}
                  className="h-auto border-0 bg-transparent px-0 py-0 text-[15px] text-[var(--jp-text)] shadow-none placeholder:text-[var(--jp-text-muted)] focus-visible:ring-0"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="code"
                className="text-[13px] font-medium text-[var(--jp-text-secondary)]"
              >
                验证码
              </label>
              <div className="mt-2 flex gap-3">
                <div className="flex h-12 min-w-0 flex-1 items-center gap-3 rounded-[14px] bg-[var(--jp-surface-muted)] px-4 transition-[box-shadow,background-color] duration-200 focus-within:bg-white focus-within:shadow-[0_0_0_2px_color-mix(in_srgb,var(--jp-accent)_18%,transparent)]">
                  <ShieldCheck className="size-[18px] shrink-0 text-[var(--jp-text-muted)]" />
                  <Input
                    id="code"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    placeholder="请输入验证码"
                    value={code}
                    aria-invalid={Boolean(error && code.trim().length === 0)}
                    onChange={(event) => handleCodeChange(event.target.value)}
                    className="h-auto border-0 bg-transparent px-0 py-0 text-[15px] text-[var(--jp-text)] shadow-none placeholder:text-[var(--jp-text-muted)] focus-visible:ring-0"
                  />
                </div>
                <Button
                  type="button"
                  onClick={handleSendCode}
                  disabled={isSendingCode || cooldown > 0}
                  className="h-12 w-[96px] shrink-0 rounded-[14px] bg-[var(--jp-accent)] text-[13px] font-semibold text-[var(--jp-bg)] shadow-[0_12px_22px_rgba(30,58,95,0.18)] hover:bg-[var(--jp-accent)]/90 disabled:opacity-70"
                >
                  {isSendingCode ? "发送中" : cooldown > 0 ? `${cooldown}s` : "获取验证码"}
                </Button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={submitDisabled}
              className="h-[52px] w-full rounded-[16px] bg-[var(--jp-accent)] text-base font-semibold text-[var(--jp-bg)] shadow-[0_16px_30px_rgba(30,58,95,0.2)] hover:bg-[var(--jp-accent)]/90 disabled:opacity-70"
            >
              {hasPendingCampusSelection ? "已进入校区选择" : isSubmitting ? "登录中" : "登录"}
            </Button>
          </div>

          <div aria-live="polite" className="min-h-9 pt-3">
            {error ? (
              <p
                className="text-[13px] font-medium leading-5 text-[var(--jp-negative)]"
                role="alert"
              >
                {error}
              </p>
            ) : notice ? (
              <p className="text-[13px] font-medium leading-5 text-[var(--jp-accent)]">
                {notice}
              </p>
            ) : null}
          </div>

          <div className="flex items-center gap-2 border-t border-[color:var(--jp-border)] pt-3 text-[13px] text-[var(--jp-text-secondary)]">
            <input
              id="login-terms"
              type="checkbox"
              defaultChecked
              className="size-[18px] shrink-0 rounded-[5px] border-[1.5px] border-[var(--jp-border-strong)] accent-[var(--jp-accent)]"
            />
            <label htmlFor="login-terms" className="min-w-0">
              已阅读并同意
            </label>
            <StaticLink
              href="/login"
              className="font-medium text-[var(--jp-accent)] underline-offset-4 hover:underline"
            >
              《用户协议》
            </StaticLink>
          </div>
        </form>
      </div>

      <CampusSelectionDialog
        open={hasPendingCampusSelection}
        title="选择登录校区"
        description="检测到该手机号对应多个管理校区，请选择要进入的校区"
        footerText="选择后将直接进入对应校区主页"
        options={campusOptions.map((option) => ({
          id: `${option.campusId}-${option.adminUserId}`,
          title: option.campusName ?? `校区 ${option.campusId}`,
          subtitle: option.adminName ?? undefined,
          badgeLabel: "进入",
          disabled: isSubmitting,
          loading: selectingCampusId === option.adminUserId,
        }))}
        onSelect={(optionId) => {
          const target = campusOptions.find(
            (option) => `${option.campusId}-${option.adminUserId}` === optionId,
          );

          if (target) {
            void handleSelectCampus(target);
          }
        }}
      />
    </div>
  );
}
