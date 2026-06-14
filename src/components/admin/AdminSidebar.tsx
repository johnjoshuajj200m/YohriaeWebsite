import { Link, useLocation } from "@tanstack/react-router";
import {
  BarChart3,
  Calendar,
  FileText,
  Image as ImageIcon,
  LayoutDashboard,
  LogOut,
  Mail,
  Settings,
  Users,
  UserCog,
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { useAdminSession } from "@/hooks/useAdminSession";
import { roleLabel } from "@/lib/admin/permissions";

const NAV = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, perm: "canViewDashboard" as const },
  { to: "/admin/analytics", label: "Analytics", icon: BarChart3, perm: "canViewAnalytics" as const },
  { to: "/admin/blog", label: "Blog Posts", icon: FileText, perm: "canViewBlog" as const },
  { to: "/admin/events", label: "Events", icon: Calendar, perm: "canViewEvents" as const },
  { to: "/admin/gallery", label: "Gallery", icon: ImageIcon, perm: "canViewBlog" as const },
  { to: "/admin/messages", label: "Contact Messages", icon: Mail, perm: "canManageMessages" as const },
  { to: "/admin/newsletter", label: "Newsletter", icon: Users, perm: "canManageNewsletter" as const },
  { to: "/admin/users", label: "Admin Users", icon: UserCog, perm: "canManageUsers" as const },
  { to: "/admin/settings", label: "Settings", icon: Settings, perm: "canManageSettings" as const },
];

export function AdminSidebar() {
  const { pathname } = useLocation();
  const { permissions, signOut, role } = useAdminSession();

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-border bg-background">
      <div className="border-b border-border px-5 py-5">
        <Logo imageClassName="h-10 w-auto sm:h-11 md:h-12" />
        <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-[var(--brand-magenta)]">
          Admin CMS
        </p>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {NAV.filter((item) => permissions[item.perm]).map(({ to, label, icon: Icon }) => {
          const active = pathname === to || (to !== "/admin" && pathname.startsWith(to));
          return (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-surface hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
              {active && (
                <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[var(--brand-cyan)]" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border p-4">
        <p className="text-xs text-muted-foreground">Signed in as</p>
        <p className="mt-1 truncate text-sm font-semibold">{role ? roleLabel(role) : "Staff"}</p>
        <button
          type="button"
          onClick={() => signOut()}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-semibold text-foreground hover:bg-surface"
        >
          <LogOut className="h-4 w-4" /> Logout
        </button>
      </div>
    </aside>
  );
}
