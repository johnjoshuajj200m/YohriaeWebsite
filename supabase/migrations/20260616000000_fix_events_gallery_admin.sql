-- ============================================================================
--  YOHRIAE — Fix events column, gallery RLS, admins + admin_invites
--  Safe to run multiple times (idempotent).
--
--  Fixes:
--   1. events.event_status missing (DB may have "status" instead)
--   2. gallery_images RLS failing for users in public.admins
--   3. public.admin_invites / public.admins missing
--   4. has_role() only checked user_roles, not public.admins
-- ============================================================================

-- ---------- Enums ----------
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin', 'editor', 'viewer', 'super_admin');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'viewer';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'super_admin';

-- ---------- events: status → event_status ----------
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'events' AND column_name = 'status'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'events' AND column_name = 'event_status'
  ) THEN
    ALTER TABLE public.events RENAME COLUMN status TO event_status;
  END IF;
END $$;

ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS event_status TEXT,
  ADD COLUMN IF NOT EXISTS event_time TEXT,
  ADD COLUMN IF NOT EXISTS organizer TEXT,
  ADD COLUMN IF NOT EXISTS registration_link TEXT,
  ADD COLUMN IF NOT EXISTS image_url TEXT;

UPDATE public.events
SET event_status = COALESCE(event_status, 'upcoming')
WHERE event_status IS NULL;

ALTER TABLE public.events
  ALTER COLUMN event_status SET DEFAULT 'upcoming';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'events_event_status_check'
  ) THEN
    ALTER TABLE public.events
      ADD CONSTRAINT events_event_status_check
      CHECK (event_status IN ('upcoming', 'ongoing', 'past'));
  END IF;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ---------- admins (auth login source of truth) ----------
CREATE TABLE IF NOT EXISTS public.admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  role public.app_role NOT NULL DEFAULT 'admin',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT admins_user_id_key UNIQUE (user_id)
);

ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.admins TO authenticated;
GRANT ALL ON public.admins TO service_role;

-- ---------- admin_invites ----------
CREATE TABLE IF NOT EXISTS public.admin_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  role public.app_role NOT NULL DEFAULT 'editor',
  invited_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_invites ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.admin_invites TO authenticated;
GRANT ALL ON public.admin_invites TO service_role;

-- ---------- has_role: check user_roles AND public.admins ----------
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
  OR EXISTS (
    SELECT 1 FROM public.admins a
    WHERE (a.user_id = _user_id OR a.id = _user_id)
      AND a.role = _role
  )
$$;

REVOKE EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) TO authenticated;

-- Convenience: admin or super_admin (used in some policies)
CREATE OR REPLACE FUNCTION public.is_dashboard_admin(_user_id UUID)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT
    public.has_role(_user_id, 'admin')
    OR public.has_role(_user_id, 'super_admin')
$$;

REVOKE EXECUTE ON FUNCTION public.is_dashboard_admin(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_dashboard_admin(UUID) TO authenticated;

-- ---------- Signup: invite → user_roles + admins ----------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  invite_role public.app_role;
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.email
  )
  ON CONFLICT (id) DO UPDATE SET
    display_name = COALESCE(EXCLUDED.display_name, public.profiles.display_name),
    avatar_url = COALESCE(EXCLUDED.avatar_url, public.profiles.avatar_url),
    email = COALESCE(EXCLUDED.email, public.profiles.email);

  SELECT role INTO invite_role
  FROM public.admin_invites
  WHERE lower(email) = lower(NEW.email) AND accepted_at IS NULL
  LIMIT 1;

  IF invite_role IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, invite_role)
    ON CONFLICT (user_id, role) DO NOTHING;

    -- Dashboard login requires a row in public.admins for admin/super_admin roles.
    IF invite_role IN ('admin', 'super_admin') THEN
      INSERT INTO public.admins (user_id, email, role)
      VALUES (NEW.id, NEW.email, invite_role)
      ON CONFLICT (user_id) DO UPDATE
        SET email = EXCLUDED.email, role = EXCLUDED.role;
    END IF;

    UPDATE public.admin_invites
    SET accepted_at = now()
    WHERE lower(email) = lower(NEW.email) AND accepted_at IS NULL;
  END IF;

  RETURN NEW;
