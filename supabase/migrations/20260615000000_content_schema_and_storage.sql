-- ============================================================================
--  YOHRIAE — Content schema + storage hardening
--  Fully idempotent: safe to run multiple times. Creates anything missing on
--  a fresh database, leaves existing rows/policies alone.
--
--  Fixes:
--   - "Could not find the table public.blog_posts in the schema cache"
--     by ensuring blog_posts / events / gallery_images / contact_messages /
--     newsletter_subscribers exist with the columns the app already expects.
--   - Adds Supabase Storage buckets (blog-images / event-images /
--     gallery-images) with public read + authenticated staff write.
--
--  Columns:
--   - blog_posts.featured_image_url  (was cover_url in earlier migrations)
--   - events.image_url               (was cover_url in earlier migrations)
--   - gallery_images.image_url
--  The rename DO-blocks below migrate any existing data from cover_url.
-- ============================================================================

-- ---------- Defensive column renames (existing installations) ----------
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'blog_posts' AND column_name = 'cover_url'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'blog_posts' AND column_name = 'featured_image_url'
  ) THEN
    ALTER TABLE public.blog_posts RENAME COLUMN cover_url TO featured_image_url;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'events' AND column_name = 'cover_url'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'events' AND column_name = 'image_url'
  ) THEN
    ALTER TABLE public.events RENAME COLUMN cover_url TO image_url;
  END IF;
END $$;

-- ---------- Enums & helpers ----------
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin', 'editor', 'viewer', 'super_admin');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE OR REPLACE FUNCTION public.tg_set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END $$;

-- user_roles must exist before has_role() can reference it.
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;
REVOKE EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) TO authenticated;

-- ---------- profiles (needed for admin user management) ----------
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  email TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- ============================================================================
--  Content tables
-- ============================================================================

-- ---------- blog_posts ----------
CREATE TABLE IF NOT EXISTS public.blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  category TEXT,
  author TEXT,
  featured_image_url TEXT,
  published BOOLEAN NOT NULL DEFAULT false,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Ensure column exists on tables created by earlier migrations.
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS featured_image_url TEXT;

-- Guarantee unique slug even if the table existed before without it.
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'blog_posts_slug_key'
  ) THEN
    ALTER TABLE public.blog_posts ADD CONSTRAINT blog_posts_slug_key UNIQUE (slug);
  END IF;
EXCEPTION WHEN duplicate_table THEN NULL; END $$;

ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
DROP TRIGGER IF EXISTS blog_posts_set_updated_at ON public.blog_posts;
CREATE TRIGGER blog_posts_set_updated_at
  BEFORE UPDATE ON public.blog_posts
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- ---------- events ----------
CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ,
  event_time TEXT,
  location TEXT,
  organizer TEXT,
  registration_link TEXT,
  event_status TEXT NOT NULL DEFAULT 'upcoming'
    CHECK (event_status IN ('upcoming','ongoing','past')),
  published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Ensure column exists on tables created by earlier migrations.
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS image_url TEXT;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'events_slug_key'
  ) THEN
    ALTER TABLE public.events ADD CONSTRAINT events_slug_key UNIQUE (slug);
  END IF;
EXCEPTION WHEN duplicate_table THEN NULL; END $$;

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
DROP TRIGGER IF EXISTS events_set_updated_at ON public.events;
CREATE TRIGGER events_set_updated_at
  BEFORE UPDATE ON public.events
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- ---------- gallery_images ----------
CREATE TABLE IF NOT EXISTS public.gallery_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url TEXT NOT NULL,
  caption TEXT,
  category TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.gallery_images ENABLE ROW LEVEL SECURITY;

-- ---------- contact_messages ----------
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT,
  message TEXT NOT NULL,
  handled BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'new'
    CHECK (status IN ('new','read','replied')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- ---------- newsletter_subscribers ----------
CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- ============================================================================
--  RLS policies (idempotent: drop & re-create)
-- ============================================================================

-- ---- blog_posts ----
DROP POLICY IF EXISTS "blog_public_read" ON public.blog_posts;
CREATE POLICY "blog_public_read" ON public.blog_posts
  FOR SELECT TO anon, authenticated
  USING (published = true);

DROP POLICY IF EXISTS "blog_staff_read" ON public.blog_posts;
CREATE POLICY "blog_staff_read" ON public.blog_posts
  FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(),'admin')
    OR public.has_role(auth.uid(),'super_admin')
    OR public.has_role(auth.uid(),'editor')
    OR public.has_role(auth.uid(),'viewer')
  );

