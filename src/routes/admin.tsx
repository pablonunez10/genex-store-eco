import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { inventario, type InventarioProduct } from "@/integrations/inventario/client";
import { useProductImages } from "@/lib/product-images";
import { ArrowLeft, Upload, CheckCircle2, Loader2, LogOut, Search } from "lucide-react";

const PAGE_SIZE = 20;
// Signed URL TTL ~ 1 year (private bucket). Refresh on each upload.
const SIGNED_URL_TTL = 60 * 60 * 24 * 365;

export const Route = createFileRoute("/admin")({
  component: AdminPage,
});

function AdminPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [userId, setUserId] = useState<string | null | undefined>(undefined);
  const [isAdmin, setIsAdmin] = useState<boolean | undefined>(undefined);
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");

  useEffect(() => {
    let mounted = true;
    supabase.auth.getUser().then(async ({ data }) => {
      if (!mounted) return;
      const uid = data.user?.id ?? null;
      setUserId(uid);
      if (!uid) {
        setIsAdmin(false);
        return;
      }
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", uid)
        .eq("role", "admin")
        .maybeSingle();
      if (mounted) setIsAdmin(!!roleData);
    });
    return () => {
      mounted = false;
    };
  }, []);

  const productsQuery = useQuery({
    queryKey: ["admin-products", page, q],
    enabled: !!isAdmin,
    placeholderData: keepPreviousData,
    queryFn: async () => {
      const from = (page - 1) * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;
      let query = inventario
        .from("products")
        .select("id,name,sku,description,current_stock,min_stock,purchase_price,sale_price,is_active,category_id,created_at,updated_at", { count: "exact" })
        .eq("is_active", true)
        .order("name", { ascending: true })
        .range(from, to);
      if (q.trim()) query = query.or(`name.ilike.%${q.trim()}%,sku.ilike.%${q.trim()}%`);
      const { data, error, count } = await query;
      if (error) throw error;
      return { items: (data ?? []) as InventarioProduct[], total: count ?? 0 };
    },
  });

  const items = productsQuery.data?.items ?? [];
  const totalPages = Math.max(1, Math.ceil((productsQuery.data?.total ?? 0) / PAGE_SIZE));
  const { data: images } = useProductImages(items.map((p) => p.sku).filter(Boolean));

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/auth" });
  };

  if (userId === undefined || isAdmin === undefined) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
        <Loader2 className="mr-2 size-4 animate-spin" /> Verificando sesión...
      </div>
    );
  }

  if (!userId) {
    return (
      <CenterCard
        title="Necesitás iniciar sesión"
        desc="El panel de admin requiere autenticación."
        action={<Link to="/auth" className="rounded-full bg-[var(--color-primary)] px-5 py-2.5 text-sm font-semibold text-[var(--color-primary-foreground)]">Ir a iniciar sesión</Link>}
      />
    );
  }

  if (!isAdmin) {
    return (
      <CenterCard
        title="Tu cuenta aún no es admin"
        desc={`Tu user_id es: ${userId}. Pediles a soporte que ejecuten: INSERT INTO user_roles (user_id, role) VALUES ('${userId}', 'admin');`}
        action={
          <button onClick={signOut} className="rounded-full border border-border px-5 py-2.5 text-sm font-semibold">
            Cerrar sesión
          </button>
        }
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
          <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="size-4" /> Tienda
          </Link>
          <div className="font-display font-bold">Panel de imágenes</div>
          <button onClick={signOut} className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
            <LogOut className="size-3.5" /> Salir
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="mb-6 flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setPage(1);
              }}
              placeholder="Buscar por nombre o SKU..."
              className="h-11 w-full rounded-full border border-border bg-[var(--color-surface)] pl-10 pr-4 text-sm outline-none focus:border-[var(--color-ring)]"
            />
          </div>
        </div>

        {productsQuery.isLoading ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-32 animate-pulse rounded-2xl bg-[var(--color-surface-strong)]" />
            ))}
          </div>
        ) : (
          <>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((p) => (
                <ProductImageRow
                  key={p.id}
                  product={p}
                  currentUrl={images?.[p.sku]}
                  onSaved={() => {
                    qc.invalidateQueries({ queryKey: ["product-images"] });
                  }}
                />
              ))}
            </div>

            <div className="mt-6 flex items-center justify-center gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="rounded-full border border-border px-4 py-2 text-xs font-semibold disabled:opacity-40"
              >
                Anterior
              </button>
              <span className="text-xs text-muted-foreground">
                Página {page} de {totalPages}
              </span>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="rounded-full border border-border px-4 py-2 text-xs font-semibold disabled:opacity-40"
              >
                Siguiente
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function ProductImageRow({
  product,
  currentUrl,
  onSaved,
}: {
  product: InventarioProduct;
  currentUrl?: string;
  onSaved: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedTick, setSavedTick] = useState(false);

  const onFile = async (file: File) => {
    setBusy(true);
    setError(null);
    setSavedTick(false);
    try {
      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `${product.sku}-${Date.now()}.${ext}`;

      const { error: upErr } = await supabase.storage
        .from("product-images")
        .upload(path, file, { upsert: true, contentType: file.type });
      if (upErr) throw upErr;

      const { data: signed, error: signErr } = await supabase.storage
        .from("product-images")
        .createSignedUrl(path, SIGNED_URL_TTL);
      if (signErr) throw signErr;

      const { error: dbErr } = await supabase
        .from("product_images")
        .upsert({ sku: product.sku, image_url: signed.signedUrl }, { onConflict: "sku" });
      if (dbErr) throw dbErr;

      setSavedTick(true);
      onSaved();
      setTimeout(() => setSavedTick(false), 1800);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error subiendo");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex gap-3 rounded-2xl border border-border bg-[var(--color-surface)] p-3">
      <div className="size-20 shrink-0 overflow-hidden rounded-xl bg-[var(--color-surface-strong)]">
        {currentUrl ? (
          <img src={currentUrl} alt={product.name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center font-display text-2xl font-bold text-muted-foreground">
            {product.name.charAt(0).toUpperCase()}
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1.5">
        <div className="line-clamp-2 text-sm font-semibold leading-snug">{product.name}</div>
        <div className="text-[11px] text-muted-foreground">SKU {product.sku}</div>
        <div className="mt-auto flex items-center gap-2">
          <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-[var(--color-primary)] px-3 py-1.5 text-[11px] font-semibold text-[var(--color-primary-foreground)] transition hover:opacity-90">
            {busy ? <Loader2 className="size-3 animate-spin" /> : <Upload className="size-3" />}
            {currentUrl ? "Reemplazar" : "Subir foto"}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              disabled={busy}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) onFile(f);
                e.target.value = "";
              }}
            />
          </label>
          {savedTick && (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
              <CheckCircle2 className="size-3" /> Guardado
            </span>
          )}
        </div>
        {error && <div className="text-[11px] text-destructive">{error}</div>}
      </div>
    </div>
  );
}

function CenterCard({ title, desc, action }: { title: string; desc: string; action: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-[var(--color-surface)] p-6 text-center">
        <h2 className="font-display text-xl font-bold">{title}</h2>
        <p className="mt-2 break-words text-sm text-muted-foreground">{desc}</p>
        <div className="mt-5">{action}</div>
      </div>
    </div>
  );
}
