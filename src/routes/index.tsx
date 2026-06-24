import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { inventario, type InventarioCategory, type InventarioProduct } from "@/integrations/inventario/client";
import { Header } from "@/components/header";
import { ProductCard } from "@/components/product-card";
import { STORE } from "@/lib/store-config";
import { ArrowRight, ShieldCheck, Truck, MessageCircle } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: `${STORE.name} — Comprar online en Paraguay` },
      { name: "description", content: `Catalogo de ${STORE.name}: accesorios, vidrios, perfumes y mas. Pedidos online con pago por transferencia.` },
      { property: "og:title", content: STORE.name },
      { property: "og:description", content: STORE.tagline },
    ],
  }),
  component: Home,
});

function Home() {
  const [search, setSearch] = useState("");
  const [activeCat, setActiveCat] = useState<string | null>(null);

  const productsQuery = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data, error } = await inventario
        .from("products")
        .select("*")
        .eq("is_active", true)
        .order("name", { ascending: true });
      if (error) throw error;
      return (data ?? []) as InventarioProduct[];
    },
  });

  const categoriesQuery = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await inventario
        .from("categories")
        .select("*")
        .eq("is_active", true)
        .order("name", { ascending: true });
      if (error) throw error;
      return (data ?? []) as InventarioCategory[];
    },
  });

  const categoryMap = useMemo(() => {
    const m = new Map<string, string>();
    (categoriesQuery.data ?? []).forEach((c) => m.set(c.id, c.name));
    return m;
  }, [categoriesQuery.data]);

  const filtered = useMemo(() => {
    const list = productsQuery.data ?? [];
    const q = search.trim().toLowerCase();
    return list.filter((p) => {
      if (activeCat && p.category_id !== activeCat) return false;
      if (!q) return true;
      return p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q);
    });
  }, [productsQuery.data, search, activeCat]);

  const error = productsQuery.error || categoriesQuery.error;

  return (
    <div className="min-h-screen bg-background">
      <Header onSearch={setSearch} searchValue={search} />

      {/* Hero */}
      <section className="border-b border-border bg-gradient-to-br from-[var(--color-surface-strong)] via-background to-[var(--color-accent)]">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-20">
          <div className="flex flex-col justify-center gap-5">
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-[var(--color-surface)] px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              <span className="size-1.5 rounded-full bg-[var(--color-brand)]" />
              Tienda online en Paraguay
            </span>
            <h1 className="font-display text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              Tecnologia y accesorios al alcance de un clic.
            </h1>
            <p className="max-w-lg text-base text-muted-foreground">
              Pedidos en guaranies, pago por transferencia y envio de comprobante en segundos.
              Stock en tiempo real desde nuestro inventario.
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                href="#catalogo"
                className="inline-flex items-center gap-2 rounded-full bg-[var(--color-primary)] px-5 py-3 text-sm font-semibold text-[var(--color-primary-foreground)] transition hover:opacity-90"
              >
                Ver catalogo <ArrowRight className="size-4" />
              </a>
              <a
                href={`https://wa.me/${STORE.whatsapp}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-border bg-[var(--color-surface)] px-5 py-3 text-sm font-semibold transition hover:bg-[var(--color-surface-strong)]"
              >
                <MessageCircle className="size-4" /> WhatsApp
              </a>
            </div>
          </div>
          <div className="relative hidden items-center justify-center lg:flex">
            <div className="relative h-72 w-72 rounded-3xl border border-border bg-[var(--color-surface)] p-8 shadow-xl">
              <div className="absolute -right-6 -top-6 h-32 w-32 rounded-2xl bg-[var(--color-brand)]" />
              <div className="relative flex h-full flex-col justify-between">
                <div>
                  <div className="text-xs uppercase tracking-widest text-muted-foreground">Destacado</div>
                  <div className="mt-2 font-display text-2xl font-bold">Stock real, precio claro.</div>
                </div>
                <div className="text-sm text-muted-foreground">
                  Nuestro catalogo se sincroniza con el inventario interno: nunca te ofrecemos lo que no tenemos.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust strip */}
      <section className="border-b border-border bg-[var(--color-surface)]">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 py-6 sm:grid-cols-3 sm:px-6 lg:px-8">
          {[
            { icon: ShieldCheck, title: "Pago seguro", desc: "Transferencia o alias, comprobante adjunto." },
            { icon: Truck, title: "Coordinamos entrega", desc: "Te contactamos al confirmar el pago." },
            { icon: MessageCircle, title: "Atencion personal", desc: "Resolvemos por WhatsApp en el dia." },
          ].map((f) => (
            <div key={f.title} className="flex items-start gap-3">
              <div className="rounded-lg bg-[var(--color-surface-strong)] p-2.5">
                <f.icon className="size-5" />
              </div>
              <div>
                <div className="text-sm font-semibold">{f.title}</div>
                <div className="text-xs text-muted-foreground">{f.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Catalog */}
      <section id="catalogo" className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-3 pb-6">
          <div>
            <h2 className="font-display text-2xl font-bold sm:text-3xl">Catalogo</h2>
            <p className="text-sm text-muted-foreground">
              {productsQuery.isLoading ? "Cargando productos..." : `${filtered.length} producto(s) disponibles`}
            </p>
          </div>
        </div>

        {/* Mobile search */}
        <div className="mb-4 md:hidden">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar productos..."
            className="h-11 w-full rounded-full border border-border bg-[var(--color-surface)] px-4 text-sm outline-none focus:border-[var(--color-ring)]"
          />
        </div>

        {/* Category chips */}
        {(categoriesQuery.data?.length ?? 0) > 0 && (
          <div className="mb-6 flex flex-wrap gap-2">
            <button
              onClick={() => setActiveCat(null)}
              className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition ${
                activeCat === null
                  ? "border-transparent bg-[var(--color-primary)] text-[var(--color-primary-foreground)]"
                  : "border-border bg-[var(--color-surface)] hover:bg-[var(--color-surface-strong)]"
              }`}
            >
              Todos
            </button>
            {(categoriesQuery.data ?? []).map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCat(cat.id)}
                className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition ${
                  activeCat === cat.id
                    ? "border-transparent bg-[var(--color-primary)] text-[var(--color-primary-foreground)]"
                    : "border-border bg-[var(--color-surface)] hover:bg-[var(--color-surface-strong)]"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        )}

        {error && (
          <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
            No pudimos cargar los productos. Verifica que la base de Inventario Amigo permita lectura publica para visitantes.
          </div>
        )}

        {productsQuery.isLoading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-[3/4] animate-pulse rounded-2xl bg-[var(--color-surface-strong)]" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-border bg-[var(--color-surface)] p-10 text-center text-sm text-muted-foreground">
            No encontramos productos para tu busqueda.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {filtered.map((p) => (
              <ProductCard key={p.id} product={p} categoryName={categoryMap.get(p.category_id)} />
            ))}
          </div>
        )}
      </section>

      <footer className="border-t border-border bg-[var(--color-surface)] py-10">
        <div className="mx-auto max-w-7xl px-4 text-center text-xs text-muted-foreground sm:px-6 lg:px-8">
          <div className="font-display text-base font-bold text-foreground">{STORE.name}</div>
          <div className="mt-1">{STORE.tagline} · WhatsApp +{STORE.whatsapp}</div>
          <div className="mt-3">
            <Link to="/checkout" className="underline-offset-2 hover:underline">Finalizar compra</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
