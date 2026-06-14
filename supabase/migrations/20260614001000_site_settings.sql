CREATE TABLE IF NOT EXISTS public.site_settings (
  id TEXT PRIMARY KEY DEFAULT 'main',
  name TEXT NOT NULL DEFAULT 'YOHRIAE',
  long_name TEXT NOT NULL DEFAULT 'Youth Health and Right Initiative for Advocacy and Empowerment',
  executive_director TEXT NOT NULL DEFAULT 'Saeed Abubakar Aliyu',
  email TEXT NOT NULL DEFAULT 'yohriae2019@gmail.com',
  secondary_email TEXT NOT NULL DEFAULT 'yohriaenigeria@gmail.com',
  phone TEXT NOT NULL DEFAULT '+2348021445256',
  whatsapp TEXT NOT NULL DEFAULT '+2347038120170',
  address TEXT NOT NULL DEFAULT 'Northern Nigeria',
  location TEXT NOT NULL DEFAULT 'Northern Nigeria',
  footer_text TEXT NOT NULL DEFAULT 'YOHRIAE works with young people, community leaders, health actors, and partners to build safer, healthier futures.',
  instagram TEXT NOT NULL DEFAULT 'https://www.instagram.com/yohriae',
  twitter TEXT NOT NULL DEFAULT 'https://x.com/yohriae',
  facebook TEXT NOT NULL DEFAULT 'https://www.facebook.com/search/top?q=Youth%20Health%20and%20Right%20Initiative%20for%20Advocacy%20and%20Empowerment',
  linkedin TEXT NOT NULL DEFAULT 'https://www.linkedin.com/search/results/all/?keywords=YOHRIAE%20Nigeria',
  tiktok TEXT NOT NULL DEFAULT 'https://www.tiktok.com/@yohriae',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO public.site_settings (id)
VALUES ('main')
ON CONFLICT (id) DO NOTHING;

GRANT SELECT ON public.site_settings TO anon, authenticated;
GRANT UPDATE, INSERT ON public.site_settings TO authenticated;
GRANT ALL ON public.site_settings TO service_role;

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "site_settings_public_read" ON public.site_settings
  FOR SELECT USING (true);

CREATE POLICY "site_settings_admin_insert" ON public.site_settings
  FOR INSERT TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'super_admin')
    OR EXISTS (
      SELECT 1 FROM public.admins
      WHERE (user_id = auth.uid() OR id = auth.uid())
      AND role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "site_settings_admin_update" ON public.site_settings
  FOR UPDATE TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'super_admin')
    OR EXISTS (
      SELECT 1 FROM public.admins
      WHERE (user_id = auth.uid() OR id = auth.uid())
      AND role IN ('admin', 'super_admin')
    )
  )
  WITH CHECK (
    public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'super_admin')
    OR EXISTS (
      SELECT 1 FROM public.admins
      WHERE (user_id = auth.uid() OR id = auth.uid())
      AND role IN ('admin', 'super_admin')
    )
  );