DROP POLICY IF EXISTS "blog_staff_write" ON public.blog_posts;
CREATE POLICY "blog_staff_write" ON public.blog_posts
  FOR INSERT TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(),'admin')
    OR public.has_role(auth.uid(),'super_admin')
    OR public.has_role(auth.uid(),'editor')
  );

DROP POLICY IF EXISTS "blog_staff_update" ON public.blog_posts;
CREATE POLICY "blog_staff_update" ON public.blog_posts
  FOR UPDATE TO authenticated
  USING (
    public.has_role(auth.uid(),'admin')
    OR public.has_role(auth.uid(),'super_admin')
    OR public.has_role(auth.uid(),'editor')
  );

DROP POLICY IF EXISTS "blog_admin_delete" ON public.blog_posts;
CREATE POLICY "blog_admin_delete" ON public.blog_posts
  FOR DELETE TO authenticated
  USING (
    public.has_role(auth.uid(),'admin')
    OR public.has_role(auth.uid(),'super_admin')
  );

-- ---- events ----
DROP POLICY IF EXISTS "events_public_read" ON public.events;
CREATE POLICY "events_public_read" ON public.events
  FOR SELECT TO anon, authenticated
  USING (published = true);

DROP POLICY IF EXISTS "events_staff_read" ON public.events;
CREATE POLICY "events_staff_read" ON public.events
  FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(),'admin')
    OR public.has_role(auth.uid(),'super_admin')
    OR public.has_role(auth.uid(),'editor')
    OR public.has_role(auth.uid(),'viewer')
  );

DROP POLICY IF EXISTS "events_staff_write" ON public.events;
CREATE POLICY "events_staff_write" ON public.events
  FOR INSERT TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(),'admin')
    OR public.has_role(auth.uid(),'super_admin')
    OR public.has_role(auth.uid(),'editor')
  );

DROP POLICY IF EXISTS "events_staff_update" ON public.events;
CREATE POLICY "events_staff_update" ON public.events
  FOR UPDATE TO authenticated
  USING (
    public.has_role(auth.uid(),'admin')
    OR public.has_role(auth.uid(),'super_admin')
    OR public.has_role(auth.uid(),'editor')
  );

DROP POLICY IF EXISTS "events_admin_delete" ON public.events;
CREATE POLICY "events_admin_delete" ON public.events
  FOR DELETE TO authenticated
  USING (
    public.has_role(auth.uid(),'admin')
    OR public.has_role(auth.uid(),'super_admin')
  );

-- ---- gallery_images ----
DROP POLICY IF EXISTS "gallery_public_read" ON public.gallery_images;
CREATE POLICY "gallery_public_read" ON public.gallery_images
  FOR SELECT TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "gallery_staff_write" ON public.gallery_images;
CREATE POLICY "gallery_staff_write" ON public.gallery_images
  FOR INSERT TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(),'admin')
    OR public.has_role(auth.uid(),'super_admin')
    OR public.has_role(auth.uid(),'editor')
  );

DROP POLICY IF EXISTS "gallery_staff_update" ON public.gallery_images;
CREATE POLICY "gallery_staff_update" ON public.gallery_images
  FOR UPDATE TO authenticated
  USING (
    public.has_role(auth.uid(),'admin')
    OR public.has_role(auth.uid(),'super_admin')
    OR public.has_role(auth.uid(),'editor')
  );

DROP POLICY IF EXISTS "gallery_admin_delete" ON public.gallery_images;
CREATE POLICY "gallery_admin_delete" ON public.gallery_images
  FOR DELETE TO authenticated
  USING (
    public.has_role(auth.uid(),'admin')
    OR public.has_role(auth.uid(),'super_admin')
  );

-- ---- contact_messages ----
DROP POLICY IF EXISTS "contact_public_insert" ON public.contact_messages;
CREATE POLICY "contact_public_insert" ON public.contact_messages
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    length(trim(name)) BETWEEN 1 AND 200
    AND length(trim(email)) BETWEEN 3 AND 320
    AND email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'
    AND length(trim(message)) BETWEEN 1 AND 5000
  );

