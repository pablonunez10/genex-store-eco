import { ShoppingBag, Search } from "lucide-react";
import { useCart } from "@/contexts/cart-context";
import { GenexLogo } from "@/components/genex-logo";

interface HeaderProps {
  onSearch?: (v: string) => void;
  searchValue?: string;
}

export function Header({ onSearch, searchValue }: HeaderProps) {
  const { totalItems, setOpen } = useCart();
  return (
    <header className="sticky top-0 z-40 border-b-2 border-foreground bg-background/92 backdrop-blur">
      <div className="mx-auto flex h-[4.75rem] max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
        <GenexLogo />

        {onSearch && (
          <div className="relative ml-auto hidden max-w-md flex-1 md:block">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={searchValue ?? ""}
              onChange={(e) => onSearch(e.target.value)}
              placeholder="Buscar productos..."
              className="h-11 w-full rounded-[0.45rem] border-2 border-foreground bg-[var(--color-surface)] pl-9 pr-4 text-sm font-semibold outline-none transition placeholder:font-medium focus:shadow-[4px_4px_0_var(--color-brand)]"
            />
          </div>
        )}

        <button
          onClick={() => setOpen(true)}
          className={`relative ml-auto inline-flex h-11 items-center gap-2 rounded-[0.45rem] border-2 border-foreground bg-foreground px-4 text-sm font-black uppercase text-background transition hover:-translate-y-0.5 hover:shadow-[4px_4px_0_var(--color-brand)] ${onSearch ? "md:ml-0" : ""}`}
        >
          <ShoppingBag className="size-4" />
          <span className="hidden sm:inline">Carrito</span>
          {totalItems > 0 && (
            <span className="inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-[var(--color-brand)] px-1.5 text-[11px] font-black text-[var(--color-brand-foreground)]">
              {totalItems}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
