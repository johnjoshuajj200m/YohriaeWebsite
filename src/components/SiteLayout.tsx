import { Outlet, useLocation } from "@tanstack/react-router";
import { Header } from "./Header";
import { Footer } from "./Footer";

/**
 * Wraps every route with the public site chrome unless the route is
 * an auth or admin route, which provide their own layout.
 */
export function SiteLayout() {
  const { pathname } = useLocation();
  const bare = pathname.startsWith("/auth") || pathname.startsWith("/admin");

  if (bare) return <Outlet />;

  return (
    <div className="flex min-h-screen flex-col">
      <a href="#main-content" className="skip-to-content">
        Skip to main content
      </a>
      <Header />
      <main id="main-content" tabIndex={-1} className="flex-1 focus:outline-none">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
