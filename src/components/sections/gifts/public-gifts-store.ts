"use client";

import { useEffect, useRef, useState } from "react";
import type { Gift } from "@/src/components/sections/gifts/shop-types";

export function usePublicGiftsCatalog(initialGifts: Gift[] = []) {
  const initialGiftsRef = useRef(initialGifts);
  const [gifts, setGifts] = useState<Gift[]>(initialGifts);
  const [loading, setLoading] = useState(initialGiftsRef.current.length === 0);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (initialGiftsRef.current.length === 0) {
        setLoading(true);
      }

      try {
        const response = await fetch("/api/gifts", { cache: "no-store" });
        const payload = (await response.json().catch(() => null)) as Gift[] | null;

        if (!response.ok || !Array.isArray(payload) || cancelled) {
          return;
        }

        setGifts(payload);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  return { gifts, loading };
}
