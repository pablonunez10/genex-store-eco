
DROP POLICY IF EXISTS "anyone_can_update_receipt" ON public.orders;
REVOKE UPDATE ON public.orders FROM anon;
REVOKE UPDATE ON public.orders FROM authenticated;
REVOKE SELECT ON public.orders FROM anon;
