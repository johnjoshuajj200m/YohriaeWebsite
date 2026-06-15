import type { ReactNode } from "react";
import { AlertCircle, Loader2 } from "lucide-react";

type PublicQueryLoadingProps = {
  message?: string;
  className?: string;
};

export function PublicQueryLoading({
  message = "Loading…",
  className = "",
}: PublicQueryLoadingProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 py-12 text-center ${className}`}
      role="status"
      aria-live="polite"
    >
      <Loader2 className="h-8 w-8 animate-spin text-primary/60" aria-hidden />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}

type PublicQueryErrorProps = {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
};

export function PublicQueryError({
  title = "Unable to load content",
  message = "Something went wrong while loading this section. Please try again in a moment.",
  onRetry,
  className = "",
}: PublicQueryErrorProps) {
  return (
    <div className={`card-ngo mx-auto max-w-xl p-8 text-center ${className}`} role="alert">
      <AlertCircle className="mx-auto h-10 w-10 text-destructive/70" aria-hidden />
      <p className="mt-4 text-lg font-semibold">{title}</p>
      <p className="mt-2 text-sm text-muted-foreground">{message}</p>
      {onRetry && (
        <button type="button" onClick={onRetry} className="btn-outline mt-6 text-sm">
          Try again
        </button>
      )}
    </div>
  );
}

type PublicQueryEmptyProps = {
  icon?: ReactNode;
  title: string;
  description: string;
  className?: string;
  children?: ReactNode;
};

export function PublicQueryEmpty({
  icon,
  title,
  description,
  className = "",
  children,
}: PublicQueryEmptyProps) {
  return (
    <div className={`card-ngo mx-auto max-w-xl p-10 text-center ${className}`}>
      {icon}
      <p className="mt-4 text-lg font-semibold">{title}</p>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      {children}
    </div>
  );
}

type PublicQueryNoticeProps = {
  message: string;
  onRetry?: () => void;
  className?: string;
};

/** Inline banner when content is shown from a fallback after a failed fetch. */
export function PublicQueryNotice({ message, onRetry, className = "" }: PublicQueryNoticeProps) {
  return (
    <div
      className={`mb-6 rounded-sm border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950 ${className}`}
      role="status"
    >
      <p>{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="prose-link mt-2 inline-block text-sm font-semibold"
        >
          Try again
        </button>
      )}
    </div>
  );
}

export function publicQueryErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) return error.message;
  return "Please check your connection and try again.";
}
