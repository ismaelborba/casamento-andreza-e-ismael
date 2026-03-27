"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { GiftCard } from "@/src/components/sections/gifts/GiftCard";
import { GiftCheckoutSteps } from "@/src/components/sections/gifts/GiftCheckoutSteps";
import { showGiftAddedToast } from "@/src/components/sections/gifts/cart-toast";
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
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortValue>("default");
  const [priceRange, setPriceRange] = useState<PriceRangeValue>("all");
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const { addToCart, isInCart } = useGiftCart(gifts);

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

  const activeFiltersCount = useMemo(() => {
    let count = 0;

    if (search.trim()) count += 1;
    if (priceRange !== "all") count += 1;
    if (sort !== "default") count += 1;
    if (onlyAvailable) count += 1;

    return count;
  }, [onlyAvailable, priceRange, search, sort]);

  useEffect(() => {
    if (!mobileFiltersOpen || typeof document === "undefined") {
      return;
    }

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [mobileFiltersOpen]);

  useEffect(() => {
    if (!mobileFiltersOpen || typeof window === "undefined") {
      return;
    }

    function handleResize() {
      if (window.innerWidth > 860) {
        setMobileFiltersOpen(false);
      }
    }

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [mobileFiltersOpen]);

  return (
    <div className="gifts-shell">
      <GiftCheckoutSteps current="catalog" />

      <section className="gift-mobile-discovery">
        <div className="gift-mobile-discovery-head">
          <div>
            <strong>{filtered.length} presentes na vitrine</strong>
            <span>
              {activeFiltersCount
                ? `${activeFiltersCount} filtro(s) aplicado(s)`
                : `${totalAvailable} cotas disponiveis para escolher`}
            </span>
          </div>

          <button
            type="button"
            className="gift-mobile-filter-toggle"
            aria-expanded={mobileFiltersOpen}
            aria-controls="gift-mobile-filters"
            onClick={() => setMobileFiltersOpen((current) => !current)}
          >
            {mobileFiltersOpen
              ? "Fechar filtros"
              : activeFiltersCount
                ? `Filtros (${activeFiltersCount})`
                : "Abrir filtros"}
          </button>
        </div>

        <input
          className="gift-input gift-mobile-search-input"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Buscar presente"
        />
      </section>

      {mobileFiltersOpen ? (
        <button
          type="button"
          className="gift-mobile-sidebar-backdrop"
          aria-label="Fechar filtros"
          onClick={() => setMobileFiltersOpen(false)}
        />
      ) : null}

      <div className="gift-grid">
        <GiftsSidebar
          search={search}
          sort={sort}
          priceRange={priceRange}
          onlyAvailable={onlyAvailable}
          total={gifts.length}
          available={totalAvailable}
          matchingCount={filtered.length}
          activeFiltersCount={activeFiltersCount}
          mobileOpen={mobileFiltersOpen}
          onMobileClose={() => setMobileFiltersOpen(false)}
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
                    showGiftAddedToast({
                      giftName: row.name,
                      quantity,
                      subtotalCents: row.priceCents * quantity,
                      onViewCart: () => router.push("/gifts/cart"),
                    });
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
