"use client";

import { createContext, useContext, useEffect, useMemo, useSyncExternalStore } from "react";
import { errorMessage, ensureRobinhoodChain, ROBINHOOD_CHAIN } from "@/lib/chain";
import {
  DEFAULT_CURVE_ETH,
  DEFAULT_SUPPLY,
  ETH_USD,
  previewBuy,
  previewSell,
  START_PRICE_USD,
} from "@/lib/curve";
import { hashString, round } from "@/lib/format";
import { COLLECTIONS, SEED_TOKENS, SEED_TRADES } from "@/lib/seed";
import { normalizeQuote } from "@/lib/stocks";
import type { CreateInput, MarketState, Token, Trade } from "@/lib/types";

const STORAGE_KEY = "sherwood-market-v1";
const WALLET_KEY = "sherwood-wallet-v1";
const PREVIEW_KEY = "sherwood-preview-address";

type WalletKind = "injected" | "preview";

type Result<T> = { ok: true; data: T } | { ok: false; error: string };

type Snapshot = {
  market: MarketState;
  address: string | null;
  walletKind: WalletKind | null;
  chainId: number | null;
  now: number;
  notice: string | null;
  walletOpen: boolean;
  walletError: string | null;
  connecting: boolean;
};

type MarketContextValue = {
  ready: boolean;
  now: number;
  tokens: Token[];
  trades: Trade[];
  address: string | null;
  walletKind: WalletKind | null;
  chainId: number | null;
  connecting: boolean;
  walletOpen: boolean;
  walletError: string | null;
  notice: string | null;
  setWalletOpen: (open: boolean) => void;
  connectInjected: () => Promise<void>;
  connectPreview: () => void;
  disconnect: () => void;
  switchChain: () => Promise<void>;
  holding: (tokenId: string) => number;
  mintedOf: (slug: string) => number;
  walletMinted: (slug: string) => number;
  buy: (tokenId: string, eth: number) => Result<{ tokens: number; symbol: string }>;
  sell: (tokenId: string, tokens: number) => Result<{ eth: number; symbol: string }>;
  createToken: (input: CreateInput) => Result<{ id: string }>;
  mint: (slug: string, qty: number) => Result<{ qty: number; name: string }>;
  resetMarket: () => void;
};

function freshState(): MarketState {
  return {
    version: 1,
    tokens: SEED_TOKENS,
    trades: SEED_TRADES,
    balances: {},
    mintedExtra: {},
    walletMints: {},
  };
}

function loadState(): MarketState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return freshState();
    const parsed = JSON.parse(raw) as MarketState;
    if (!parsed || parsed.version !== 1 || !Array.isArray(parsed.tokens)) return freshState();
    return parsed;
  } catch {
    return freshState();
  }
}

function readWallet(): Pick<Snapshot, "address" | "walletKind" | "chainId"> {
  try {
    const saved = JSON.parse(localStorage.getItem(WALLET_KEY) || "null") as {
      kind?: WalletKind;
      address?: string;
    } | null;
    if ((saved?.kind === "preview" || saved?.kind === "injected") && saved.address) {
      return { address: saved.address, walletKind: saved.kind, chainId: null };
    }
  } catch {
    /* keep the desk usable if storage is unreadable */
  }
  return { address: null, walletKind: null, chainId: null };
}

function applyBuyToToken(token: Token, quote: Exclude<ReturnType<typeof previewBuy>, { error: string }>): Token {
  return {
    ...token,
    priceUsd: quote.nextPrice,
    raisedEth: quote.raised,
    graduated: quote.graduated,
    sold: round(token.sold + quote.tokens, 2),
    volume24h: token.volume24h + quote.filledEth * ETH_USD,
    trades24h: token.trades24h + 1,
    change24h: Math.max(-90, Math.min(500, token.change24h + 0.45)),
    liquidityUsd: quote.raised * ETH_USD * (quote.graduated ? 1.6 : 1),
  };
}

function applySellToToken(token: Token, quote: Exclude<ReturnType<typeof previewSell>, { error: string }>): Token {
  return {
    ...token,
    priceUsd: quote.nextPrice,
    raisedEth: quote.raised,
    sold: round(Math.max(0, token.sold - quote.tokens), 2),
    volume24h: token.volume24h + quote.eth * ETH_USD,
    trades24h: token.trades24h + 1,
    change24h: Math.max(-90, Math.min(500, token.change24h - 0.45)),
    liquidityUsd: quote.raised * ETH_USD * (token.graduated ? 1.6 : 1),
  };
}

const serverSnapshot: Snapshot = {
  market: freshState(),
  address: null,
  walletKind: null,
  chainId: null,
  now: 0,
  notice: null,
  walletOpen: false,
  walletError: null,
  connecting: false,
};

