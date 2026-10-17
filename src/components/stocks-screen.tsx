"use client";

import Link from "next/link";
import { useState } from "react";
import { PageHeader } from "@/components/ui";
import { ROBINHOOD_CHAIN } from "@/lib/chain";
import { shortAddr } from "@/lib/format";
import { STOCKS, type StockToken } from "@/lib/stocks";

export function StocksScreen() {
  const [copied, setCopied] = useState<string | null>(null);

  async function copy(stock: StockToken) {
    try {
      await navigator.clipboard.writeText(stock.address);
      setCopied(stock.symbol);
      window.setTimeout(() => setCopied(null), 1500);
    } catch {
      setCopied(null);
    }
  }

  return (
    <main className="wrap py-6">
      <PageHeader
        kicker="Fair stocks"
        title="Quote a real stock token"
        lede="These are the canonical Robinhood Chain stock tokens. A Sherwood launch can pair against one of them instead of ETH."
      />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {STOCKS.map((stock) => (
          <article key={stock.symbol} className="rounded-2xl border border-line bg-forest p-4">
            <div className="flex items-center gap-3">
              <StockLogo stock={stock} />
              <div className="min-w-0">
                <h2 className="font-display text-xl font-extrabold">{stock.symbol}</h2>
                <p className="truncate text-sm text-mute">{stock.name}</p>
              </div>
            </div>
            <p className="mt-4 font-mono text-xs text-mute">{shortAddr(stock.address)}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link href={`/create?quote=${stock.symbol}`} className="inline-flex h-9 items-center rounded-xl bg-[var(--action-bg)] px-3 text-xs font-bold" style={{ color: "var(--action-fg)" }}>
                Pair a launch
              </Link>
              <button type="button" onClick={() => void copy(stock)} className="inline-flex h-9 items-center rounded-xl border border-line px-3 text-xs text-mute">
                {copied === stock.symbol ? "Copied" : "Copy address"}
              </button>
              <a
                href={`${ROBINHOOD_CHAIN.explorer}/token/${stock.address}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-9 items-center rounded-xl border border-line px-3 text-xs text-mute"
              >
                Explorer
              </a>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}

function StockLogo({ stock }: { stock: StockToken }) {
  const [ok, setOk] = useState(true);
  if (!ok) {
    return (
      <span className="grid h-11 w-11 place-items-center rounded-xl bg-lime font-display text-xs font-extrabold text-ink">
        {stock.symbol.slice(0, 2)}
      </span>
    );
  }
  return (
    <img
      src={stock.logoUrl}
      alt=""
      width={44}
      height={44}
      className="h-11 w-11 rounded-xl bg-white object-cover"
      onError={() => setOk(false)}
    />
  );
}
