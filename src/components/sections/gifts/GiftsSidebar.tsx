"use client";

export type SortValue = "default" | "price-asc" | "price-desc" | "available-desc";
export type PriceRangeValue = "all" | "up-to-200" | "200-to-500" | "500-plus";

type Props = {
  search: string;
  sort: SortValue;
  priceRange: PriceRangeValue;
  onlyAvailable: boolean;
  total: number;
  available: number;
  onSearchChange: (value: string) => void;
  onSortChange: (value: SortValue) => void;
  onPriceRangeChange: (value: PriceRangeValue) => void;
  onOnlyAvailableChange: (value: boolean) => void;
};

export function GiftsSidebar({
  search,
  sort,
  priceRange,
  onlyAvailable,
  total,
  available,
  onSearchChange,
  onSortChange,
  onPriceRangeChange,
  onOnlyAvailableChange,
}: Props) {
  return (
    <aside className="gift-sidebar">
      <div className="gift-sidebar-block">
        <h3>Filtros</h3>
        <p>Refine a vitrine por faixa de valor e itens ainda disponíveis.</p>

        <div className="gift-sidebar-options">
          <label className="gift-check-row" htmlFor="gift-only-available">
            <input
              id="gift-only-available"
              type="checkbox"
              checked={onlyAvailable}
              onChange={(event) => onOnlyAvailableChange(event.target.checked)}
            />
            <span>Mostrar apenas presentes com cotas livres</span>
          </label>
        </div>
      </div>

      <div className="gift-sidebar-block">
        <h3>Buscar presente</h3>
        <p>Encontre rapidamente pelo nome ou por uma descrição curta.</p>
        <input
          className="gift-input"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Ex.: lua de mel"
        />
      </div>

      <div className="gift-sidebar-block">
        <h3>Faixa de valor</h3>
        <p>Escolha um intervalo para navegar como em uma loja tradicional.</p>
        <select
          className="gift-select"
          value={priceRange}
          onChange={(event) => onPriceRangeChange(event.target.value as PriceRangeValue)}
        >
          <option value="all">Todos os valores</option>
          <option value="up-to-200">Até R$ 200</option>
          <option value="200-to-500">De R$ 200 a R$ 500</option>
          <option value="500-plus">Acima de R$ 500</option>
        </select>
      </div>

      <div className="gift-sidebar-block">
        <h3>Ordenar vitrine</h3>
        <p>Escolha a melhor forma de explorar os itens disponíveis.</p>
        <select
          className="gift-select"
          value={sort}
          onChange={(event) => onSortChange(event.target.value as SortValue)}
        >
          <option value="default">Mais recentes</option>
          <option value="available-desc">Mais disponíveis</option>
          <option value="price-asc">Menor valor</option>
          <option value="price-desc">Maior valor</option>
        </select>
      </div>

      <div className="gift-sidebar-block">
        <h3>Resumo da loja</h3>
        <p>
          {total} presentes ativos e {available} cotas ainda disponíveis para compra.
        </p>
      </div>

      <div className="gift-sidebar-block">
        <h3>Etapas do pedido</h3>
        <p>
          Veja os produtos, abra a página do presente, adicione ao carrinho, preencha seus dados e finalize via Pix.
        </p>
      </div>
    </aside>
  );
}
