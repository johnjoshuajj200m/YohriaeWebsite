export function AnalyticsStatSkeleton() {
  return (
    <div className="brand-card animate-pulse rounded-xl border border-border bg-background p-5">
      <div className="mb-4 h-1 w-12 rounded-full bg-surface" />
      <div className="h-8 w-24 rounded-md bg-surface" />
      <div className="mt-3 h-3 w-28 rounded bg-surface" />
    </div>
  );
}

export function AnalyticsPanelSkeleton({ tall = false }: { tall?: boolean }) {
  return (
    <div className="brand-card animate-pulse rounded-xl border border-border bg-background p-6">
      <div className="h-3 w-20 rounded bg-surface" />
      <div className="mt-2 h-5 w-40 rounded bg-surface" />
      <div className={`mt-6 rounded-lg bg-surface ${tall ? "h-72" : "h-64"}`} />
    </div>
  );
}

export function AnalyticsPageSkeleton() {
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <AnalyticsStatSkeleton key={i} />
        ))}
      </div>
      <div className="mt-8 grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <AnalyticsPanelSkeleton tall />
        <AnalyticsPanelSkeleton tall />
      </div>
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <AnalyticsPanelSkeleton />
        <AnalyticsPanelSkeleton />
      </div>
    </>
  );
}

export function AnalyticsErrorState({
  title,
  message,
  details,
  onRetry,
}: {
  title: string;
  message: string;
  details?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6">
      <h2 className="text-lg font-bold text-foreground">{title}</h2>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">{message}</p>
      {details && details !== message ? (
        <pre className="mt-3 max-w-2xl overflow-x-auto rounded-md border border-destructive/20 bg-background/60 p-3 text-xs leading-snug text-foreground whitespace-pre-wrap wrap-break-word">
          {details}
        </pre>
      ) : null}
      {onRetry && (
        <button type="button" onClick={onRetry} className="btn-outline mt-4 px-4 py-2 text-sm">
          Try again
        </button>
      )}
    </div>
  );
}
