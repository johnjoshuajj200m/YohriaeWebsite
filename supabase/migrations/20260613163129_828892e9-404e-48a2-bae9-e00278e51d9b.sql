
-- Lock down SECURITY DEFINER helper functions
REVOKE EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.tg_set_updated_at() FROM PUBLIC, anon, authenticated;
-- has_role is still callable by authenticated for RLS policies via SECURITY DEFINER context; keep GRANT for authenticated
GRANT EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) TO authenticated;