let snapshot: Snapshot = serverSnapshot;
const listeners = new Set<() => void>();
let noticeTimer = 0;

function emit() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getServerSnapshot() {
  return serverSnapshot;
}

function getSnapshot() {
  if (typeof window === "undefined") return serverSnapshot;
  if (snapshot === serverSnapshot) {
    snapshot = {
      ...serverSnapshot,
      market: loadState(),
      now: Date.now(),
      ...readWallet(),
    };
  }
  return snapshot;
}

function update(recipe: (current: Snapshot) => Snapshot) {
  const current = getSnapshot();
  let next = recipe(current);
  if (next.market !== current.market && typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next.market));
    } catch {
      next = { ...next, notice: "This browser blocked the save. Try a smaller image." };
    }
  }
  snapshot = next;
  emit();
}

function flash(message: string) {
  window.clearTimeout(noticeTimer);
  update((current) => ({ ...current, notice: message }));
  noticeTimer = window.setTimeout(() => {
    update((current) => (current.notice === message ? { ...current, notice: null } : current));
  }, 3200);
}

function saveWallet(kind: WalletKind | null, address: string | null) {
  if (!kind || !address) {
    localStorage.removeItem(WALLET_KEY);
    return;
  }
  localStorage.setItem(WALLET_KEY, JSON.stringify({ kind, address }));
}

const MarketContext = createContext<MarketContextValue | null>(null);

