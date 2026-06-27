import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/auth")({
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/admin` },
        });
        if (error) throw error;
      }
      navigate({ to: "/admin" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error de autenticación");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-12">
        <Link to="/" className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" /> Volver a la tienda
        </Link>
        <div className="rounded-2xl border border-border bg-[var(--color-surface)] p-6 shadow-sm">
          <h1 className="font-display text-2xl font-bold">Acceso administrador</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Solo para gestionar fotos de productos y pedidos.
          </p>

          <form onSubmit={submit} className="mt-6 space-y-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 h-11 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-[var(--color-ring)]"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Contraseña</label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 h-11 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-[var(--color-ring)]"
              />
            </div>
            {error && <div className="rounded-lg bg-destructive/10 p-3 text-xs text-destructive">{error}</div>}
            <button
              type="submit"
              disabled={loading}
              className="h-11 w-full rounded-full bg-[var(--color-primary)] text-sm font-semibold text-[var(--color-primary-foreground)] transition hover:opacity-90 disabled:opacity-50"
            >
              {loading ? "Procesando..." : mode === "signin" ? "Ingresar" : "Crear cuenta"}
            </button>
          </form>

          <button
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
            className="mt-4 w-full text-center text-xs text-muted-foreground hover:text-foreground"
          >
            {mode === "signin" ? "¿No tenés cuenta? Crear una" : "Ya tengo cuenta, ingresar"}
          </button>
        </div>

        <p className="mt-4 text-center text-[11px] text-muted-foreground">
          Después de crear tu cuenta, pediles a soporte que te marquen como admin.
        </p>
      </div>
    </div>
  );
}
