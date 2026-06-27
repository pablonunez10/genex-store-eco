CREATE TABLE public.product_images (
  sku text PRIMARY KEY,
  image_url text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.product_images TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.product_images TO authenticated;
GRANT ALL ON public.product_images TO service_role;

ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read_product_images" ON public.product_images
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "auth_insert_product_images" ON public.product_images
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "auth_update_product_images" ON public.product_images
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "auth_delete_product_images" ON public.product_images
  FOR DELETE TO authenticated USING (true);

CREATE TRIGGER trg_product_images_updated_at
  BEFORE UPDATE ON public.product_images
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Storage policies for the product-images bucket (public read, authenticated write)
CREATE POLICY "public_read_product_images_bucket" ON storage.objects
  FOR SELECT TO anon, authenticated USING (bucket_id = 'product-images');

CREATE POLICY "auth_upload_product_images_bucket" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'product-images');

CREATE POLICY "auth_update_product_images_bucket" ON storage.objects
  FOR UPDATE TO authenticated USING (bucket_id = 'product-images') WITH CHECK (bucket_id = 'product-images');

CREATE POLICY "auth_delete_product_images_bucket" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'product-images');