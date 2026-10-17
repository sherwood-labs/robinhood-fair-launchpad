export type Side = "buy" | "sell";

export type Token = {
  id: string;
  name: string;
  symbol: string;
  description: string;
  image: string | null;
  hue: number;
  creator: string;
  createdAt: number;
  quote: string;
  basePriceUsd: number;
  priceUsd: number;
  change24h: number;
  volume24h: number;
  liquidityUsd: number;
  holders: number;
  supply: number;
  sold: number;
  raisedEth: number;
  curveEth: number;
  graduated: boolean;
  trades24h: number;
};

export type Trade = {
  id: string;
  tokenId: string;
  side: Side;
  eth: number;
  tokens: number;
  price: number;
  wallet: string;
  at: number;
};

export type Collection = {
  slug: string;
  name: string;
  blurb: string;
  supply: number;
  minted: number;
  priceEth: number;
  hue: number;
};

export type CreateInput = {
  name: string;
  symbol: string;
  description: string;
  image: string | null;
  quote: string;
  initialEth: number;
};

export type MarketState = {
  version: 1;
  tokens: Token[];
  trades: Trade[];
  balances: Record<string, Record<string, number>>;
  mintedExtra: Record<string, number>;
  walletMints: Record<string, Record<string, number>>;
};
