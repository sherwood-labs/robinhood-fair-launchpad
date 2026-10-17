import { mcap } from "@/lib/curve";
import type { Token } from "@/lib/types";

export type FilterId = "all" | "graduating" | "new" | "graduated" | "stocks";
export type SortId = "trending" | "mcap" | "newest" | "raised";

export const FILTERS: { id: FilterId; label: string }[] = [
  { id: "all", label: "All" },
  { id: "graduating", label: "Graduating" },
  { id: "new", label: "New" },
  { id: "graduated", label: "Graduated" },
  { id: "stocks", label: "Stock pairs" },
];

export const SORTS: { id: SortId; label: string }[] = [
  { id: "trending", label: "Trending" },
  { id: "mcap", label: "Market cap" },
  { id: "newest", label: "Newest" },
  { id: "raised", label: "Raised" },
];

export function isFilter(value: string | null): value is FilterId {
  return FILTERS.some((item) => item.id === value);
}

export function filterTokens(tokens: Token[], filter: FilterId, now: number) {
  if (filter === "graduating") {
    return tokens.filter((token) => !token.graduated && token.raisedEth / token.curveEth >= 0.6);
  }
  if (filter === "new") return tokens.filter((token) => now - token.createdAt < 48 * 60 * 60 * 1000);
  if (filter === "graduated") return tokens.filter((token) => token.graduated);
  if (filter === "stocks") return tokens.filter((token) => token.quote !== "ETH");
  return tokens;
}

function trendingScore(token: Token) {
  return token.volume24h * (1 + Math.max(0, token.change24h) / 80) + (token.graduated ? 0 : token.raisedEth * 800);
}

export function sortTokens(tokens: Token[], sort: SortId) {
  const list = [...tokens];
  if (sort === "mcap") list.sort((a, b) => mcap(b) - mcap(a));
  else if (sort === "newest") list.sort((a, b) => b.createdAt - a.createdAt);
  else if (sort === "raised") list.sort((a, b) => b.raisedEth / b.curveEth - a.raisedEth / a.curveEth);
  else list.sort((a, b) => trendingScore(b) - trendingScore(a));
  return list;
}
