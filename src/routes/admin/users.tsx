import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AdminPageHeader, EmptyState, StatusBadge } from "@/components/admin/AdminUI";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { useAdminSession } from "@/hooks/useAdminSession";
import { ASSIGNABLE_ROLES, roleLabel } from "@/lib/admin/permissions";
import { formatDate } from "@/lib/admin/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export const Route = createFileRoute("/admin/users")({
  component: AdminUsers,
});

function AdminUsers() {
  const { permissions, userId } = useAdminSession();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<string>("editor");
  const [removeRoleId, setRemoveRoleId] = useState<string | null>(null);

  const { data: users = [], isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const [adminsRes, profilesRes] = await Promise.all([
        supabase.from("admins").select("*").order("created_at", { ascending: false }),
        supabase.from("profiles").select("*"),
      ]);
      if (adminsRes.error) throw adminsRes.error;
      if (profilesRes.error) throw profilesRes.error;

      const profileMap = new Map((profilesRes.data ?? []).map((p) => [p.id, p]));

      return (adminsRes.data ?? []).map((admin) => {
        const profile = profileMap.get(admin.user_id);
        return {
          roleId: admin.id,
          userId: admin.user_id,
          role: admin.role,
          email: admin.email ?? (profile as { email?: string } | undefined)?.email ?? "—",
          displayName: profile?.display_name ?? admin.email ?? "—",
          lastLogin: (profile as { last_login_at?: string } | undefined)?.last_login_at,
          isActive: (profile as { is_active?: boolean } | undefined)?.is_active ?? true,
        };
      });
    },
    enabled: permissions.canManageUsers,
  });

  const { data: pendingInvites = [] } = useQuery({
    queryKey: ["admin-invites"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("admin_invites")
        .select("*")
        .is("accepted_at", null)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: permissions.canManageUsers,
  });

  const inviteMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("admin_invites").insert({
        email: email.trim().toLowerCase(),
        role: role as "admin" | "editor" | "viewer" | "super_admin",
        invited_by: userId,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-invites"] });
      toast.success("Admin invite created. User will receive access on first sign-in.");
      setOpen(false);
      setEmail("");
      setRole("editor");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const removeRoleMutation = useMutation({
    mutationFn: async (roleId: string) => {
      const { error: adminError } = await supabase.from("admins").delete().eq("id", roleId);
      if (adminError) throw adminError;
      const target = users.find((u) => u.roleId === roleId);
      if (target) {
        await supabase.from("user_roles").delete().eq("user_id", target.userId);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("Admin access removed");
      setRemoveRoleId(null);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (!permissions.canManageUsers) {
    return <EmptyState title="Access restricted" description="Only administrators can manage admin users." />;
  }

  return (
    <>
      <AdminPageHeader
        title="Admin Users"
        description="Invite approved staff by email. Public sign-up is disabled — access is granted only by invitation."
        action={
          <button type="button" onClick={() => setOpen(true)} className="btn-primary inline-flex items-center gap-2">
            <Plus className="h-4 w-4" /> Add admin
          </button>
        }
      />

      {pendingInvites.length > 0 && (
        <section className="mb-6 rounded-xl border border-[color-mix(in_srgb,var(--brand-gold)_35%,white)] bg-[color-mix(in_srgb,var(--brand-gold)_8%,white)] p-5">
          <h2 className="text-sm font-bold">Pending invites</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {pendingInvites.map((invite) => (
              <li key={invite.id} className="flex justify-between gap-3">
                <span>{invite.email}</span>
                <span className="text-muted-foreground">{roleLabel(invite.role)}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading users…</p>
      ) : users.length === 0 ? (
        <EmptyState title="No admin users yet" description="Add the first approved admin by email invitation." />
      ) : (
        <>
          {/* Mobile cards */}
          <div className="space-y-3 md:hidden">
            {users.map((u) => (
              <article key={u.roleId} className="card-ngo p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="break-words text-sm font-semibold">{u.displayName}</p>
                    <p className="break-all text-xs text-muted-foreground">{u.email}</p>
                  </div>
                  <StatusBadge status={u.isActive ? "active" : "inactive"} />
                </div>
                <dl className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <dt className="text-muted-foreground">Role</dt>
                    <dd className="font-medium">{roleLabel(u.role)}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Last login</dt>
                    <dd className="font-medium">{formatDate(u.lastLogin)}</dd>
                  </div>
                </dl>
                {u.userId !== userId && (
                  <button
                    type="button"
                    onClick={() => setRemoveRoleId(u.roleId)}
                    className="mt-3 inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-semibold text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Remove access
                  </button>
                )}
              </article>
            ))}
          </div>

          {/* Desktop table */}
          <div className="hidden overflow-hidden rounded-xl border border-border bg-background md:block">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-surface text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Last login</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.roleId} className="border-b border-border/70">
                    <td className="px-4 py-3 font-semibold">{u.displayName}</td>
                    <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                    <td className="px-4 py-3">{roleLabel(u.role)}</td>
                    <td className="px-4 py-3 text-muted-foreground">{formatDate(u.lastLogin)}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={u.isActive ? "active" : "inactive"} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      {u.userId !== userId && (
                        <button type="button" onClick={() => setRemoveRoleId(u.roleId)} className="rounded-md p-2 text-destructive hover:bg-destructive/10">
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

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Invite admin user</DialogTitle></DialogHeader>
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              inviteMutation.mutate();
            }}
          >
            <label className="block text-sm">
              <span className="font-semibold">Email address</span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2"
                placeholder="admin@example.com"
              />
            </label>
            <label className="block text-sm">
              <span className="font-semibold">Role</span>
              <select value={role} onChange={(e) => setRole(e.target.value)} className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2">
                {ASSIGNABLE_ROLES.map((r) => (
                  <option key={r} value={r}>{roleLabel(r)}</option>
                ))}
              </select>
            </label>
            <p className="text-xs text-muted-foreground">
              The user must sign in with this exact email via Google or password. No public registration is available.
            </p>
            <button type="submit" disabled={inviteMutation.isPending} className="btn-primary w-full">
              {inviteMutation.isPending ? "Sending invite…" : "Create invite"}
            </button>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!removeRoleId}
        onOpenChange={(v) => !v && setRemoveRoleId(null)}
        title="Remove admin access?"
        description="This user will lose dashboard access immediately."
        confirmLabel="Remove access"
        onConfirm={() => removeRoleId && removeRoleMutation.mutate(removeRoleId)}
      />
    </>
  );
}
