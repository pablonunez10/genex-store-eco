export function formatGs(value: number): string {
  const v = Number(value || 0);
  return "Gs " + v.toLocaleString("es-PY", { maximumFractionDigits: 0 });
}
