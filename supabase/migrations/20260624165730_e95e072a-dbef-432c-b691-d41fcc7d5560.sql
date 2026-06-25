
CREATE POLICY "anyone_can_upload_receipt"
ON storage.objects FOR INSERT TO anon, authenticated
WITH CHECK (bucket_id = 'comprobantes');

CREATE POLICY "auth_can_read_receipts"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'comprobantes');
