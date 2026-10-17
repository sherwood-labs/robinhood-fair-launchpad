import raw from "@/data/stockTokens.json";

type StockFile = {
  chainId: number;
  tokens: {
    symbol: string;
    name: string;
    address: string;
    decimals: number;
    logoUrl: string;
  }[];
};

const file = raw as StockFile;

export type StockToken = {
  symbol: string;
  name: string;
  address: string;
  decimals: number;
  logoUrl: string;
};

export const STOCKS: StockToken[] = file.tokens.map((token) => ({
  symbol: token.symbol,
  name: token.name,
  address: token.address,
  decimals: token.decimals,
  logoUrl: token.logoUrl,
}));

export function stockBySymbol(symbol: string) {
  return STOCKS.find((stock) => stock.symbol.toLowerCase() === symbol.toLowerCase()) ?? null;
}

export function normalizeQuote(quote: string) {
  if (!quote || quote.toUpperCase() === "ETH") return "ETH";
  return stockBySymbol(quote)?.symbol ?? "ETH";
}
