import { LoginForm } from "@/components/app/login-form";
import { PageShell } from "@/components/app/page-shell";

export default function LoginPage() {
  return (
    <PageShell>
      <LoginForm />
      <div className="h-[60px]" />
    </PageShell>
  );
}
