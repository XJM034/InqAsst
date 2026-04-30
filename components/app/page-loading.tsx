import { PageShell } from "@/components/app/page-shell";

export function PageLoading() {
  return (
    <PageShell>
      <div className="app-screen">
        <div className="app-scroll flex items-center justify-center">
          <div className="flex flex-col items-center gap-3 py-32">
            <div className="size-8 animate-spin rounded-full border-[3px] border-[var(--jp-border)] border-t-[var(--jp-accent)]" />
            <p className="text-[13px] text-[var(--jp-text-muted)]">加载中...</p>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
