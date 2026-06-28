import { Link } from "@tanstack/react-router";
import { useCart } from "@/contexts/cart-context";
import { formatGs } from "@/lib/format";
import { Minus, Plus, Trash2, X, ShoppingBag } from "lucide-react";

export function CartDrawer() {
  const { items, isOpen, setOpen, setQuantity, removeItem, totalAmount, totalItems } = useCart();

  return (
    <>
      <div
        onClick={() => setOpen(false)}
        className={`fixed inset-0 z-50 bg-black/55 transition-opacity ${isOpen ? "opacity-100" : "pointer-events-none opacity-0"}`}
      />
      <aside
        className={`fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col border-l-2 border-foreground bg-[var(--color-surface)] shadow-2xl transition-transform ${isOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex items-center justify-between border-b-2 border-foreground px-5 py-4">
          <div className="font-display text-xl font-black uppercase tracking-normal">
            Tu carrito
          </div>
          <button
            onClick={() => setOpen(false)}
            className="rounded-[0.35rem] border-2 border-foreground p-2 hover:bg-[var(--color-brand)]"
            aria-label="Cerrar"
          >
            <X className="size-4" />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center text-muted-foreground">
            <ShoppingBag className="size-10" />
            <p className="text-sm font-semibold">Todavia no agregaste productos.</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto px-5 py-4">
            <ul className="divide-y-2 divide-foreground">
              {items.map((item) => (
                <li key={item.id} className="flex gap-3 py-4">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center border-2 border-foreground bg-[var(--color-surface-strong)] font-display text-xl font-black uppercase text-muted-foreground">
                    {item.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-black uppercase leading-snug">{item.name}</div>
                    <div className="mt-0.5 text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                      SKU {item.sku}
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <div className="inline-flex items-center rounded-[0.35rem] border-2 border-foreground">
                        <button
                          onClick={() => setQuantity(item.id, item.quantity - 1)}
                          className="p-1.5 hover:bg-[var(--color-brand)]"
                          aria-label="Restar"
                        >
                          <Minus className="size-3" />
                        </button>
                        <span className="min-w-[2rem] text-center text-sm font-black">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => setQuantity(item.id, item.quantity + 1)}
                          className="p-1.5 hover:bg-[var(--color-brand)] disabled:opacity-40"
                          disabled={item.quantity >= item.stock}
                          aria-label="Sumar"
                        >
                          <Plus className="size-3" />
                        </button>
                      </div>
                      <div className="text-sm font-black">
                        {formatGs(item.price * item.quantity)}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="self-start rounded-[0.35rem] p-1.5 text-muted-foreground hover:bg-[var(--color-brand)] hover:text-foreground"
                    aria-label="Quitar"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {items.length > 0 && (
          <div className="border-t-2 border-foreground px-5 py-4">
            <div className="flex items-center justify-between pb-3 text-sm">
              <span className="font-bold uppercase text-muted-foreground">
                {totalItems} producto(s)
              </span>
              <span className="font-display text-xl font-black">{formatGs(totalAmount)}</span>
            </div>
            <Link
              to="/checkout"
              onClick={() => setOpen(false)}
              className="block w-full rounded-[0.45rem] border-2 border-[var(--primary-dark)] bg-[var(--color-primary)] py-3 text-center text-sm font-black uppercase text-[var(--color-primary-foreground)] transition hover:border-[var(--color-brand)] hover:bg-[var(--color-brand)]"
            >
              Finalizar pedido
            </Link>
          </div>
        )}
      </aside>
    </>
  );
}
