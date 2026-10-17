import { CURVE_SLOPE, ETH_USD, priceAt } from "@/lib/curve";
import { hashString } from "@/lib/format";
import type { Collection, Token, Trade } from "@/lib/types";

const ANCHOR = Date.UTC(2026, 9, 17, 16, 0, 0);
const HOUR = 60 * 60 * 1000;

type Draft = {
  id: string;
  name: string;
  symbol: string;
  description: string;
  hue: number;
  quote: string;
  priceUsd: number;
  change24h: number;
  volume24h: number;
  holders: number;
  raisedEth: number;
  curveEth: number;
  graduated?: boolean;
  trades24h: number;
  hoursAgo: number;
};

function wallet(seed: string) {
  let hex = "";
  let x = hashString(seed) || 1;
  while (hex.length < 40) {
    x = Math.imul(x ^ (x >>> 13), 2246822507) >>> 0;
    hex += x.toString(16).padStart(8, "0");
  }
  return `0x${hex.slice(0, 40)}`;
}

function makeToken(draft: Draft): Token {
  const graduated = Boolean(draft.graduated) || draft.raisedEth >= draft.curveEth;
  const progress = graduated ? 1 : draft.raisedEth / draft.curveEth;
  const basePriceUsd = draft.priceUsd / (1 + progress * CURVE_SLOPE);
  const avg = (basePriceUsd + draft.priceUsd) / 2;
  const sold = Math.min(1_000_000_000, (draft.raisedEth * ETH_USD) / avg);
  return {
    id: draft.id,
    name: draft.name,
    symbol: draft.symbol,
    description: draft.description,
    image: null,
    hue: draft.hue,
    creator: wallet(`${draft.id}-creator`),
    createdAt: ANCHOR - draft.hoursAgo * HOUR,
    quote: draft.quote,
    basePriceUsd,
    priceUsd: draft.priceUsd,
    change24h: draft.change24h,
    volume24h: draft.volume24h,
    liquidityUsd: draft.raisedEth * ETH_USD * (graduated ? 1.6 : 1),
    holders: draft.holders,
    supply: 1_000_000_000,
    sold,
    raisedEth: draft.raisedEth,
    curveEth: draft.curveEth,
    graduated,
    trades24h: draft.trades24h,
  };
}

const DRAFTS: Draft[] = [
  {
    id: "grnw",
    name: "Greenwood",
    symbol: "GRNW",
    description: "The house curve. A fixed billion supply, priced only by what traders pay in.",
    hue: 78,
    quote: "ETH",
    priceUsd: 0.000042,
    change24h: 18.4,
    volume24h: 84200,
    holders: 312,
    raisedEth: 6.4,
    curveEth: 8,
    trades24h: 186,
    hoursAgo: 36,
  },
  {
    id: "bow",
    name: "Longbow",
    symbol: "BOW",
    description: "A straight ETH pair for people who want the curve and nothing else.",
    hue: 96,
    quote: "ETH",
    priceUsd: 0.000015,
    change24h: 6.2,
    volume24h: 22100,
    holders: 140,
    raisedEth: 2.15,
    curveEth: 8,
    trades24h: 74,
    hoursAgo: 20,
  },
  {
    id: "cano",
    name: "Canopy",
    symbol: "CANO",
    description: "Filled its raise and graduated. Trading stays open on the Sherwood desk.",
    hue: 58,
    quote: "ETH",
    priceUsd: 0.00021,
    change24h: -3.1,
    volume24h: 190400,
    holders: 980,
    raisedEth: 8,
    curveEth: 8,
    graduated: true,
    trades24h: 410,
    hoursAgo: 120,
  },
  {
    id: "qvr",
    name: "Quiver",
    symbol: "QVR",
    description: "Quoted in the GameStop stock token. Same curve, a stock for the pair.",
    hue: 110,
    quote: "GME",
    priceUsd: 0.000033,
    change24h: 24.8,
    volume24h: 120300,
    holders: 540,
    raisedEth: 5.2,
    curveEth: 8,
    trades24h: 266,
    hoursAgo: 14,
  },
  {
    id: "orch",
    name: "Orchard",
    symbol: "ORCH",
    description: "A launch quoted in the Apple stock token on Robinhood Chain.",
    hue: 42,
    quote: "AAPL",
    priceUsd: 0.000019,
    change24h: 4.4,
    volume24h: 41000,
    holders: 210,
    raisedEth: 3.4,
    curveEth: 6,
    trades24h: 98,
    hoursAgo: 52,
  },
  {
    id: "nshd",
    name: "Nightshade",
    symbol: "NSHD",
    description: "Just opened. The price is still close to the forest floor.",
    hue: 150,
    quote: "ETH",
    priceUsd: 0.0000091,
    change24h: 41.2,
    volume24h: 9600,
    holders: 76,
    raisedEth: 0.84,
    curveEth: 8,
    trades24h: 41,
    hoursAgo: 3,
  },
  {
    id: "flch",
    name: "Fletching",
    symbol: "FLCH",
    description: "Quoted in the NVIDIA stock token, near the top of its curve.",
    hue: 86,
    quote: "NVDA",
    priceUsd: 0.000088,
    change24h: 11.2,
    volume24h: 76000,
    holders: 404,
    raisedEth: 7.15,
    curveEth: 8,
    trades24h: 155,
    hoursAgo: 28,
  },
  {
    id: "gldw",
    name: "Gladewatch",
    symbol: "GLDW",
    description: "Quoted in the Tesla stock token. A slower day on the tape.",
    hue: 28,
    quote: "TSLA",
    priceUsd: 0.000027,
    change24h: -8.6,
    volume24h: 33000,
    holders: 188,
    raisedEth: 4.4,
    curveEth: 8,
    trades24h: 83,
    hoursAgo: 70,
  },
  {
    id: "ymn",
    name: "Yeoman",
    symbol: "YMN",
    description: "Early holders, a shallow raise, and room left on the curve.",
    hue: 124,
    quote: "ETH",
    priceUsd: 0.000011,
    change24h: 2.1,
    volume24h: 5400,
    holders: 61,
    raisedEth: 1.25,
    curveEth: 8,
    trades24h: 29,
    hoursAgo: 9,
  },
  {
    id: "mbd",
    name: "Merryband",
    symbol: "MBD",
    description: "Graduated. Quoted in the Meta stock token.",
    hue: 70,
    quote: "META",
    priceUsd: 0.00016,
    change24h: 1.4,
    volume24h: 64000,
    holders: 720,
    raisedEth: 8,
    curveEth: 8,
    graduated: true,
    trades24h: 132,
    hoursAgo: 200,
  },
];

