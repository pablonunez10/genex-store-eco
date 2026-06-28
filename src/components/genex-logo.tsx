import { Link } from "@tanstack/react-router";
import { STORE } from "@/lib/store-config";

export function GenexLogo({ compact = false }: { compact?: boolean }) {
  return (
    <Link
      to="/"
      className="group inline-flex items-center gap-3"
      aria-label={`${STORE.name} inicio`}
    >
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[0.35rem] bg-foreground text-background shadow-[4px_4px_0_var(--color-brand)] transition group-hover:translate-x-0.5 group-hover:translate-y-0.5 group-hover:shadow-none">
        <span className="font-display text-xl font-black leading-none">G</span>
      </span>
      {!compact && (
        <span className="leading-none">
          <span className="block font-display text-xl font-black uppercase tracking-normal">
            GENEX
          </span>
          <span className="mt-1 block text-[10px] font-black uppercase tracking-[0.55em] text-muted-foreground">
            Store
          </span>
        </span>
      )}
    </Link>
  );
}
