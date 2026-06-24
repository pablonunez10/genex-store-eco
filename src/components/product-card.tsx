import { Link } from "@tanstack/react-router";
import { Plus, PackageX } from "lucide-react";
import type { InventarioProduct } from "@/integrations/inventario/client";
import { useCart } from "@/contexts/cart-context";
import { formatGs } from "@/lib/format";

export function ProductCard({ product, categoryName }: { product: InventarioProduct; categoryName?: string }) {
  const { addItem, setOpen } = useCart();
  const outOfStock = product.current_stock <= 0;

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-[var(--color-surface)] transition hover:-translate-y-0.5 hover:shadow-lg">
      <Link
        to="/producto/$id"
        params={{ id: product.id }}
        className="relative flex aspect-square items-center justify-center bg-gradient-to-br from-[var(--color-surface-strong)] to-[var(--color-accent)]"
      >
        <span className="font-display text-6xl font-bold text-[var(--color-ink)]/15">
          {product.name.charAt(0).toUpperCase()}
        </span>
        {categoryName && (
          <span className="absolute left-3 top-3 rounded-full bg-[var(--color-surface)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            {categoryName}
          </span>
        )}
        {outOfStock && (
          <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-destructive px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest text-destructive-foreground">
            <PackageX className="size-3" /> Sin stock
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <Link to="/producto/$id" params={{ id: product.id }} className="line-clamp-2 font-display text-base font-semibold leading-snug">
          {product.name}
        </Link>
        <div className="text-xs text-muted-foreground">SKU {product.sku} · Stock {product.current_stock}</div>
        <div className="mt-auto flex items-center justify-between pt-3">
          <div className="font-display text-lg font-bold">{formatGs(product.sale_price)}</div>
          <button
            disabled={outOfStock}
            onClick={() => {
              addItem({
                id: product.id,
                name: product.name,
                price: Number(product.sale_price),
                stock: product.current_stock,
                sku: product.sku,
              });
              setOpen(true);
            }}
            className="inline-flex h-9 items-center gap-1 rounded-full bg-[var(--color-primary)] px-3 text-xs font-semibold text-[var(--color-primary-foreground)] transition hover:opacity-90 disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground"
          >
            <Plus className="size-3.5" /> Agregar
          </button>
        </div>
      </div>
    </article>
  );
}
