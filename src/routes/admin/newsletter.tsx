import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Download, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AdminPageHeader, EmptyState } from "@/components/admin/AdminUI";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { useAdminSession } from "@/hooks/useAdminSession";
import { formatDate } from "@/lib/admin/utils";

export const Route = createFileRoute("/admin/newsletter")({
  component: AdminNewsletter,
});

function AdminNewsletter() {
  const { permissions } = useAdminSession();
  const queryClient = useQueryClient();
  const [deleteId, setDeleteId] = useState<string | null>(null);

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
        description="View and export community subscribers from the public website."
        action={
          subscribers.length > 0 ? (
            <button type="button" onClick={exportCsv} className="btn-outline inline-flex items-center gap-2">
              <Download className="h-4 w-4" /> Export CSV
            </button>
          ) : undefined
        }
      />

      <div className="mb-6 rounded-lg border border-border bg-surface/60 p-4 text-sm text-muted-foreground">
        <p className="font-medium text-foreground">Email notifications (Vercel server env)</p>
        <p className="mt-1">
          New public sign-ups trigger admin notification emails when these variables are set:
        </p>
        <ul className="mt-2 list-inside list-disc space-y-1">
          <li>
            <code className="text-xs">RESEND_API_KEY</code> — Resend API key (server only, no VITE_ prefix)
          </li>
          <li>
            <code className="text-xs">NEWSLETTER_FROM_EMAIL</code> — verified sender, e.g.{" "}
            <code className="text-xs">YOHRIAE &lt;newsletters@yohriae.com&gt;</code>
          </li>
          <li>
            <code className="text-xs">SUPABASE_URL</code> +{" "}
            <code className="text-xs">SUPABASE_SERVICE_ROLE_KEY</code> (or publishable key fallback)
          </li>
        </ul>
        <p className="mt-2">
          Notifications go to yohriae2019@gmail.com and yohriaenigeria@gmail.com. Subscriptions still save
          without email configured.
        </p>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading subscribers…</p>
      ) : subscribers.length === 0 ? (
        <EmptyState title="No subscribers yet" description="Newsletter signups from the public site will appear here." />
      ) : (
        <>
          {/* Mobile cards */}
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

          {/* Desktop table */}
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
