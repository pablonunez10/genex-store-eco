import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/generate-product-image")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { name, description } = (await request.json()) as {
          name: string;
          description?: string | null;
        };
        const key = process.env.LOVABLE_API_KEY;
        if (!key) return new Response("Missing LOVABLE_API_KEY", { status: 500 });

        const prompt = `Fotografía de producto profesional de e-commerce para: "${name}"${
          description ? `. Detalles: ${description}` : ""
        }. Fondo blanco liso, iluminación de estudio suave, producto centrado, encuadre cuadrado, sin texto ni marcas de agua, estilo catálogo minimalista.`;

        const upstream = await fetch("https://ai.gateway.lovable.dev/v1/images/generations", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${key}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash-image",
            messages: [{ role: "user", content: prompt }],
            modalities: ["image", "text"],
          }),
        });

        if (!upstream.ok) {
          const text = await upstream.text();
          return new Response(text || "Image generation failed", { status: upstream.status });
        }

        const json = (await upstream.json()) as { data?: Array<{ b64_json?: string }> };
        const b64 = json.data?.[0]?.b64_json;
        if (!b64) return new Response("No image returned", { status: 502 });

        return new Response(JSON.stringify({ b64 }), {
          headers: { "Content-Type": "application/json" },
        });
      },
    },
  },
});
