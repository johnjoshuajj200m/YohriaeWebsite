import { Link, Outlet, useLocation } from "@tanstack/react-router";
import { Home, Shield } from "lucide-react";
import { Toaster } from "@/components/ui/sonner";
import { AdminSidebar } from "./AdminSidebar";
import { AdminSessionProvider, useAdminSession } from "@/hooks/useAdminSession";
import { roleLabel } from "@/lib/admin/permissions";

const MOBILE_LINKS = [
  { to: "/admin", label: "Dashboard" },
  { to: "/admin/analytics", label: "Analytics" },
  { to: "/admin/blog", label: "Blog" },
  { to: "/admin/events", label: "Events" },
  { to: "/admin/gallery", label: "Gallery" },
  { to: "/admin/messages", label: "Messages" },
  { to: "/admin/newsletter", label: "Newsletter" },
  { to: "/admin/users", label: "Users" },
];

function AdminShell() {
  const { permissions, loading, signOut, userId, role } = useAdminSession();
  const { pathname } = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F7F9FC]">
        <p className="text-sm text-muted-foreground">Checking access…</p>
      </div>
    );
  }

  if (!permissions.canViewDashboard) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F7F9FC] px-4">
        <div className="max-w-md rounded-2xl border border-destructive/20 bg-background p-8 text-center shadow-soft">
          <Shield className="mx-auto h-10 w-10 text-destructive" />
          <h1 className="mt-4 text-2xl font-bold">Access denied</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Your account is not authorized for the YOHRIAE admin dashboard. Contact an existing
            administrator if you believe this is an error.
          </p>
          <p className="mt-4 break-all rounded-md bg-surface px-3 py-2 text-xs text-muted-foreground">
            User ID: {userId}
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link to="/" className="btn-outline inline-flex items-center gap-2">
              <Home className="h-4 w-4" /> Back to site
            </Link>
            <button type="button" onClick={() => signOut()} className="btn-primary">
              Sign out
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#F7F9FC]">
      <div className="hidden lg:flex">
        <AdminSidebar />
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="border-b border-border bg-background lg:hidden">
          <div className="flex items-center justify-between px-4 py-3">
            <div>
              <p className="text-sm font-bold text-primary">YOHRIAE Admin</p>
              <p className="text-xs text-muted-foreground">{role ? roleLabel(role) : "Staff"}</p>
            </div>
            <Link to="/" className="text-xs font-semibold text-muted-foreground hover:text-primary">
              View site
            </Link>
          </div>
          <nav className="flex gap-2 overflow-x-auto px-4 pb-3">
            {MOBILE_LINKS.map((item) => {
              const active =
                pathname === item.to ||
                (item.to !== "/admin" && pathname.startsWith(item.to));
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                    active
                      ? "bg-primary/10 text-primary"
                      : "bg-surface text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {active && (
                    <span className="h-1.5 w-1.5 rounded-full bg-[var(--brand-magenta)]" />
                  )}
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </header>
        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
      <Toaster position="top-right" richColors />
    </div>
  );
}

export function AdminLayout() {
  return (
    <AdminSessionProvider>
      <AdminShell />
    </AdminSessionProvider>
  );
}
