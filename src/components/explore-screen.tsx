"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { MarketList } from "@/components/market-list";
import { PageHeader } from "@/components/ui";
import { FILTERS, filterTokens, isFilter, SORTS, sortTokens, type FilterId, type SortId } from "@/lib/board";
import { useMarket } from "@/lib/market";

export function ExploreScreen() {
  const params = useSearchParams();
  const { tokens, ready, now } = useMarket();
  const fromUrl = params.get("filter");
  const [picked, setPicked] = useState<FilterId | null>(null);
  const filter = picked ?? (isFilter(fromUrl) ? fromUrl : "all");
  const [sort, setSort] = useState<SortId>("trending");
  const [query, setQuery] = useState("");
  const clock = now || Date.UTC(2026, 9, 17, 16, 0, 0);

  const rows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const filtered = filterTokens(tokens, filter, clock).filter((token) => {
      if (!needle) return true;
      return token.name.toLowerCase().includes(needle) || token.symbol.toLowerCase().includes(needle);
    });
    return sortTokens(filtered, sort);
  }, [tokens, filter, sort, query, clock]);

  return (
    <main className="wrap section">
      <PageHeader
        kicker="Market"
        title="The board"
        lede="Sherwood curves on Robinhood Chain. Filter by how full the raise is, or by stock pairs."
      />
      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="seg flex-wrap">
          {FILTERS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setPicked(item.id)}
              className={filter === item.id ? "on" : ""}
            >
              {item.label}
            </button>
          ))}
        </div>
        <div className="flex gap-2 lg:ml-auto">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Filter by name"
            aria-label="Filter by name"
            className="h-10 w-full rounded-xl border border-line bg-forest px-4 text-sm outline-none focus:border-[var(--line-2)] lg:w-52"
          />
          <label className="sr-only" htmlFor="sort">
            Sort
          </label>
          <select
            id="sort"
            value={sort}
            onChange={(event) => setSort(event.target.value as SortId)}
            className="h-10 rounded-xl border border-line bg-forest px-3 text-sm outline-none"
          >
            {SORTS.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      <MarketList tokens={rows} now={now} loading={!ready} />
    </main>
  );
}
