import { createFileRoute, Link } from "@tanstack/react-router";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { z } from "zod";
import { useState, useEffect } from "react";
import { inventario, type InventarioCategory, type InventarioProduct } from "@/integrations/inventario/client";
import { Header } from "@/components/header";
import { ProductCard } from "@/components/product-card";
import { useProductImages } from "@/lib/product-images";
import { STORE } from "@/lib/store-config";
import { ArrowRight, ShieldCheck, Truck, MessageCircle, ChevronLeft, ChevronRight } from "lucide-react";

const PAGE_SIZE = 12;

const OTROS_IDS = ["684e85ce-139e-4272-8251-b08150768e3a", "35995509-7b9d-48e8-a00d-6d63bbd02fd4"];
const OTROS_PRIMARY_ID = "684e85ce-139e-4272-8251-b08150768e3a";

const searchSchema = z.object({
  cat: fallback(z.string(), "all").default("all"),
  page: fallback(z.number().int().min(1), 1).default(1),
  q: fallback(z.string(), "").default(""),
});
type SearchParams = z.infer<typeof searchSchema>;

export const Route = createFileRoute("/")({
  validateSearch: zodValidator(searchSchema),
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
  const { cat, page, q } = Route.useSearch();
  const navigate = Route.useNavigate();
  const [searchInput, setSearchInput] = useState(q);

  // Debounce search input -> URL
  useEffect(() => {
    const t = setTimeout(() => {
      if (searchInput !== q) {
        navigate({ search: (prev: SearchParams) => ({ ...prev, q: searchInput, page: 1 }) });
      }
    }, 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  const categoriesQuery = useQuery({
    queryKey: ["categories"],
    staleTime: 5 * 60_000,
    queryFn: async () => {
      const { data, error } = await inventario
        .from("categories")
        .select("id,name,description,is_active")
        .eq("is_active", true)
        .order("name", { ascending: true });
      if (error) throw error;
      return (data ?? []) as InventarioCategory[];
    },
  });

  const productsQuery = useQuery({
    queryKey: ["products", cat, page, q],
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
      if (cat !== "all") {
        if (OTROS_IDS.includes(cat)) {
          query = query.in("category_id", OTROS_IDS);
        } else {
          query = query.eq("category_id", cat);
        }
      }
      if (q.trim()) query = query.or(`name.ilike.%${q.trim()}%,sku.ilike.%${q.trim()}%`);
      const { data, error, count } = await query;
      if (error) throw error;
      return { items: (data ?? []) as InventarioProduct[], total: count ?? 0 };
    },
  });

  const total = productsQuery.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const categories = categoriesQuery.data ?? [];
  const categoryName = (id: string) => categories.find((c) => c.id === id)?.name;
  const error = productsQuery.error || categoriesQuery.error;

  const setCat = (newCat: string) =>
    navigate({ search: (prev: SearchParams) => ({ ...prev, cat: newCat, page: 1 }) });
  const setPage = (newPage: number) =>
    navigate({ search: (prev: SearchParams) => ({ ...prev, page: newPage }) });

  return (
    <div className="min-h-screen bg-background">
      <Header onSearch={setSearchInput} searchValue={searchInput} />

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
            <h2 className="font-display text-2xl font-bold sm:text-3xl">
              {cat === "all" ? "Catalogo" : categoryName(cat) ?? "Catalogo"}
            </h2>
            <p className="text-sm text-muted-foreground">
              {productsQuery.isLoading
                ? "Cargando productos..."
                : `${total} producto(s) · pagina ${page} de ${totalPages}`}
            </p>
          </div>
        </div>

        {/* Mobile search */}
        <div className="mb-4 md:hidden">
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Buscar productos..."
            className="h-11 w-full rounded-full border border-border bg-[var(--color-surface)] px-4 text-sm outline-none focus:border-[var(--color-ring)]"
          />
        </div>

        {/* Category tabs */}
        <div className="mb-6 -mx-1 flex flex-nowrap gap-2 overflow-x-auto px-1 pb-2 sm:flex-wrap sm:overflow-visible">
          <button
            onClick={() => setCat("all")}
            className={`shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition ${
              cat === "all"
                ? "border-transparent bg-[var(--color-primary)] text-[var(--color-primary-foreground)]"
                : "border-border bg-[var(--color-surface)] hover:bg-[var(--color-surface-strong)]"
            }`}
          >
            Todos
          </button>
          {categories
            .filter((c) => c.id !== "35995509-7b9d-48e8-a00d-6d63bbd02fd4")
            .map((c) => (
              <button
                key={c.id}
                onClick={() => setCat(c.id === OTROS_PRIMARY_ID ? OTROS_PRIMARY_ID : c.id)}
                className={`shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition ${
                  (OTROS_IDS.includes(cat) && c.id === OTROS_PRIMARY_ID) || (cat === c.id && !OTROS_IDS.includes(cat))
                    ? "border-transparent bg-(--color-primary) text-(--color-primary-foreground)"
                    : "border-border bg-(--color-surface) hover:bg-(--color-surface-strong)"
                }`}
              >
                {c.name}
              </button>
            ))}
        </div>

        {error && (
          <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
            No pudimos cargar los productos. Verifica que la base de Inventario Amigo permita lectura publica para visitantes.
          </div>
        )}

        {productsQuery.isLoading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: PAGE_SIZE }).map((_, i) => (
              <div key={i} className="aspect-[3/4] animate-pulse rounded-2xl bg-[var(--color-surface-strong)]" />
            ))}
          </div>
        ) : (productsQuery.data?.items.length ?? 0) === 0 ? (
          <div className="rounded-2xl border border-border bg-[var(--color-surface)] p-10 text-center text-sm text-muted-foreground">
            No encontramos productos para tu busqueda.
          </div>
        ) : (
          <>
            <ProductGrid items={productsQuery.data!.items} fetching={productsQuery.isFetching} categoryName={categoryName} />


            {totalPages > 1 && (
              <Pagination page={page} totalPages={totalPages} onChange={setPage} />
            )}
          </>
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

function Pagination({ page, totalPages, onChange }: { page: number; totalPages: number; onChange: (p: number) => void }) {
  const pages: (number | "...")[] = [];
  const push = (n: number | "...") => pages.push(n);
  const window = 1;
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= page - window && i <= page + window)) {
      push(i);
    } else if (pages[pages.length - 1] !== "...") {
      push("...");
    }
  }

  return (
    <nav className="mt-8 flex items-center justify-center gap-1.5" aria-label="Paginacion">
      <button
        onClick={() => onChange(Math.max(1, page - 1))}
        disabled={page === 1}
        className="inline-flex h-9 items-center gap-1 rounded-full border border-border bg-[var(--color-surface)] px-3 text-xs font-semibold transition hover:bg-[var(--color-surface-strong)] disabled:cursor-not-allowed disabled:opacity-50"
      >
        <ChevronLeft className="size-3.5" /> Anterior
      </button>
      {pages.map((p, idx) =>
        p === "..." ? (
          <span key={`e-${idx}`} className="px-2 text-xs text-muted-foreground">…</span>
        ) : (
          <button
            key={p}
            onClick={() => onChange(p)}
            className={`h-9 min-w-9 rounded-full border px-3 text-xs font-semibold transition ${
              p === page
                ? "border-transparent bg-[var(--color-primary)] text-[var(--color-primary-foreground)]"
                : "border-border bg-[var(--color-surface)] hover:bg-[var(--color-surface-strong)]"
            }`}
          >
            {p}
          </button>
        ),
      )}
      <button
        onClick={() => onChange(Math.min(totalPages, page + 1))}
        disabled={page === totalPages}
        className="inline-flex h-9 items-center gap-1 rounded-full border border-border bg-[var(--color-surface)] px-3 text-xs font-semibold transition hover:bg-[var(--color-surface-strong)] disabled:cursor-not-allowed disabled:opacity-50"
      >
        Siguiente <ChevronRight className="size-3.5" />
      </button>
    </nav>
  );
}
