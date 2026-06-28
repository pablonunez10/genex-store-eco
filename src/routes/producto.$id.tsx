import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { inventario, type InventarioProduct } from "@/integrations/inventario/client";
import { Header } from "@/components/header";
import { useCart } from "@/contexts/cart-context";
import { formatGs } from "@/lib/format";
import { useProductImages } from "@/lib/product-images";
import { ArrowLeft, Minus, Plus, ShoppingBag, PackageCheck, PackageX } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/producto/$id")({
  component: ProductPage,
});

function ProductPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { addItem, setOpen } = useCart();
  const [qty, setQty] = useState(1);

  const {
    data: product,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      const { data, error } = await inventario
        .from("products")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return data as InventarioProduct | null;
    },
  });

  const { data: images } = useProductImages(product?.sku ? [product.sku] : []);
  const imageUrl = product?.sku ? images?.[product.sku] : undefined;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate({ to: "/" })}
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-black uppercase text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> Volver al catalogo
        </button>

        {isLoading ? (
          <div className="grid gap-8 lg:grid-cols-2">
            <div className="aspect-square animate-pulse border-2 border-foreground bg-[var(--color-surface-strong)]" />
            <div className="space-y-4">
              <div className="h-8 w-2/3 animate-pulse bg-[var(--color-surface-strong)]" />
              <div className="h-6 w-1/3 animate-pulse bg-[var(--color-surface-strong)]" />
              <div className="h-20 animate-pulse bg-[var(--color-surface-strong)]" />
            </div>
          </div>
        ) : error || !product ? (
          <div className="border-2 border-foreground bg-[var(--color-surface)] p-10 text-center text-sm font-semibold text-muted-foreground">
            Producto no encontrado.
          </div>
        ) : (
          <div className="grid gap-10 lg:grid-cols-2">
            <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-[var(--color-surface-strong)] to-[var(--color-accent)]">
              {imageUrl ? (
                <img src={imageUrl} alt={product.name} className="h-full w-full object-cover" />
              ) : (
                <span className="font-display text-[10rem] font-bold text-[var(--color-ink)]/15">
                  {product.name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div className="flex flex-col gap-4">
              <div className="text-xs font-black uppercase tracking-[0.3em] text-muted-foreground">
                SKU {product.sku}
              </div>
              <h1 className="font-display text-4xl font-black uppercase leading-none tracking-normal sm:text-6xl">
                {product.name}
              </h1>
              <div className="font-display text-3xl font-black">{formatGs(product.sale_price)}</div>

              <div className="flex items-center gap-2 text-sm">
                {product.current_stock > 0 ? (
                  <span className="inline-flex items-center gap-1.5 rounded-[0.35rem] border-2 border-foreground bg-[var(--color-brand)] px-3 py-1 font-black uppercase text-[var(--color-ink)]">
                    <PackageCheck className="size-3.5" /> {product.current_stock} en stock
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-[0.35rem] border-2 border-destructive bg-destructive/15 px-3 py-1 font-black uppercase text-destructive">
                    <PackageX className="size-3.5" /> Sin stock
                  </span>
                )}
              </div>

              {product.description && (
                <p className="border-2 border-foreground bg-[var(--color-surface)] p-4 text-sm font-medium leading-relaxed text-muted-foreground">
                  {product.description}
                </p>
              )}

              {product.current_stock > 0 && (
                <div className="mt-2 flex flex-wrap items-center gap-3">
                  <div className="inline-flex items-center rounded-[0.35rem] border-2 border-foreground">
                    <button
                      onClick={() => setQty((q) => Math.max(1, q - 1))}
                      className="p-2.5 hover:bg-[var(--color-brand)]"
                      aria-label="Restar"
                    >
                      <Minus className="size-4" />
                    </button>
                    <span className="min-w-[2.5rem] text-center text-sm font-black">{qty}</span>
                    <button
                      onClick={() => setQty((q) => Math.min(product.current_stock, q + 1))}
                      className="p-2.5 hover:bg-[var(--color-brand)] disabled:opacity-40"
                      disabled={qty >= product.current_stock}
                      aria-label="Sumar"
                    >
                      <Plus className="size-4" />
                    </button>
                  </div>
                  <button
                    onClick={() => {
                      addItem(
                        {
                          id: product.id,
                          name: product.name,
                          price: Number(product.sale_price),
                          stock: product.current_stock,
                          sku: product.sku,
                        },
                        qty,
                      );
                      setOpen(true);
                    }}
                    className="inline-flex items-center gap-2 rounded-[0.45rem] border-2 border-foreground bg-foreground px-5 py-3 text-sm font-black uppercase text-background transition hover:bg-[var(--color-brand)] hover:text-foreground"
                  >
                    <ShoppingBag className="size-4" /> Agregar al carrito
                  </button>
                  <Link
                    to="/checkout"
                    onClick={() =>
                      addItem(
                        {
                          id: product.id,
                          name: product.name,
                          price: Number(product.sale_price),
                          stock: product.current_stock,
                          sku: product.sku,
                        },
                        qty,
                      )
                    }
                    className="inline-flex items-center gap-2 rounded-[0.45rem] border-2 border-foreground px-5 py-3 text-sm font-black uppercase transition hover:bg-[var(--color-brand)]"
                  >
                    Comprar ahora
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
