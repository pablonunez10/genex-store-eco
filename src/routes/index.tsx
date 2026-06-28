import { createFileRoute, Link } from "@tanstack/react-router";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { z } from "zod";
import { useState, useEffect } from "react";
import {
  inventario,
  type InventarioCategory,
  type InventarioProduct,
} from "@/integrations/inventario/client";
import { Header } from "@/components/header";
import { ProductCard } from "@/components/product-card";
import { useProductImages } from "@/lib/product-images";
import { STORE } from "@/lib/store-config";
import { GenexLogo } from "@/components/genex-logo";
import {
  ArrowRight,
  ShieldCheck,
  Truck,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  Instagram,
  Sparkles,
} from "lucide-react";

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
      {
        name: "description",
        content: `Catalogo de ${STORE.name}: accesorios, vidrios, perfumes y mas. Pedidos online con pago por transferencia.`,
      },
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
        .select(
          "id,name,sku,description,current_stock,min_stock,purchase_price,sale_price,is_active,category_id,created_at,updated_at",
          { count: "exact" },
        )
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
    <div className="min-h-screen bg-background text-foreground">
      <Header onSearch={setSearchInput} searchValue={searchInput} />

      <section className="relative overflow-hidden border-b border-border bg-[linear-gradient(135deg,#ffffff_0%,#f8fafc_48%,#eff6ff_100%)]">
        <div className="absolute inset-x-0 top-0 h-8 border-b border-border bg-[repeating-linear-gradient(90deg,var(--color-primary)_0_18px,transparent_18px_36px)] opacity-[0.08]" />
        <div className="mx-auto grid max-w-7xl gap-8 px-4 pb-12 pt-16 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:pb-16 lg:pt-20">
          <div className="flex flex-col justify-center gap-6">
            <span className="inline-flex w-fit items-center gap-2 rounded-[0.35rem] border-2 border-[var(--primary-dark)] bg-[var(--color-primary)] px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.25em] text-[var(--color-primary-foreground)] shadow-[4px_4px_0_var(--color-brand)]">
              Nuevo online
            </span>
            <h1 className="max-w-3xl font-display text-5xl font-black uppercase leading-[0.9] tracking-normal sm:text-7xl lg:text-8xl">
              GENEX Store
            </h1>
            <p className="max-w-xl text-base font-medium leading-relaxed text-muted-foreground sm:text-lg">
              Tecnologia, accesorios y finds para uso diario con estetica limpia, stock real y
              atencion directa por WhatsApp.
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                href="#catalogo"
                className="inline-flex h-12 items-center gap-2 rounded-[0.45rem] border-2 border-[var(--primary-dark)] bg-[var(--color-primary)] px-5 text-sm font-black uppercase text-[var(--color-primary-foreground)] transition hover:-translate-y-0.5 hover:border-[var(--color-brand)] hover:bg-[var(--color-brand)] hover:shadow-[5px_5px_0_var(--primary-dark)]"
              >
                Ver catalogo <ArrowRight className="size-4" />
              </a>
              <a
                href="https://www.instagram.com/genexstore/"
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-12 items-center gap-2 rounded-[0.45rem] border-2 border-[var(--color-primary)] bg-[var(--color-surface)] px-5 text-sm font-black uppercase text-[var(--color-primary)] transition hover:-translate-y-0.5 hover:border-[var(--color-brand)] hover:text-[var(--color-brand)] hover:shadow-[5px_5px_0_var(--color-brand)]"
              >
                <Instagram className="size-4" /> Instagram
              </a>
            </div>
          </div>
          <div className="relative overflow-hidden border-2 border-[var(--primary-dark)] bg-[var(--primary-dark)] text-white shadow-[10px_10px_0_var(--color-brand)]">
            <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(#ffffff_1px,transparent_1px),linear-gradient(90deg,#ffffff_1px,transparent_1px)] [background-size:22px_22px]" />
            <div className="relative flex h-full flex-col justify-between p-6 sm:p-8">
              <div className="flex justify-between gap-4">
                <span className="text-xs font-black uppercase tracking-[0.35em] text-white/65">
                  Online store
                </span>
                <Sparkles className="size-5 " />
              </div>
              <div className="space-y-5">
                <GenexLogo compact />
                <div className="font-display text-6xl font-black uppercase leading-[0.82] tracking-normal sm:text-8xl">
                  GEN<span className=""></span>EX
                </div>
                <div className="flex items-end justify-between gap-4 border-t-2 border-white pt-4">
                  <p className="max-w-xs text-sm font-semibold leading-relaxed text-white/70">
                    Catalogo directo, pagos por transferencia y confirmacion simple.
                  </p>
                  <span className="font-display text-4xl font-black">PY</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-[var(--color-accent)]">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-0 px-4 sm:grid-cols-3 sm:px-6 lg:px-8">
          {[
            {
              icon: ShieldCheck,
              title: "Pago seguro",
              desc: "Transferencia o alias, comprobante adjunto.",
            },
            {
              icon: Truck,
              title: "Coordinamos entrega",
              desc: "Te contactamos al confirmar el pago.",
            },
            {
              icon: MessageCircle,
              title: "Atencion personal",
              desc: "Resolvemos por WhatsApp en el dia.",
            },
          ].map((f) => (
            <div
              key={f.title}
              className="flex items-start gap-3 border-border py-5 sm:border-r sm:px-5 sm:first:border-l"
            >
              <div className="rounded-[0.35rem] border-2 border-[var(--color-brand)] bg-[var(--color-surface)] p-2.5 text-[var(--color-brand)]">
                <f.icon className="size-5" />
              </div>
              <div>
                <div className="text-sm font-black uppercase">{f.title}</div>
                <div className="text-xs font-medium text-foreground/70">{f.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="catalogo" className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="flex flex-wrap items-end justify-between gap-3 pb-6">
          <div>
            <p className="mb-2 text-xs font-black uppercase tracking-[0.3em] text-muted-foreground">
              Shop the feed
            </p>
            <h2 className="font-display text-3xl font-black uppercase tracking-normal sm:text-5xl">
              {cat === "all" ? "Catalogo" : (categoryName(cat) ?? "Catalogo")}
            </h2>
            <p className="mt-1 text-sm font-medium text-muted-foreground">
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
            className="h-12 w-full rounded-[0.45rem] border-2 border-border bg-[var(--color-surface)] px-4 text-sm font-semibold outline-none focus:border-[var(--color-primary)] focus:shadow-[4px_4px_0_var(--color-brand)]"
          />
        </div>

        <div className="mb-6 -mx-1 flex flex-nowrap gap-2 overflow-x-auto px-1 pb-2 sm:flex-wrap sm:overflow-visible">
          <button
            onClick={() => setCat("all")}
            className={`shrink-0 rounded-[0.35rem] border-2 px-3.5 py-2 text-xs font-black uppercase transition ${
              cat === "all"
                ? "border-[var(--primary-dark)] bg-[var(--color-primary)] text-[var(--color-primary-foreground)]"
                : "border-border bg-[var(--color-surface)] text-foreground hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
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
                className={`shrink-0 rounded-[0.35rem] border-2 px-3.5 py-2 text-xs font-black uppercase transition ${
                  (OTROS_IDS.includes(cat) && c.id === OTROS_PRIMARY_ID) ||
                  (cat === c.id && !OTROS_IDS.includes(cat))
                    ? "border-[var(--primary-dark)] bg-[var(--color-primary)] text-[var(--color-primary-foreground)]"
                    : "border-border bg-[var(--color-surface)] text-foreground hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
                }`}
              >
                {c.name}
              </button>
            ))}
        </div>

        {error && (
          <div className="border-2 border-destructive bg-destructive/5 p-6 text-sm font-semibold text-destructive">
            No pudimos cargar los productos. Verifica que la base de Inventario Amigo permita
            lectura publica para visitantes.
          </div>
        )}

        {productsQuery.isLoading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: PAGE_SIZE }).map((_, i) => (
              <div
                key={i}
                className="animate-pulse border-2 border-border bg-[var(--color-surface-strong)]"
              />
            ))}
          </div>
        ) : (productsQuery.data?.items.length ?? 0) === 0 ? (
          <div className="border-2 border-border bg-[var(--color-surface)] p-10 text-center text-sm font-semibold text-muted-foreground">
            No encontramos productos para tu busqueda.
          </div>
        ) : (
          <>
            <ProductGrid
              items={productsQuery.data!.items}
              fetching={productsQuery.isFetching}
              categoryName={categoryName}
            />

            {totalPages > 1 && (
              <Pagination page={page} totalPages={totalPages} onChange={setPage} />
            )}
          </>
        )}
      </section>

      <footer className="border-t border-[var(--primary-dark)] bg-[var(--primary-dark)] py-10 text-white">
        <div className="mx-auto max-w-7xl px-4 text-center text-xs font-semibold text-white/70 sm:px-6 lg:px-8">
          <div className="font-display text-2xl font-black uppercase tracking-normal text-white">
            GENEX Store
          </div>
          <div className="mt-1">
            {STORE.tagline} · WhatsApp +{STORE.whatsapp}
          </div>
          <div className="mt-3">
            <Link
              to="/checkout"
              className="font-black uppercase underline-offset-2 hover:underline"
            >
              Finalizar compra
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function Pagination({
  page,
  totalPages,
  onChange,
}: {
  page: number;
  totalPages: number;
  onChange: (p: number) => void;
}) {
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
    <nav
      className="mt-8 flex flex-wrap items-center justify-center gap-1.5"
      aria-label="Paginacion"
    >
      <button
        onClick={() => onChange(Math.max(1, page - 1))}
        disabled={page === 1}
        className="inline-flex h-10 items-center gap-1 rounded-[0.35rem] border-2 border-border bg-[var(--color-surface)] px-3 text-xs font-black uppercase transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] disabled:cursor-not-allowed disabled:opacity-50"
      >
        <ChevronLeft className="size-3.5" /> Anterior
      </button>
      {pages.map((p, idx) =>
        p === "..." ? (
          <span key={`e-${idx}`} className="px-2 text-xs text-muted-foreground">
            …
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onChange(p)}
            className={`h-10 min-w-10 rounded-[0.35rem] border-2 px-3 text-xs font-black transition ${
              p === page
                ? "border-[var(--primary-dark)] bg-[var(--color-primary)] text-[var(--color-primary-foreground)]"
                : "border-border bg-[var(--color-surface)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
            }`}
          >
            {p}
          </button>
        ),
      )}
      <button
        onClick={() => onChange(Math.min(totalPages, page + 1))}
        disabled={page === totalPages}
        className="inline-flex h-10 items-center gap-1 rounded-[0.35rem] border-2 border-border bg-[var(--color-surface)] px-3 text-xs font-black uppercase transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] disabled:cursor-not-allowed disabled:opacity-50"
      >
        Siguiente <ChevronRight className="size-3.5" />
      </button>
    </nav>
  );
}

function ProductGrid({
  items,
  fetching,
  categoryName,
}: {
  items: InventarioProduct[];
  fetching: boolean;
  categoryName: (id: string) => string | undefined;
}) {
  const skus = items.map((p) => p.sku).filter(Boolean);
  const { data: images } = useProductImages(skus);
  return (
    <div
      className={`grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 ${fetching ? "opacity-60" : ""}`}
    >
      {items.map((p) => (
        <ProductCard
          key={p.id}
          product={p}
          categoryName={categoryName(p.category_id)}
          imageUrl={images?.[p.sku]}
        />
      ))}
    </div>
  );
}
