import { Link } from "@tanstack/react-router";
import { ShoppingBag, Search } from "lucide-react";
import { useCart } from "@/contexts/cart-context";
import { STORE } from "@/lib/store-config";

interface HeaderProps {
  onSearch?: (v: string) => void;
  searchValue?: string;
}

export function Header({ onSearch, searchValue }: HeaderProps) {
  const { totalItems, setOpen } = useCart();
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-[var(--color-brand)] text-[var(--color-brand-foreground)] font-bold">
            G
          </span>
          <div className="leading-tight">
            <div className="font-display text-base font-bold tracking-tight">{STORE.name}</div>
            <div className="hidden text-[11px] uppercase tracking-widest text-muted-foreground sm:block">
              {STORE.tagline}
            </div>
          </div>
        </Link>

        {onSearch && (
          <div className="relative ml-auto hidden max-w-md flex-1 md:block">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={searchValue ?? ""}
              onChange={(e) => onSearch(e.target.value)}
              placeholder="Buscar productos..."
              className="h-10 w-full rounded-full border border-border bg-[var(--color-surface)] pl-9 pr-4 text-sm outline-none transition focus:border-[var(--color-ring)] focus:ring-2 focus:ring-[var(--color-ring)]/30"
            />
          </div>
        )}

        <button
          onClick={() => setOpen(true)}
          className={`relative ml-auto inline-flex h-10 items-center gap-2 rounded-full border border-border bg-[var(--color-surface)] px-4 text-sm font-medium transition hover:bg-[var(--color-surface-strong)] ${onSearch ? "md:ml-0" : ""}`}
        >
          <ShoppingBag className="size-4" />
          <span className="hidden sm:inline">Carrito</span>
          {totalItems > 0 && (
            <span className="inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-[var(--color-brand)] px-1.5 text-[11px] font-bold text-[var(--color-brand-foreground)]">
              {totalItems}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