END $$;

-- Sync any existing admins → user_roles (one-time safety net)
INSERT INTO public.user_roles (user_id, role)
SELECT a.user_id, a.role
FROM public.admins a
WHERE a.role IN ('admin', 'super_admin', 'editor', 'viewer')
ON CONFLICT (user_id, role) DO NOTHING;

-- ============================================================================
--  RLS — admins & admin_invites
-- ============================================================================

DROP POLICY IF EXISTS "admins_select_staff" ON public.admins;
CREATE POLICY "admins_select_staff" ON public.admins
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR public.is_dashboard_admin(auth.uid())
  );

DROP POLICY IF EXISTS "admins_manage" ON public.admins;
CREATE POLICY "admins_manage" ON public.admins
  FOR ALL TO authenticated
  USING (public.is_dashboard_admin(auth.uid()))
  WITH CHECK (public.is_dashboard_admin(auth.uid()));

DROP POLICY IF EXISTS "admin_invites_manage" ON public.admin_invites;
CREATE POLICY "admin_invites_manage" ON public.admin_invites
  FOR ALL TO authenticated
  USING (public.is_dashboard_admin(auth.uid()))
  WITH CHECK (public.is_dashboard_admin(auth.uid()));

-- ============================================================================
--  RLS — gallery_images (drop legacy policies, re-create)
-- ============================================================================

DROP POLICY IF EXISTS "gallery_admin_all" ON public.gallery_images;
DROP POLICY IF EXISTS "gallery_public_read" ON public.gallery_images;
DROP POLICY IF EXISTS "gallery_staff_write" ON public.gallery_images;
DROP POLICY IF EXISTS "gallery_staff_update" ON public.gallery_images;
DROP POLICY IF EXISTS "gallery_admin_delete" ON public.gallery_images;

CREATE POLICY "gallery_public_read" ON public.gallery_images
  FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "gallery_staff_write" ON public.gallery_images
  FOR INSERT TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'super_admin')
    OR public.has_role(auth.uid(), 'editor')
  );

CREATE POLICY "gallery_staff_update" ON public.gallery_images
  FOR UPDATE TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'super_admin')
    OR public.has_role(auth.uid(), 'editor')
  );

CREATE POLICY "gallery_admin_delete" ON public.gallery_images
  FOR DELETE TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'super_admin')
  );

GRANT SELECT ON public.gallery_images TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.gallery_images TO authenticated;

-- ============================================================================
--  Storage — gallery-images bucket + policies
-- ============================================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('gallery-images', 'gallery-images', true)
ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public;

INSERT INTO storage.buckets (id, name, public)
VALUES ('event-images', 'event-images', true)
ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public;

INSERT INTO storage.buckets (id, name, public)
VALUES ('blog-images', 'blog-images', true)
ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public;

DROP POLICY IF EXISTS "yohriae_storage_public_read" ON storage.objects;
CREATE POLICY "yohriae_storage_public_read" ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id IN ('blog-images', 'event-images', 'gallery-images'));

DROP POLICY IF EXISTS "yohriae_storage_staff_insert" ON storage.objects;
CREATE POLICY "yohriae_storage_staff_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id IN ('blog-images', 'event-images', 'gallery-images')
    AND (
      public.has_role(auth.uid(), 'admin')
      OR public.has_role(auth.uid(), 'super_admin')
      OR public.has_role(auth.uid(), 'editor')
    )
  );

DROP POLICY IF EXISTS "yohriae_storage_staff_update" ON storage.objects;
CREATE POLICY "yohriae_storage_staff_update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id IN ('blog-images', 'event-images', 'gallery-images')
    AND (
      public.has_role(auth.uid(), 'admin')
      OR public.has_role(auth.uid(), 'super_admin')
      OR public.has_role(auth.uid(), 'editor')
    )
  );

DROP POLICY IF EXISTS "yohriae_storage_admin_delete" ON storage.objects;
CREATE POLICY "yohriae_storage_admin_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id IN ('blog-images', 'event-images', 'gallery-images')
    AND (
      public.has_role(auth.uid(), 'admin')
      OR public.has_role(auth.uid(), 'super_admin')
    )
  );

NOTIFY pgrst, 'reload schema';
