import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  stock: number;
  sku: string;
}

interface CartContextValue {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">, qty?: number) => void;
  removeItem: (id: string) => void;
  setQuantity: (id: string, qty: number) => void;
  clear: () => void;
  totalItems: number;
  totalAmount: number;
  isOpen: boolean;
  setOpen: (v: boolean) => void;
}

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "genex_cart_v1";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {}
  }, [items, hydrated]);

  const value = useMemo<CartContextValue>(() => {
    const totalItems = items.reduce((acc, i) => acc + i.quantity, 0);
    const totalAmount = items.reduce((acc, i) => acc + i.quantity * i.price, 0);
    return {
      items,
      isOpen,
      setOpen,
      totalItems,
      totalAmount,
      addItem: (incoming, qty = 1) => {
        setItems((prev) => {
          const existing = prev.find((p) => p.id === incoming.id);
          const max = incoming.stock;
          if (existing) {
            const nextQty = Math.min(existing.quantity + qty, max);
            return prev.map((p) => (p.id === incoming.id ? { ...p, quantity: nextQty } : p));
          }
          return [...prev, { ...incoming, quantity: Math.min(qty, max) }];
        });
      },
      removeItem: (id) => setItems((prev) => prev.filter((p) => p.id !== id)),
      setQuantity: (id, qty) =>
        setItems((prev) =>
          prev.map((p) => (p.id === id ? { ...p, quantity: Math.max(1, Math.min(qty, p.stock)) } : p)),
        ),
      clear: () => setItems([]),
    };
  }, [items, isOpen]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart fuera del CartProvider");
  return ctx;
}
