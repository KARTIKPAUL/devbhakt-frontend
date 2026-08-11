"use client";

import { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";
import { effectivePrice } from "@/lib/format";

const CartContext = createContext(null);
const STORAGE_KEY = "kartikeyo_cart";

// Each cart line: { productId, name, image, price, size, quantity, slug, stock }

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setItems(JSON.parse(stored));
    } catch {
      setItems([]);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, hydrated]);

  const addItem = useCallback((product, size, quantity = 1) => {
    setItems((prev) => {
      const key = (p) => `${p.productId}__${p.size || ""}`;
      const newKey = `${product._id}__${size || ""}`;
      const existingIndex = prev.findIndex((p) => key(p) === newKey);

      if (existingIndex > -1) {
        const next = [...prev];
        const maxQty = product.stock ?? 99;
        next[existingIndex] = {
          ...next[existingIndex],
          quantity: Math.min(next[existingIndex].quantity + quantity, maxQty || 99),
        };
        return next;
      }

      return [
        ...prev,
        {
          productId: product._id,
          name: product.name,
          image: product.images?.[0],
          price: effectivePrice(product),
          size: size || null,
          quantity,
          slug: product.slug,
          stock: product.stock,
        },
      ];
    });
  }, []);

  const removeItem = useCallback((productId, size) => {
    setItems((prev) => prev.filter((p) => !(p.productId === productId && p.size === size)));
  }, []);

  const updateQuantity = useCallback((productId, size, quantity) => {
    setItems((prev) =>
      prev.map((p) =>
        p.productId === productId && p.size === size
          ? { ...p, quantity: Math.max(1, Math.min(quantity, p.stock || 99)) }
          : p
      )
    );
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items]
  );

  const itemCount = useMemo(() => items.reduce((sum, item) => sum + item.quantity, 0), [items]);

  return (
    <CartContext.Provider
      value={{ items, hydrated, addItem, removeItem, updateQuantity, clearCart, subtotal, itemCount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
