"use client";

import { useEffect, useMemo, useState } from "react";
import type { CartItem, CartGiftItem, Gift } from "@/src/components/sections/gifts/shop-types";
import { availableQty } from "@/src/components/sections/gifts/shop-types";

const STORAGE_KEY = "andreza-ismael-gifts-cart";

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function parseStoredCart(value: string | null): CartItem[] {
  if (!value) {
    return [];
  }

  try {
    const parsed = JSON.parse(value) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .map((item) => {
        if (
          typeof item === "object" &&
          item !== null &&
          "giftId" in item &&
          "quantity" in item &&
          typeof item.giftId === "string" &&
          typeof item.quantity === "number"
        ) {
          return {
            giftId: item.giftId,
            quantity: Math.max(1, Math.floor(item.quantity)),
          };
        }

        return null;
      })
      .filter((item): item is CartItem => item !== null);
  } catch {
    return [];
  }
}

function readCart() {
  if (!canUseStorage()) {
    return [];
  }

  return parseStoredCart(window.localStorage.getItem(STORAGE_KEY));
}

function writeCart(items: CartItem[]) {
  writeCartSilently(items);
  window.dispatchEvent(new Event("gift-cart-changed"));
}

function writeCartSilently(items: CartItem[]) {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function clampQuantity(gifts: Gift[], giftId: string, quantity: number) {
  const gift = gifts.find((entry) => entry.id === giftId);

  if (!gift) {
    return 0;
  }

  return Math.max(1, Math.min(Math.floor(quantity), Math.max(1, availableQty(gift))));
}

export function useGiftCart(gifts: Gift[]) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const sync = () => {
      const nextItems = readCart()
        .map((item) => {
          const quantity = clampQuantity(gifts, item.giftId, item.quantity);
          return quantity > 0 ? { ...item, quantity } : null;
        })
        .filter((item): item is CartItem => item !== null);

      setItems(nextItems);
      writeCartSilently(nextItems);
      setHydrated(true);
    };

    sync();
    window.addEventListener("storage", sync);
    window.addEventListener("gift-cart-changed", sync);

    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("gift-cart-changed", sync);
    };
  }, [gifts]);

  const cartItems = useMemo<CartGiftItem[]>(() => {
    return items
      .map((item) => {
        const gift = gifts.find((entry) => entry.id === item.giftId);

        if (!gift) {
          return null;
        }

        return {
          gift,
          quantity: Math.min(item.quantity, Math.max(1, availableQty(gift))),
        };
      })
      .filter((item): item is CartGiftItem => item !== null);
  }, [gifts, items]);

  const totals = useMemo(() => {
    const quantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    const subtotalCents = cartItems.reduce(
      (sum, item) => sum + item.quantity * item.gift.priceCents,
      0,
    );

    return { quantity, subtotalCents };
  }, [cartItems]);

  function updateItems(nextItems: CartItem[]) {
    setItems(nextItems);
    writeCart(nextItems);
  }

  function addToCart(giftId: string, quantity: number) {
    const normalizedQuantity = clampQuantity(gifts, giftId, quantity);
    if (!normalizedQuantity) {
      return;
    }

    const existing = items.find((item) => item.giftId === giftId);

    if (existing) {
      updateQuantity(giftId, existing.quantity + normalizedQuantity);
      return;
    }

    updateItems([...items, { giftId, quantity: normalizedQuantity }]);
  }

  function updateQuantity(giftId: string, quantity: number) {
    const normalizedQuantity = clampQuantity(gifts, giftId, quantity);

    updateItems(
      items.map((item) =>
        item.giftId === giftId ? { ...item, quantity: normalizedQuantity } : item,
      ),
    );
  }

  function removeFromCart(giftId: string) {
    updateItems(items.filter((item) => item.giftId !== giftId));
  }

  function clearCart() {
    updateItems([]);
  }

  function isInCart(giftId: string) {
    return items.some((item) => item.giftId === giftId);
  }

  return {
    hydrated,
    items,
    cartItems,
    totals,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    isInCart,
  };
}
