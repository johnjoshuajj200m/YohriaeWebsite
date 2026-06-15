import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { CheckCircle2, Download, Loader2, Mail, Send, Trash2, XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AdminPageHeader, EmptyState } from "@/components/admin/AdminUI";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { useAdminSession } from "@/hooks/useAdminSession";
import { formatDate } from "@/lib/admin/utils";
import { createLazyFileRoute } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/admin/newsletter")({
  component: AdminNewsletter,
});

type NewsletterStatusEnvFlags = {
  RESEND_API_KEY: boolean;
  NEWSLETTER_FROM_EMAIL: boolean;
  ADMIN_NOTIFICATION_EMAILS: boolean;
};

type NewsletterStatus = {
  resendApiKeyConfigured: boolean;
  from: string;
  fromLooksValid: boolean;
  adminRecipients: string[];
  adminRecipientsValid: boolean;
  envVars: NewsletterStatusEnvFlags;
  configured: boolean;
  message: string;
};

type NewsletterTestRecipient = { email: string; ok: boolean; error?: string; messageId?: string };

type NewsletterTestResponse =
  | { ok: true; sentAt: string; from: string; recipients: NewsletterTestRecipient[] }
  | { ok: false; error: string; details?: string; recipients?: NewsletterTestRecipient[] };

