import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getDashboardRoles } from "@/lib/admin/access";
import { getPermissions, type AdminPermissions, type AppRole } from "@/lib/admin/permissions";

type AdminSession = {
  userId: string;
  email: string | null;
  roles: string[];
  role: AppRole | null;
  permissions: AdminPermissions;
  loading: boolean;
  signOut: () => Promise<void>;
};

const AdminSessionContext = createContext<AdminSession | null>(null);

export function AdminSessionProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        navigate({ to: "/auth", replace: true });
      } else {
        setUserId(data.user.id);
        setEmail(data.user.email ?? null);
      }
      setChecking(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") navigate({ to: "/auth", replace: true });
    });

    return () => sub.subscription.unsubscribe();
  }, [navigate]);

  const { data: roles = [], isPending: rolesLoading } = useQuery({
    queryKey: ["admin-roles", userId, email],
    enabled: !!userId,
    queryFn: () => getDashboardRoles(userId!, email),
  });

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }, [navigate]);

  const value = useMemo<AdminSession | null>(() => {
    if (!userId) return null;
    const permissions = getPermissions(roles);
    return {
      userId,
      email,
      roles,
      role: permissions.role,
      permissions,
      loading: checking || rolesLoading,
      signOut,
    };
  }, [userId, email, roles, checking, rolesLoading, signOut]);

  if (checking || !value) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F7F9FC]">
        <p className="text-sm text-muted-foreground">Loading admin session…</p>
      </div>
    );
  }

  return <AdminSessionContext.Provider value={value}>{children}</AdminSessionContext.Provider>;
}

export function useAdminSession() {
  const ctx = useContext(AdminSessionContext);
  if (!ctx) throw new Error("useAdminSession must be used within AdminSessionProvider");
  return ctx;
}
