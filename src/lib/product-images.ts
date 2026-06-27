import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// Private bucket → we sign URLs at upload time and store them.
// product_images.image_url is a long-lived signed URL ready to render.
export function useProductImages(skus: string[]) {
  const sorted = [...skus].sort();
  return useQuery({
    queryKey: ["product-images", sorted],
    enabled: sorted.length > 0,
    staleTime: 5 * 60_000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("product_images")
        .select("sku,image_url")
        .in("sku", sorted);
      if (error) throw error;
      const map: Record<string, string> = {};
      (data ?? []).forEach((r) => {
        map[r.sku] = r.image_url;
      });
      return map;
    },
  });
}

export async function fetchProductImage(sku: string): Promise<string | null> {
  const { data } = await supabase
    .from("product_images")
    .select("image_url")
    .eq("sku", sku)
    .maybeSingle();
  return data?.image_url ?? null;
}
