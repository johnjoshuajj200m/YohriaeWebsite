-- ============================================================================
--  YOHRIAE — lock down role management RLS
-- ============================================================================
--
-- The admin UI and Edge Function already require super_admin for user
-- provisioning, but older RLS policies allowed any admin to write role-bearing
-- rows directly through the Supabase REST API. Keep staff reads intact while
-- requiring super_admin at the database boundary for role grants/removals.

-- ---------- admins ----------
DROP POLICY IF EXISTS "admins_manage" ON public.admins;
DROP POLICY IF EXISTS "admins_insert_super" ON public.admins;
DROP POLICY IF EXISTS "admins_update_super" ON public.admins;
DROP POLICY IF EXISTS "admins_delete_super" ON public.admins;

CREATE POLICY "admins_insert_super" ON public.admins
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "admins_update_super" ON public.admins
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "admins_delete_super" ON public.admins
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'));

-- ---------- user_roles ----------
DROP POLICY IF EXISTS "user_roles_insert_admin" ON public.user_roles;
DROP POLICY IF EXISTS "user_roles_update_admin" ON public.user_roles;
DROP POLICY IF EXISTS "user_roles_delete_admin" ON public.user_roles;
DROP POLICY IF EXISTS "user_roles_insert_super" ON public.user_roles;
DROP POLICY IF EXISTS "user_roles_update_super" ON public.user_roles;
DROP POLICY IF EXISTS "user_roles_delete_super" ON public.user_roles;

CREATE POLICY "user_roles_insert_super" ON public.user_roles
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "user_roles_update_super" ON public.user_roles
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "user_roles_delete_super" ON public.user_roles
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'));

NOTIFY pgrst, 'reload schema';