export const SEED_TOKENS: Token[] = DRAFTS.map(makeToken);

function seedTrades(token: Token): Trade[] {
  const count = 5;
  const trades: Trade[] = [];
  for (let i = 0; i < count; i++) {
    const n = hashString(`${token.id}:${i}`);
    const side = n % 4 === 0 ? "sell" : "buy";
    const eth = 0.02 + (n % 280) / 1000;
    const progress = i / (count - 1);
    const price = priceAt(token.basePriceUsd, token.graduated ? 0.72 + progress * 0.28 : curveProgress(token) * progress);
    const spot = price > 0 ? price : token.priceUsd;
    trades.push({
      id: `${token.id}-seed-${i}`,
      tokenId: token.id,
      side,
      eth,
      tokens: (eth * ETH_USD) / spot,
      price: spot,
      wallet: wallet(`${token.id}-trade-${i}`),
      at: token.createdAt + (i + 1) * 3 * HOUR,
    });
  }
  return trades;
}

function curveProgress(token: Token) {
  return token.graduated ? 1 : token.raisedEth / token.curveEth;
}

export const SEED_TRADES: Trade[] = SEED_TOKENS.flatMap(seedTrades);

export const COLLECTIONS: Collection[] = [
  {
    slug: "archers",
    name: "Sherwood Archers",
    blurb: "A 3,333 piece band. Mint along a flat price until the quiver is empty.",
    supply: 3333,
    minted: 2140,
    priceEth: 0.012,
    hue: 78,
  },
  {
    slug: "spirits",
    name: "Greenwood Spirits",
    blurb: "Night shapes from the tree line. A smaller supply and a higher mint.",
    supply: 999,
    minted: 640,
    priceEth: 0.028,
    hue: 140,
  },
  {
    slug: "canopy-cuts",
    name: "Canopy Cuts",
    blurb: "Square studies of leaves and light. Free of a bonding curve — pay the mint and keep it.",
    supply: 5000,
    minted: 880,
    priceEth: 0.006,
    hue: 96,
  },
  {
    slug: "merry-band",
    name: "Merry Band",
    blurb: "Portraits of the company. Most of the supply is already out.",
    supply: 1500,
    minted: 1410,
    priceEth: 0.02,
    hue: 48,
  },
  {
    slug: "oak-council",
    name: "Oak Council",
    blurb: "Ten seats, drawn as rings of an old oak. A short collection.",
    supply: 250,
    minted: 96,
    priceEth: 0.08,
    hue: 32,
  },
  {
    slug: "night-glade",
    name: "Night Glade",
    blurb: "A dark set that just opened. The mint is the lowest on the pad.",
    supply: 4444,
    minted: 210,
    priceEth: 0.004,
    hue: 160,
  },
];
