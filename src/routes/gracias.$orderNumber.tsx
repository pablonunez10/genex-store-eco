import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/header";
import { CheckCircle2, Home, MessageCircle } from "lucide-react";
import { STORE } from "@/lib/store-config";

export const Route = createFileRoute("/gracias/$orderNumber")({
  component: ThankYou,
});

function ThankYou() {
  const { orderNumber } = Route.useParams();
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6 lg:px-8">
        <div className="mx-auto inline-flex size-16 items-center justify-center border-2 border-foreground bg-[var(--color-brand)] shadow-[6px_6px_0_var(--color-foreground)]">
          <CheckCircle2 className="size-9 text-[var(--color-ink)]" />
        </div>
        <h1 className="mt-6 font-display text-4xl font-black uppercase leading-none tracking-normal sm:text-6xl">
          Recibimos tu pedido
        </h1>
        <p className="mt-3 text-sm font-semibold text-muted-foreground">
          Numero de pedido:{" "}
          <span className="font-mono font-black text-foreground">#{orderNumber}</span>
        </p>
        <p className="mx-auto mt-6 max-w-md text-sm font-medium leading-relaxed text-muted-foreground">
          Vamos a verificar el comprobante y nos comunicamos por WhatsApp o email para coordinar la
          entrega. Guarda este numero para referencia.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-[0.45rem] border-2 border-foreground bg-foreground px-5 py-3 text-sm font-black uppercase text-background transition hover:bg-[var(--color-brand)] hover:text-foreground"
          >
            <Home className="size-4" /> Volver al inicio
          </Link>
          <a
            href={`https://wa.me/${STORE.whatsapp}?text=${encodeURIComponent(`Hola! Acabo de hacer el pedido #${orderNumber} en ${STORE.name}.`)}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-[0.45rem] border-2 border-foreground px-5 py-3 text-sm font-black uppercase transition hover:bg-[var(--color-brand)]"
          >
            <MessageCircle className="size-4" /> Avisar por WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
