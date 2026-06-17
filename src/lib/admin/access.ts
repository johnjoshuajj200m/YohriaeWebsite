import { supabase } from "@/integrations/supabase/client";

const DASHBOARD_ROLES = ["super_admin", "admin", "editor", "viewer"] as const;

type AdminRole = (typeof DASHBOARD_ROLES)[number];

function isDashboardRole(role: string | null): role is AdminRole {
  return DASHBOARD_ROLES.some((dashboardRole) => dashboardRole === role);
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

async function findUserRoles(userId: string) {
  const { data, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .in("role", DASHBOARD_ROLES);

  if (error || !data) return [];
  return data.map(({ role }) => role).filter(isDashboardRole);
}

export async function getDashboardRoles(userId: string, email?: string | null) {
  try {
    const role =
      (await findAdminRole("user_id", userId)) ??
      (await findAdminRole("id", userId)) ??
      (email ? await findAdminRole("email", email) : null);

    const roles = new Set<AdminRole>(role ? [role] : []);
    for (const userRole of await findUserRoles(userId)) {
      roles.add(userRole);
    }

    return [...roles];
  } catch {
    return [];
  }
}

export async function userHasDashboardAccess(userId: string, email?: string | null) {
  const roles = await getDashboardRoles(userId, email);
  return roles.length > 0;
}
