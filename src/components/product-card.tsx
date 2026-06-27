import { Link } from "@tanstack/react-router";
import { Plus, PackageX } from "lucide-react";
import type { InventarioProduct } from "@/integrations/inventario/client";
import { useCart } from "@/contexts/cart-context";
import { formatGs } from "@/lib/format";

export function ProductCard({
  product,
  categoryName,
}: {
  product: InventarioProduct;
  categoryName?: string;
}) {
  const { addItem, setOpen } = useCart();
  const outOfStock = product.current_stock <= 0;

  return (
    <article className="group flex flex-col overflow-hidden border-2 border-foreground bg-[var(--color-surface)] transition hover:-translate-y-1 hover:shadow-[7px_7px_0_var(--color-brand)]">
      <Link
        to="/producto/$id"
        params={{ id: product.id }}
        className="relative flex aspect-square items-center justify-center overflow-hidden border-b-2 border-foreground bg-[var(--color-surface-strong)]"
      >
        <span className="absolute inset-0 opacity-45 [background-image:linear-gradient(var(--color-border)_1px,transparent_1px),linear-gradient(90deg,var(--color-border)_1px,transparent_1px)] [background-size:18px_18px]" />
        <span className="relative font-display text-7xl font-black uppercase text-[var(--color-ink)]/12">
          {product.name.charAt(0).toUpperCase()}
        </span>
        {categoryName && (
          <span className="absolute left-3 top-3 max-w-[calc(100%-1.5rem)] truncate rounded-[0.25rem] border-2 border-foreground bg-[var(--color-surface)] px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-foreground">
            {categoryName}
          </span>
        )}
        {outOfStock && (
          <span className="absolute right-3 bottom-3 inline-flex items-center gap-1 rounded-[0.25rem] border-2 border-foreground bg-destructive px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-destructive-foreground">
            <PackageX className="size-3" /> Sin stock
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <Link
          to="/producto/$id"
          params={{ id: product.id }}
          className="line-clamp-2 font-display text-base font-black uppercase leading-tight tracking-normal"
        >
          {product.name}
        </Link>
        <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
          SKU {product.sku} · Stock {product.current_stock}
        </div>
        <div className="mt-auto flex items-center justify-between pt-3">
          <div className="font-display text-lg font-black">{formatGs(product.sale_price)}</div>
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
            className="inline-flex h-9 items-center gap-1 rounded-[0.35rem] border-2 border-foreground bg-foreground px-3 text-xs font-black uppercase text-background transition hover:bg-[var(--color-brand)] hover:text-foreground disabled:cursor-not-allowed disabled:border-muted disabled:bg-muted disabled:text-muted-foreground"
          >
            <Plus className="size-3.5" /> Agregar
          </button>
        </div>
      </div>
    </article>
  );
}