DROP POLICY IF EXISTS "contact_select_staff" ON public.contact_messages;
CREATE POLICY "contact_select_staff" ON public.contact_messages
  FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(),'admin')
    OR public.has_role(auth.uid(),'super_admin')
    OR public.has_role(auth.uid(),'editor')
  );

DROP POLICY IF EXISTS "contact_update_staff" ON public.contact_messages;
CREATE POLICY "contact_update_staff" ON public.contact_messages
  FOR UPDATE TO authenticated
  USING (
    public.has_role(auth.uid(),'admin')
    OR public.has_role(auth.uid(),'super_admin')
    OR public.has_role(auth.uid(),'editor')
  );

DROP POLICY IF EXISTS "contact_delete_admin" ON public.contact_messages;
CREATE POLICY "contact_delete_admin" ON public.contact_messages
  FOR DELETE TO authenticated
  USING (
    public.has_role(auth.uid(),'admin')
    OR public.has_role(auth.uid(),'super_admin')
  );

-- ---- newsletter_subscribers ----
DROP POLICY IF EXISTS "newsletter_insert_public" ON public.newsletter_subscribers;
CREATE POLICY "newsletter_insert_public" ON public.newsletter_subscribers
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    length(trim(email)) BETWEEN 3 AND 320
    AND email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'
  );

DROP POLICY IF EXISTS "newsletter_select_staff" ON public.newsletter_subscribers;
CREATE POLICY "newsletter_select_staff" ON public.newsletter_subscribers
  FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(),'admin')
    OR public.has_role(auth.uid(),'super_admin')
    OR public.has_role(auth.uid(),'editor')
    OR public.has_role(auth.uid(),'viewer')
  );

DROP POLICY IF EXISTS "newsletter_delete_admin" ON public.newsletter_subscribers;
CREATE POLICY "newsletter_delete_admin" ON public.newsletter_subscribers
  FOR DELETE TO authenticated
  USING (
    public.has_role(auth.uid(),'admin')
    OR public.has_role(auth.uid(),'super_admin')
  );

-- Helpful grants for the REST API.
GRANT SELECT ON public.blog_posts, public.events, public.gallery_images TO anon, authenticated;
GRANT INSERT ON public.contact_messages, public.newsletter_subscribers TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON
  public.blog_posts,
  public.events,
  public.gallery_images,
  public.contact_messages,
  public.newsletter_subscribers
  TO authenticated;

-- ============================================================================
--  Storage buckets (blog-images / event-images / gallery-images)
-- ============================================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('blog-images', 'blog-images', true)
ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public;

INSERT INTO storage.buckets (id, name, public)
VALUES ('event-images', 'event-images', true)
ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public;

INSERT INTO storage.buckets (id, name, public)
VALUES ('gallery-images', 'gallery-images', true)
ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public;

-- Storage object policies.
DROP POLICY IF EXISTS "yohriae_storage_public_read" ON storage.objects;
CREATE POLICY "yohriae_storage_public_read" ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id IN ('blog-images','event-images','gallery-images'));

DROP POLICY IF EXISTS "yohriae_storage_staff_insert" ON storage.objects;
CREATE POLICY "yohriae_storage_staff_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id IN ('blog-images','event-images','gallery-images')
    AND (
      public.has_role(auth.uid(),'admin')
      OR public.has_role(auth.uid(),'super_admin')
      OR public.has_role(auth.uid(),'editor')
    )
  );

DROP POLICY IF EXISTS "yohriae_storage_staff_update" ON storage.objects;
CREATE POLICY "yohriae_storage_staff_update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id IN ('blog-images','event-images','gallery-images')
    AND (
      public.has_role(auth.uid(),'admin')
      OR public.has_role(auth.uid(),'super_admin')
      OR public.has_role(auth.uid(),'editor')
    )
  );

DROP POLICY IF EXISTS "yohriae_storage_admin_delete" ON storage.objects;
CREATE POLICY "yohriae_storage_admin_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id IN ('blog-images','event-images','gallery-images')
    AND (
      public.has_role(auth.uid(),'admin')
      OR public.has_role(auth.uid(),'super_admin')
    )
  );

-- ============================================================================
--  Reload PostgREST schema cache. Without this, Supabase clients keep
--  returning "Could not find the table public.blog_posts in the schema cache"
--  until the next restart.
-- ============================================================================
NOTIFY pgrst, 'reload schema';
