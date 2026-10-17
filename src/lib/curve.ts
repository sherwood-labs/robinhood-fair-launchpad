import { round } from "@/lib/format";
import type { Token } from "@/lib/types";

export const ETH_USD = 3420;
export const CURVE_SLOPE = 5.5;
export const START_PRICE_USD = 0.000008;
export const DEFAULT_CURVE_ETH = 8;
export const DEFAULT_SUPPLY = 1_000_000_000;
export const SELL_FEE = 0.02;

export function curveProgress(token: Pick<Token, "raisedEth" | "curveEth" | "graduated">) {
  if (token.graduated || token.curveEth <= 0) return token.graduated ? 1 : 0;
  return Math.min(1, Math.max(0, token.raisedEth / token.curveEth));
}

export function priceAt(basePriceUsd: number, progress: number) {
  return basePriceUsd * (1 + progress * CURVE_SLOPE);
}

export function mcap(token: Pick<Token, "priceUsd" | "supply">) {
  return token.priceUsd * token.supply;
}

export type BuyQuote = {
  filledEth: number;
  tokens: number;
  nextPrice: number;
  raised: number;
  graduated: boolean;
  impact: number;
};

export type SellQuote = {
  eth: number;
  feeEth: number;
  tokens: number;
  nextPrice: number;
  raised: number;
  impact: number;
};

export function previewBuy(token: Token, ethIn: number): BuyQuote | { error: string } {
  if (!Number.isFinite(ethIn) || ethIn <= 0) return { error: "Enter an ETH amount." };
  if (ethIn > 20) return { error: "Max 20 ETH per fill." };
  if (ethIn < 0.0001) return { error: "Minimum fill is 0.0001 ETH." };

  const remaining = token.supply - token.sold;
  if (remaining <= 1) return { error: "No supply left on this curve." };

  const live = token.graduated || token.raisedEth >= token.curveEth - 1e-8;
  if (!live) {
    const room = token.curveEth - token.raisedEth;
    const filledEth = Math.min(ethIn, Math.max(room, 0));
    const start = token.raisedEth / token.curveEth;
    const raised = token.raisedEth + filledEth;
    const end = raised / token.curveEth;
    const startPrice = priceAt(token.basePriceUsd, start);
    const nextPrice = priceAt(token.basePriceUsd, end);
    const avg = (startPrice + nextPrice) / 2;
    let tokens = (filledEth * ETH_USD) / avg;
    let usedEth = filledEth;
    if (tokens > remaining) {
      const scale = remaining / tokens;
      tokens = remaining;
      usedEth = filledEth * scale;
    }
    return {
      filledEth: round(usedEth, 8),
      tokens: round(tokens, 2),
      nextPrice,
      raised: round(token.raisedEth + usedEth, 8),
      graduated: token.raisedEth + usedEth >= token.curveEth - 1e-6,
      impact: token.priceUsd > 0 ? (nextPrice - token.priceUsd) / token.priceUsd : 0,
    };
  }

  const nextPrice = token.priceUsd * (1 + Math.min(0.22, ethIn * 0.28));
  const avg = (token.priceUsd + nextPrice) / 2;
  let tokens = (ethIn * ETH_USD) / avg;
  let usedEth = ethIn;
  if (tokens > remaining) {
    const scale = remaining / tokens;
    tokens = remaining;
    usedEth = ethIn * scale;
  }
  return {
    filledEth: round(usedEth, 8),
    tokens: round(tokens, 2),
    nextPrice,
    raised: token.raisedEth,
    graduated: true,
    impact: token.priceUsd > 0 ? (nextPrice - token.priceUsd) / token.priceUsd : 0,
  };
}

export function previewSell(token: Token, tokenAmount: number): SellQuote | { error: string } {
  if (!Number.isFinite(tokenAmount) || tokenAmount <= 0) return { error: "Enter a token amount." };
  const priceEth = token.priceUsd / ETH_USD;
  const gross = tokenAmount * priceEth;
  const feeEth = gross * SELL_FEE;
  let ethOut = gross - feeEth;
  const live = token.graduated || token.raisedEth >= token.curveEth - 1e-8;

  if (!live) {
    ethOut = Math.min(ethOut, token.raisedEth);
    const raised = Math.max(0, token.raisedEth - ethOut);
    const nextPrice = priceAt(token.basePriceUsd, raised / token.curveEth);
    return {
      eth: round(ethOut, 8),
      feeEth: round(feeEth, 8),
      tokens: round(tokenAmount, 2),
      nextPrice,
      raised: round(raised, 8),
      impact: token.priceUsd > 0 ? (nextPrice - token.priceUsd) / token.priceUsd : 0,
    };
  }

  const nextPrice = Math.max(token.basePriceUsd, token.priceUsd * (1 - Math.min(0.18, gross * 8)));
  return {
    eth: round(ethOut, 8),
    feeEth: round(feeEth, 8),
    tokens: round(tokenAmount, 2),
    nextPrice,
    raised: token.raisedEth,
    impact: token.priceUsd > 0 ? (nextPrice - token.priceUsd) / token.priceUsd : 0,
  };
}
