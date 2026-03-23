"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { GiftCard } from "@/src/components/sections/gifts/GiftCard";
import { GiftCheckoutSteps } from "@/src/components/sections/gifts/GiftCheckoutSteps";
import {
  GiftsSidebar,
  type PriceRangeValue,
  type SortValue,
} from "@/src/components/sections/gifts/GiftsSidebar";
import { useGiftCart } from "@/src/components/sections/gifts/cart-store";
import type { Gift } from "@/src/components/sections/gifts/shop-types";
import { availableQty } from "@/src/components/sections/gifts/shop-types";

type Props = {
  gifts: Gift[];
  initialGiftId?: string;
};

export function GiftsShopClient({ gifts, initialGiftId }: Props) {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortValue>("default");
  const [priceRange, setPriceRange] = useState<PriceRangeValue>("all");
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const { addToCart, isInCart, totals } = useGiftCart(gifts);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    let rows = gifts.filter((gift) => {
      const matchesSearch =
        gift.name.toLowerCase().includes(query) ||
        (gift.description?.toLowerCase().includes(query) ?? false);

      const matchesAvailability = !onlyAvailable || availableQty(gift) > 0;

      const matchesPrice =
        priceRange === "all" ||
        (priceRange === "up-to-200" && gift.priceCents <= 20_000) ||
        (priceRange === "200-to-500" && gift.priceCents > 20_000 && gift.priceCents <= 50_000) ||
        (priceRange === "500-plus" && gift.priceCents > 50_000);

      if (!query) {
        return matchesAvailability && matchesPrice;
      }

      return matchesSearch && matchesAvailability && matchesPrice;
    });

    if (sort === "price-asc") {
      rows = [...rows].sort((left, right) => left.priceCents - right.priceCents);
    }

    if (sort === "price-desc") {
      rows = [...rows].sort((left, right) => right.priceCents - left.priceCents);
    }

    if (sort === "available-desc") {
      rows = [...rows].sort((left, right) => availableQty(right) - availableQty(left));
    }

    return rows;
  }, [gifts, onlyAvailable, priceRange, search, sort]);

  const totalAvailable = useMemo(
    () => gifts.reduce((sum, gift) => sum + availableQty(gift), 0),
    [gifts],
  );

  return (
    <div className="gifts-shell">
      <GiftCheckoutSteps current="catalog" />

      {feedback ? <p className="gift-form-success">{feedback}</p> : null}

      <div className="gift-grid">
        <GiftsSidebar
          search={search}
          sort={sort}
          priceRange={priceRange}
          onlyAvailable={onlyAvailable}
          total={gifts.length}
          available={totalAvailable}
          onSearchChange={setSearch}
          onSortChange={setSort}
          onPriceRangeChange={setPriceRange}
          onOnlyAvailableChange={setOnlyAvailable}
        />

        <div className="gift-list-panel">
          {filtered.length === 0 ? (
            <div className="gift-empty-state">
              Nenhum presente combina com essa busca. Tente outro termo para localizar o item.
            </div>
          ) : (
            <div className="gift-cards">
              {filtered.map((gift) => (
                <GiftCard
                  key={gift.id}
                  gift={gift}
                  highlighted={gift.id === initialGiftId}
                  inCart={isInCart(gift.id)}
                  onAddToCart={(row, quantity) => {
                    addToCart(row.id, quantity);
                    setFeedback(`"${row.name}" foi adicionado ao carrinho.`);
                    window.setTimeout(() => setFeedback(null), 2400);
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
