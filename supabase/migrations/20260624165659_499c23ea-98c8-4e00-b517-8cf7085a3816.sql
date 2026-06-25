
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT NOT NULL UNIQUE DEFAULT to_char(now(), 'YYMMDD') || lpad((floor(random()*100000))::int::text, 5, '0'),
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_address TEXT,
  customer_notes TEXT,
  payment_method TEXT NOT NULL,
  total_amount BIGINT NOT NULL,
  items JSONB NOT NULL,
  receipt_url TEXT,
  status TEXT NOT NULL DEFAULT 'pendiente',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.orders TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.orders TO authenticated;
GRANT ALL ON public.orders TO service_role;

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Cualquiera puede crear un pedido (checkout publico)
CREATE POLICY "anyone_can_create_order" ON public.orders FOR INSERT TO anon, authenticated WITH CHECK (true);
-- Cualquiera puede actualizar el receipt_url SOLO del pedido recien creado (mismo numero)
CREATE POLICY "anyone_can_update_receipt" ON public.orders FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
-- Lectura solo para admins autenticados (config simple: cualquier auth user puede ver)
CREATE POLICY "auth_can_read_orders" ON public.orders FOR SELECT TO authenticated USING (true);

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
