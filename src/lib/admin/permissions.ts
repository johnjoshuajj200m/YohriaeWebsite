export type AppRole = "super_admin" | "admin" | "editor" | "viewer";

export type AdminPermissions = {
  role: AppRole | null;
  canViewDashboard: boolean;
  canViewAnalytics: boolean;
  canViewBlog: boolean;
  canManageBlog: boolean;
  canDeleteBlog: boolean;
  canViewEvents: boolean;
  canManageEvents: boolean;
  canDeleteEvents: boolean;
  canManageMessages: boolean;
  canDeleteMessages: boolean;
  canManageNewsletter: boolean;
  canDeleteNewsletter: boolean;
  canManageUsers: boolean;
  canManageSettings: boolean;
};

const ROLE_PRIORITY: AppRole[] = ["super_admin", "admin", "editor", "viewer"];

export function resolvePrimaryRole(roles: string[]): AppRole | null {
  for (const role of ROLE_PRIORITY) {
    if (roles.includes(role)) return role;
  }
  return null;
}

export function getPermissions(roles: string[]): AdminPermissions {
  const role = resolvePrimaryRole(roles);
  const isSuperAdmin = roles.includes("super_admin");
  const isAdmin = roles.includes("admin") || isSuperAdmin;
  const isEditor = roles.includes("editor") || isAdmin;
  const isViewer = roles.includes("viewer");

  const canAccess = isSuperAdmin || isAdmin || isEditor || isViewer;

  return {
    role,
    canViewDashboard: canAccess,
    canViewAnalytics: canAccess,
    canViewBlog: canAccess,
    canManageBlog: isEditor,
    canDeleteBlog: isAdmin,
    canViewEvents: canAccess,
    canManageEvents: isEditor,
    canDeleteEvents: isAdmin,
    canManageMessages: isAdmin || roles.includes("editor"),
    canDeleteMessages: isAdmin,
    canManageNewsletter: isAdmin,
    canDeleteNewsletter: isAdmin,
    canManageUsers: isAdmin,
    canManageSettings: isAdmin,
  };
}

export function roleLabel(role: AppRole | string) {
  switch (role) {
    case "super_admin":
      return "Super Admin";
    case "admin":
      return "Admin";
    case "editor":
      return "Editor";
    case "viewer":
      return "Viewer";
    default:
      return role;
  }
}

export const ASSIGNABLE_ROLES: AppRole[] = ["super_admin", "admin", "editor", "viewer"];
