"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { GraduationCap, Phone, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { resolveLoginDestination } from "@/lib/services/mobile-app";

export function LoginForm() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  function handleSubmit() {
    const nextHref = resolveLoginDestination(phone);

    if (!nextHref || code.trim().length === 0) {
      setError("请输入正确手机号和验证码");
      return;
    }

    setError("");
    router.push(nextHref);
  }

  return (
    <div className="px-7">
      <section className="flex flex-col items-center gap-3 pt-20 text-center">
        <div className="flex size-16 items-center justify-center text-[var(--jp-accent)]">
          <GraduationCap className="size-16" strokeWidth={1.8} />
        </div>
        <h1 className="text-[32px] font-medium tracking-[-0.03em] text-[var(--jp-text)]">
          嘉祥素质教育
        </h1>
        <p className="text-sm text-[var(--jp-text-secondary)]">成就每一份热爱</p>
      </section>

      <section className="space-y-4 pt-10">
        <div className="rounded-[16px] bg-[var(--jp-surface)] p-4 shadow-[0_14px_30px_rgba(28,28,28,0.04)] ring-1 ring-[color:var(--jp-border)]">
          <label
            htmlFor="phone"
            className="text-[13px] font-medium text-[var(--jp-text-secondary)]"
          >
            手机号
          </label>
          <div className="mt-2 flex h-12 items-center gap-3 rounded-[12px] bg-[var(--jp-surface-muted)] px-4">
            <Phone className="size-[18px] text-[var(--jp-text-muted)]" />
            <Input
              id="phone"
              inputMode="numeric"
              placeholder="请输入手机号"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              className="h-auto border-0 bg-transparent px-0 py-0 text-[15px] text-[var(--jp-text)] shadow-none focus-visible:ring-0"
            />
          </div>
        </div>

        <div className="rounded-[16px] bg-[var(--jp-surface)] p-4 shadow-[0_14px_30px_rgba(28,28,28,0.04)] ring-1 ring-[color:var(--jp-border)]">
          <label
            htmlFor="code"
            className="text-[13px] font-medium text-[var(--jp-text-secondary)]"
          >
            验证码
          </label>
          <div className="mt-2 flex gap-3">
            <div className="flex h-12 flex-1 items-center gap-3 rounded-[12px] bg-[var(--jp-surface-muted)] px-4">
              <ShieldCheck className="size-[18px] text-[var(--jp-text-muted)]" />
              <Input
                id="code"
                placeholder="请输入验证码"
                value={code}
                onChange={(event) => setCode(event.target.value)}
                className="h-auto border-0 bg-transparent px-0 py-0 text-[15px] text-[var(--jp-text)] shadow-none focus-visible:ring-0"
              />
            </div>
            <Button className="h-12 w-20 rounded-[12px] bg-[var(--jp-accent)] text-[var(--jp-bg)] hover:bg-[var(--jp-accent)]/90">
              获取
            </Button>
          </div>
        </div>

        <Button
          type="button"
          onClick={handleSubmit}
          className="h-[52px] w-full rounded-[16px] bg-[var(--jp-accent)] text-base font-semibold text-[var(--jp-bg)] hover:bg-[var(--jp-accent)]/90"
        >
          登录
        </Button>

        {error ? (
          <p className="px-0.5 text-[13px] font-medium text-[#D32F2F]">{error}</p>
        ) : null}

        <label className="flex items-center gap-2 px-0.5 pt-2 text-[13px] text-[var(--jp-text-secondary)]">
          <input
            type="checkbox"
            defaultChecked
            className="size-[18px] rounded-[4px] border-[1.5px] border-[var(--jp-border-strong)] accent-[var(--jp-accent)]"
          />
          <span>已阅读并同意</span>
          <Link href="/login" className="text-[var(--jp-accent)]">
            《用户协议》
          </Link>
        </label>
      </section>
    </div>
  );
}
