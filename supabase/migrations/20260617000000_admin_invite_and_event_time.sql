-- ============================================================================
--  YOHRIAE — event_time column + admin invite provisioning fields
--  Safe to run multiple times (idempotent).
-- ============================================================================

-- ---------- events: missing optional columns ----------
ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS event_time TEXT,
  ADD COLUMN IF NOT EXISTS organizer TEXT,
  ADD COLUMN IF NOT EXISTS registration_link TEXT,
  ADD COLUMN IF NOT EXISTS event_status TEXT DEFAULT 'upcoming';

UPDATE public.events
SET event_status = COALESCE(event_status, 'upcoming')
WHERE event_status IS NULL;

-- ---------- admin_invites: provisioning metadata ----------
ALTER TABLE public.admin_invites
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS email_sent BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS temp_password TEXT,
  ADD COLUMN IF NOT EXISTS login_url TEXT NOT NULL DEFAULT 'https://yohriae.com/auth';

-- Restrict temp_password reads to super_admin only (service role bypasses RLS).
DROP POLICY IF EXISTS "admin_invites_manage" ON public.admin_invites;
DROP POLICY IF EXISTS "admin_invites_select_super" ON public.admin_invites;
DROP POLICY IF EXISTS "admin_invites_insert_super" ON public.admin_invites;
DROP POLICY IF EXISTS "admin_invites_update_super" ON public.admin_invites;
DROP POLICY IF EXISTS "admin_invites_delete_super" ON public.admin_invites;

CREATE POLICY "admin_invites_select_super" ON public.admin_invites
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "admin_invites_insert_super" ON public.admin_invites
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "admin_invites_update_super" ON public.admin_invites
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "admin_invites_delete_super" ON public.admin_invites
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'));

NOTIFY pgrst, 'reload schema';