async function postJson<T>(url: string, body?: unknown): Promise<{ status: number; data: T | null }> {
  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData.session?.access_token;
  const res = await fetch(url, {
    method: body === undefined ? "GET" : "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const contentType = res.headers.get("content-type") ?? "";
  if (!contentType.toLowerCase().includes("application/json")) {
    return { status: res.status, data: null };
  }
  try {
    return { status: res.status, data: (await res.json()) as T };
  } catch {
    return { status: res.status, data: null };
  }
}

function AdminNewsletter() {
  const { permissions } = useAdminSession();
  const queryClient = useQueryClient();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [lastTest, setLastTest] = useState<{
    at: string;
    result: NewsletterTestResponse;
  } | null>(null);

  const { data: subscribers = [], isLoading } = useQuery({
    queryKey: ["admin-newsletter"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("newsletter_subscribers")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: permissions.canManageNewsletter,
  });

  const { data: statusResponse, isLoading: statusLoading } = useQuery({
    queryKey: ["admin-newsletter-status"],
    queryFn: async () => {
      const res = await postJson<{ ok: boolean; status?: NewsletterStatus; error?: string }>(
        "/api/newsletter/status",
      );
      return res;
    },
    enabled: permissions.canManageNewsletter,
    staleTime: 30_000,
    refetchOnWindowFocus: true,
  });

  const status: NewsletterStatus | null =
    statusResponse?.data?.ok && statusResponse.data.status ? statusResponse.data.status : null;
  const statusError =
    statusResponse?.data && !statusResponse.data.ok
      ? statusResponse.data.error ?? "Could not load newsletter status."
      : statusResponse && statusResponse.data === null
        ? "Newsletter status endpoint did not return JSON."
        : null;

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("newsletter_subscribers").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-newsletter"] });
      toast.success("Subscriber removed");
      setDeleteId(null);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const testMutation = useMutation({
    mutationFn: async (): Promise<NewsletterTestResponse> => {
      const res = await postJson<NewsletterTestResponse>("/api/newsletter/test", {});
      if (res.data === null) {
        throw new Error(
          `Newsletter test endpoint did not return JSON (status ${res.status}). Redeploy the latest server.`,
        );
      }
      return res.data;
    },
    onSuccess: (result) => {
      setLastTest({ at: new Date().toISOString(), result });
      if (result.ok) {
        toast.success("Test email sent");
      } else {
        toast.error(result.error || "Test email failed");
      }
    },
    onError: (e: Error) => {
      setLastTest({
        at: new Date().toISOString(),
        result: { ok: false, error: e.message },
      });
      toast.error(e.message);
    },
  });

  function exportCsv() {
    const header = "email,subscribed_at\n";
    const rows = subscribers.map((s) => `${s.email},${s.created_at}`).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "yohriae-newsletter-subscribers.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV exported");
  }

  if (!permissions.canManageNewsletter) {
    return <EmptyState title="Access restricted" description="You do not have permission to manage newsletter subscribers." />;
  }

  return (
    <>
      <AdminPageHeader
        title="Newsletter Subscribers"
        description="View community subscribers and verify admin email notifications."
        action={
          subscribers.length > 0 ? (
            <button type="button" onClick={exportCsv} className="btn-outline inline-flex items-center gap-2">
              <Download className="h-4 w-4" /> Export CSV
            </button>
          ) : undefined
        }
      />

      <section className="mb-6 rounded-lg border border-border bg-surface/60 p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Mail className="h-4 w-4 text-primary" /> Email notifications
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Test the Resend integration and confirm admin notifications reach{" "}
              yohriae2019@gmail.com and yohriaenigeria@gmail.com.
            </p>
          </div>
          <button
            type="button"
            onClick={() => testMutation.mutate()}
            disabled={testMutation.isPending}
            className="btn-primary inline-flex items-center gap-2 px-4 py-2 text-sm disabled:opacity-60"
          >
            {testMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            Send test notification
          </button>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <StatusCard
            loading={statusLoading}
            ok={status?.configured ?? false}
            title="Configuration status"
            value={status ? status.message : statusError ?? "Loading…"}
            details={
              status ? (
                <ul className="mt-2 list-inside list-disc space-y-1">
                  <EnvFlag label="RESEND_API_KEY" ok={status.envVars.RESEND_API_KEY} />
                  <EnvFlag
                    label="NEWSLETTER_FROM_EMAIL"
                    ok={status.envVars.NEWSLETTER_FROM_EMAIL}
                    extra={!status.fromLooksValid ? `(uses fallback: ${status.from})` : status.from}
                  />
                  <EnvFlag
                    label="ADMIN_NOTIFICATION_EMAILS"
                    ok={status.envVars.ADMIN_NOTIFICATION_EMAILS}
                    extra={
                      status.adminRecipients.length > 0
                        ? status.adminRecipients.join(", ")
                        : "default recipients"
                    }
                  />
                </ul>
              ) : null
            }
          />
          <StatusCard
            loading={false}
            ok={lastTest?.result.ok ?? null}
            title="Last test send"
            value={
              lastTest
                ? lastTest.result.ok
                  ? `Sent ${new Date(lastTest.at).toLocaleString()}`
                  : `Failed ${new Date(lastTest.at).toLocaleString()}: ${lastTest.result.error}`
                : "No test sent in this session yet."
            }
            details={
              lastTest && !lastTest.result.ok && lastTest.result.details ? (
                <pre className="mt-2 max-h-48 overflow-x-auto rounded-md border border-destructive/20 bg-background/60 p-2 text-[11px] leading-snug whitespace-pre-wrap wrap-break-word text-foreground">
                  {lastTest.result.details}
                </pre>
              ) : lastTest && lastTest.result.ok && lastTest.result.recipients.length > 0 ? (
                <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                  {lastTest.result.recipients.map((r) => (
                    <li key={r.email}>
                      <span className="font-medium text-foreground">{r.email}</span>
                      {r.messageId ? ` · ${r.messageId}` : ""}
                    </li>
                  ))}
                </ul>
              ) : null
            }
          />
        </div>

        <p className="mt-3 text-xs text-muted-foreground">
          Required Vercel server env vars: <code className="text-[11px]">RESEND_API_KEY</code>,{" "}
          <code className="text-[11px]">NEWSLETTER_FROM_EMAIL</code>,{" "}
          <code className="text-[11px]">ADMIN_NOTIFICATION_EMAILS</code> (optional, defaults provided).
          Subscriptions still save without email configured.
        </p>
      </section>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading subscribers…</p>
      ) : subscribers.length === 0 ? (
        <EmptyState title="No subscribers yet" description="Newsletter signups from the public site will appear here." />
      ) : (
        <>
          <div className="space-y-2 md:hidden">
            {subscribers.map((s) => (
              <div key={s.id} className="card-ngo flex items-center justify-between gap-3 p-4">
                <div className="min-w-0">
                  <p className="break-all text-sm font-medium">{s.email}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{formatDate(s.created_at)}</p>
                </div>
                {permissions.canDeleteNewsletter && (
                  <button
                    type="button"
                    onClick={() => setDeleteId(s.id)}
                    className="shrink-0 rounded-md p-2 text-destructive hover:bg-destructive/10"
                    aria-label="Remove subscriber"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="hidden overflow-hidden rounded-xl border border-border bg-background md:block">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-surface text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Subscribed</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {subscribers.map((s) => (
                  <tr key={s.id} className="border-b border-border/70">
                    <td className="px-4 py-3 font-medium">{s.email}</td>
                    <td className="px-4 py-3 text-muted-foreground">{formatDate(s.created_at)}</td>
                    <td className="px-4 py-3 text-right">
                      {permissions.canDeleteNewsletter && (
                        <button type="button" onClick={() => setDeleteId(s.id)} className="rounded-md p-2 text-destructive hover:bg-destructive/10">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <ConfirmDialog open={!!deleteId} onOpenChange={(v) => !v && setDeleteId(null)} title="Remove subscriber?" description="This email will be removed from the newsletter list." onConfirm={() => deleteId && deleteMutation.mutate(deleteId)} />
    </>
  );
}

function StatusCard({
  loading,
  ok,
  title,
  value,
  details,
}: {
  loading: boolean;
  ok: boolean | null;
  title: string;
  value: string;
  details?: React.ReactNode;
}) {
  const tone =
    loading || ok === null
      ? "border-border bg-background"
      : ok
        ? "border-emerald-500/30 bg-emerald-500/5"
        : "border-destructive/30 bg-destructive/5";
  return (
    <div className={`rounded-lg border ${tone} p-3`}>
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {loading ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : ok === null ? (
          <span className="h-2 w-2 rounded-full bg-muted-foreground/40" />
        ) : ok ? (
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
        ) : (
          <XCircle className="h-3.5 w-3.5 text-destructive" />
        )}
        {title}
      </div>
      <p className="mt-1 wrap-break-word text-sm text-foreground">{value}</p>
      {details}
    </div>
  );
}

function EnvFlag({ label, ok, extra }: { label: string; ok: boolean; extra?: string }) {
  return (
    <li className="text-xs text-muted-foreground">
      <code className="text-[11px]">{label}</code>{" "}
      <span className={ok ? "text-emerald-600" : "text-destructive"}>{ok ? "set" : "missing"}</span>
      {extra ? <span className="ml-1 text-muted-foreground">— {extra}</span> : null}
    </li>
  );
}