export function MarketProvider({ children }: { children: React.ReactNode }) {
  const snap = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  useEffect(() => {
    const eth = window.ethereum;
    if (!eth) return;
    let cancel = false;
    if (getSnapshot().walletKind === "injected") {
      void (async () => {
        try {
          const accounts = (await eth.request({ method: "eth_accounts" })) as string[];
          const hex = (await eth.request({ method: "eth_chainId" })) as string;
          if (cancel) return;
          update((current) => {
            if (current.walletKind !== "injected") return current;
            if (!accounts[0]) {
              saveWallet(null, null);
              return { ...current, address: null, walletKind: null, chainId: null };
            }
            saveWallet("injected", accounts[0]);
            return { ...current, address: accounts[0], chainId: Number.parseInt(hex, 16) };
          });
        } catch {
          /* the saved address still shows until the wallet answers */
        }
      })();
    }
    const onAccounts = (value: unknown) => {
      if (getSnapshot().walletKind !== "injected") return;
      const list = value as string[];
      if (!list[0]) {
        saveWallet(null, null);
        update((current) => ({ ...current, address: null, walletKind: null, chainId: null }));
        return;
      }
      saveWallet("injected", list[0]);
      update((current) => ({ ...current, address: list[0] }));
    };
    const onChain = (value: unknown) => {
      if (getSnapshot().walletKind !== "injected") return;
      update((current) => ({ ...current, chainId: Number.parseInt(String(value), 16) }));
    };
    eth.on?.("accountsChanged", onAccounts);
    eth.on?.("chainChanged", onChain);
    return () => {
      cancel = true;
      eth.removeListener?.("accountsChanged", onAccounts);
      eth.removeListener?.("chainChanged", onChain);
    };
  }, []);

  const value = useMemo<MarketContextValue>(() => {
    const holding = (tokenId: string) => {
      if (!snap.address) return 0;
      return snap.market.balances[snap.address.toLowerCase()]?.[tokenId] ?? 0;
    };
    const mintedOf = (slug: string) => {
      const base = COLLECTIONS.find((collection) => collection.slug === slug)?.minted ?? 0;
      return base + (snap.market.mintedExtra[slug] ?? 0);
    };
    const walletMinted = (slug: string) => {
      if (!snap.address) return 0;
      return snap.market.walletMints[snap.address.toLowerCase()]?.[slug] ?? 0;
    };

    return {
      ready: snap.now !== 0,
      now: snap.now,
      tokens: snap.market.tokens,
      trades: snap.market.trades,
      address: snap.address,
      walletKind: snap.walletKind,
      chainId: snap.chainId,
      connecting: snap.connecting,
      walletOpen: snap.walletOpen,
      walletError: snap.walletError,
      notice: snap.notice,
      setWalletOpen: (open: boolean) =>
        update((current) => ({ ...current, walletOpen: open, walletError: open ? current.walletError : null })),
      connectInjected: async () => {
        update((current) => ({ ...current, connecting: true, walletError: null }));
        try {
          const eth = window.ethereum;
          if (!eth) {
            update((current) => ({
              ...current,
              connecting: false,
              walletError: "No browser wallet found. Continue with a preview wallet, or install one.",
            }));
            return;
          }
          const accounts = (await eth.request({ method: "eth_requestAccounts" })) as string[];
          if (!accounts[0]) throw new Error("The wallet did not return an account.");
          await ensureRobinhoodChain(eth);
          const hex = (await eth.request({ method: "eth_chainId" })) as string;
          saveWallet("injected", accounts[0]);
          update((current) => ({
            ...current,
            connecting: false,
            address: accounts[0],
            walletKind: "injected",
            chainId: Number.parseInt(hex, 16),
            walletOpen: false,
            walletError: null,
          }));
          flash("Wallet connected on Robinhood Chain.");
        } catch (error) {
          update((current) => ({
            ...current,
            connecting: false,
            walletError: errorMessage(error, "Could not connect the wallet."),
          }));
        }
      },
      connectPreview: () => {
        let preview = localStorage.getItem(PREVIEW_KEY);
        if (!preview) {
          const bytes = crypto.getRandomValues(new Uint8Array(20));
          preview = `0x${Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("")}`;
          localStorage.setItem(PREVIEW_KEY, preview);
        }
        saveWallet("preview", preview);
        update((current) => ({
          ...current,
          address: preview,
          walletKind: "preview",
          chainId: null,
          walletOpen: false,
          walletError: null,
        }));
        flash("Preview wallet ready. Fills stay in this browser.");
      },
      disconnect: () => {
        saveWallet(null, null);
        update((current) => ({ ...current, address: null, walletKind: null, chainId: null }));
        flash("Wallet disconnected.");
      },
      switchChain: async () => {
        const eth = window.ethereum;
        if (!eth) return;
        try {
          await ensureRobinhoodChain(eth);
          const hex = (await eth.request({ method: "eth_chainId" })) as string;
          update((current) => ({ ...current, chainId: Number.parseInt(hex, 16) }));
        } catch (error) {
          flash(errorMessage(error, "Could not switch networks."));
        }
      },
      holding,
      mintedOf,
      walletMinted,
      buy: (tokenId, ethAmount) => {
        const current = getSnapshot();
        const wallet = current.address?.toLowerCase();
        if (!wallet) return { ok: false, error: "Connect a wallet first." };
        const token = current.market.tokens.find((item) => item.id === tokenId);
        if (!token) return { ok: false, error: "That token is not on the board." };
        const quote = previewBuy(token, ethAmount);
        if ("error" in quote) return { ok: false, error: quote.error };
        const had = current.market.balances[wallet]?.[tokenId] ?? 0;
        const nextToken = applyBuyToToken(token, quote);
        if (had <= 0) nextToken.holders += 1;
        const trade: Trade = {
          id: `t-${Date.now()}-${token.id}`,
          tokenId: token.id,
          side: "buy",
          eth: quote.filledEth,
          tokens: quote.tokens,
          price: quote.nextPrice,
          wallet,
          at: Date.now(),
        };
        update((prev) => ({
          ...prev,
          now: Date.now(),
          market: {
            ...prev.market,
            tokens: prev.market.tokens.map((item) => (item.id === token.id ? nextToken : item)),
            trades: [trade, ...prev.market.trades].slice(0, 80),
            balances: {
              ...prev.market.balances,
              [wallet]: {
                ...prev.market.balances[wallet],
                [tokenId]: round((prev.market.balances[wallet]?.[tokenId] ?? 0) + quote.tokens, 2),
              },
            },
          },
        }));
        flash(`Bought ${quote.tokens.toLocaleString("en-US")} ${token.symbol}. Saved in this browser.`);
        return { ok: true, data: { tokens: quote.tokens, symbol: token.symbol } };
      },
      sell: (tokenId, tokenAmount) => {
        const current = getSnapshot();
        const wallet = current.address?.toLowerCase();
        if (!wallet) return { ok: false, error: "Connect a wallet first." };
        const owned = current.market.balances[wallet]?.[tokenId] ?? 0;
        if (tokenAmount > owned + 1e-6) return { ok: false, error: "That is more than you hold." };
        const token = current.market.tokens.find((item) => item.id === tokenId);
        if (!token) return { ok: false, error: "That token is not on the board." };
        const quote = previewSell(token, Math.min(tokenAmount, owned));
        if ("error" in quote) return { ok: false, error: quote.error };
        const nextOwned = round(owned - quote.tokens, 2);
        const nextToken = applySellToToken(token, quote);
        if (nextOwned <= 0 && token.holders > 0) nextToken.holders = Math.max(0, token.holders - 1);
        const trade: Trade = {
          id: `t-${Date.now()}-${token.id}`,
          tokenId: token.id,
          side: "sell",
          eth: quote.eth,
          tokens: quote.tokens,
          price: quote.nextPrice,
          wallet,
          at: Date.now(),
        };
        update((prev) => ({
          ...prev,
          now: Date.now(),
          market: {
            ...prev.market,
            tokens: prev.market.tokens.map((item) => (item.id === token.id ? nextToken : item)),
            trades: [trade, ...prev.market.trades].slice(0, 80),
            balances: {
              ...prev.market.balances,
              [wallet]: { ...prev.market.balances[wallet], [tokenId]: Math.max(0, nextOwned) },
            },
          },
        }));
        flash(`Sold ${token.symbol} for ${quote.eth.toFixed(4)} ETH. Saved in this browser.`);
        return { ok: true, data: { eth: quote.eth, symbol: token.symbol } };
      },
      createToken: (input) => {
        const current = getSnapshot();
        const wallet = current.address;
        if (!wallet) return { ok: false, error: "Connect a wallet first." };
        const name = input.name.trim();
        const symbol = input.symbol.trim().toUpperCase();
        if (name.length < 2 || name.length > 32) return { ok: false, error: "Name should be 2–32 characters." };
        if (!/^[A-Z0-9]{2,8}$/.test(symbol)) return { ok: false, error: "Symbol should be 2–8 letters or numbers." };
        if (current.market.tokens.some((token) => token.symbol === symbol)) {
          return { ok: false, error: "That symbol is already on the board." };
        }
        const description = input.description.trim().slice(0, 280);
        const quoteAsset = normalizeQuote(input.quote);
        let id = symbol.toLowerCase();
        if (current.market.tokens.some((token) => token.id === id)) id = `${id}-${current.market.tokens.length + 1}`;
        let token: Token = {
          id,
          name,
          symbol,
          description: description || "A new Sherwood curve.",
          image: input.image,
          hue: (hashString(symbol) % 120) + 40,
          creator: wallet,
          createdAt: Date.now(),
          quote: quoteAsset,
          basePriceUsd: START_PRICE_USD,
          priceUsd: START_PRICE_USD,
          change24h: 0,
          volume24h: 0,
          liquidityUsd: 0,
          holders: 0,
          supply: DEFAULT_SUPPLY,
          sold: 0,
          raisedEth: 0,
          curveEth: DEFAULT_CURVE_ETH,
          graduated: false,
          trades24h: 0,
        };
        let trade: Trade | null = null;
        let balance = 0;
        if (input.initialEth > 0) {
          const quoted = previewBuy(token, input.initialEth);
          if ("error" in quoted) return { ok: false, error: quoted.error };
          token = applyBuyToToken(token, quoted);
          token.holders = 1;
          balance = quoted.tokens;
          trade = {
            id: `t-${Date.now()}-${id}`,
            tokenId: id,
            side: "buy",
            eth: quoted.filledEth,
            tokens: quoted.tokens,
            price: quoted.nextPrice,
            wallet: wallet.toLowerCase(),
            at: Date.now(),
          };
        }
        const key = wallet.toLowerCase();
        update((prev) => ({
          ...prev,
          now: Date.now(),
          market: {
            ...prev.market,
            tokens: [token, ...prev.market.tokens],
            trades: trade ? [trade, ...prev.market.trades].slice(0, 80) : prev.market.trades,
            balances: balance
              ? { ...prev.market.balances, [key]: { ...prev.market.balances[key], [id]: balance } }
              : prev.market.balances,
          },
        }));
        flash(`${symbol} is on the board.`);
        return { ok: true, data: { id } };
      },
      mint: (slug, qty) => {
        const current = getSnapshot();
        const wallet = current.address?.toLowerCase();
        if (!wallet) return { ok: false, error: "Connect a wallet first." };
        const collection = COLLECTIONS.find((item) => item.slug === slug);
        if (!collection) return { ok: false, error: "That collection is not listed." };
        if (!Number.isInteger(qty) || qty < 1 || qty > 10) return { ok: false, error: "Mint between 1 and 10." };
        const minted = collection.minted + (current.market.mintedExtra[slug] ?? 0);
        if (minted + qty > collection.supply) return { ok: false, error: "Not enough supply left." };
        update((prev) => ({
          ...prev,
          market: {
            ...prev.market,
            mintedExtra: { ...prev.market.mintedExtra, [slug]: (prev.market.mintedExtra[slug] ?? 0) + qty },
            walletMints: {
              ...prev.market.walletMints,
              [wallet]: {
                ...prev.market.walletMints[wallet],
                [slug]: (prev.market.walletMints[wallet]?.[slug] ?? 0) + qty,
              },
            },
          },
        }));
        flash(`Minted ${qty} ${collection.name}. Saved in this browser.`);
        return { ok: true, data: { qty, name: collection.name } };
      },
      resetMarket: () => {
        update((current) => ({ ...current, market: freshState() }));
        flash("Local market reset to the opening board.");
      },
    };
  }, [snap]);

  return <MarketContext.Provider value={value}>{children}</MarketContext.Provider>;
}

export function useMarket() {
  const context = useContext(MarketContext);
  if (!context) throw new Error("useMarket must be used inside MarketProvider");
  return context;
}

export { ROBINHOOD_CHAIN };
