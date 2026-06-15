import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AdminPageHeader, EmptyState, StatusBadge } from "@/components/admin/AdminUI";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { useAdminSession } from "@/hooks/useAdminSession";
import { formatDate } from "@/lib/admin/utils";
import { createLazyFileRoute } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/admin/messages")({
  component: AdminMessages,
});

type MessageRow = {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  created_at: string;
  status?: string;
  handled?: boolean;
};

function AdminMessages() {
  const { permissions } = useAdminSession();
  const queryClient = useQueryClient();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ["admin-messages"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contact_messages")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as MessageRow[];
    },
    enabled: permissions.canManageMessages,
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from("contact_messages")
        .update({ status, handled: status !== "new" })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-messages"] });
      toast.success("Message updated");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("contact_messages").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-messages"] });
      toast.success("Message deleted");
      setDeleteId(null);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (!permissions.canManageMessages) {
    return (
      <EmptyState
        title="Access restricted"
        description="You do not have permission to view contact messages."
      />
    );
  }

  return (
    <>
      <AdminPageHeader
        title="Contact Messages"
        description="Review and respond to inquiries from the public contact form."
      />

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading messages…</p>
      ) : messages.length === 0 ? (
        <EmptyState
          title="No messages yet"
          description="Contact form submissions will appear here."
        />
      ) : (
        <div className="space-y-4">
          {messages.map((m) => {
            const status = m.status ?? (m.handled ? "read" : "new");
            return (
              <article
                key={m.id}
                className="brand-card rounded-xl border border-border bg-background p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">{m.name}</p>
                    <p className="text-sm text-muted-foreground">{m.email}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={status} />
                    <p className="text-xs text-muted-foreground">{formatDate(m.created_at)}</p>
                  </div>
                </div>
                {m.subject && <p className="mt-3 text-sm font-semibold">{m.subject}</p>}
                <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">
                  {m.message}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {status === "new" && (
                    <button
                      type="button"
                      onClick={() => updateMutation.mutate({ id: m.id, status: "read" })}
                      className="btn-outline px-3 py-1.5 text-xs"
                    >
                      Mark as read
                    </button>
                  )}
                  {status !== "replied" && (
                    <button
                      type="button"
                      onClick={() => updateMutation.mutate({ id: m.id, status: "replied" })}
                      className="btn-outline px-3 py-1.5 text-xs"
                    >
                      Mark as replied
                    </button>
                  )}
                  {permissions.canDeleteMessages && (
                    <button
                      type="button"
                      onClick={() => setDeleteId(m.id)}
                      className="inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-semibold text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Delete
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(v) => !v && setDeleteId(null)}
        title="Delete message?"
        description="This contact message will be permanently removed."
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
      />
    </>
  );
}
