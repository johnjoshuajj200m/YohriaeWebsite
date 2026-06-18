import { supabase } from "@/integrations/supabase/client";
import type { AppRole } from "@/lib/admin/permissions";

const DASHBOARD_ROLES: AppRole[] = ["super_admin", "admin", "editor", "viewer"];

type AdminRole = (typeof DASHBOARD_ROLES)[number];

function isDashboardRole(role: string | null): role is AdminRole {
  return Boolean(role && DASHBOARD_ROLES.includes(role as AppRole));
}

async function findAdminRole(column: "user_id" | "id" | "email", value: string) {
  const { data, error } = await supabase
    .from("admins")
    .select("role")
    .eq(column, value)
    .in("role", DASHBOARD_ROLES)
    .maybeSingle();

  if (error || !data || !isDashboardRole(data.role)) return null;
  return data.role;
}

export async function getDashboardRoles(userId: string, email?: string | null) {
  try {
    const role =
      (await findAdminRole("user_id", userId)) ??
      (await findAdminRole("id", userId)) ??
      (email ? await findAdminRole("email", email) : null);

    return role ? [role] : [];
  } catch {
    return [];
  }
}

export async function userHasDashboardAccess(userId: string, email?: string | null) {
  const roles = await getDashboardRoles(userId, email);
  return roles.length > 0;
}
