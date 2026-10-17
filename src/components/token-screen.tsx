"use client";

import Link from "next/link";
import { PriceChart } from "@/components/price-chart";
import { TradePanel } from "@/components/trade-panel";
import { PageHeader, TokenMark } from "@/components/ui";
import { ROBINHOOD_CHAIN } from "@/lib/chain";
import { mcap } from "@/lib/curve";
import { age, changeClass, eth, pct, shortAddr, tokenAmount, usd } from "@/lib/format";
import { useMarket } from "@/lib/market";
import { stockBySymbol } from "@/lib/stocks";

export function TokenScreen({ id }: { id: string }) {
  const { tokens, trades, ready, now } = useMarket();
  if (!ready) {
    return (
      <main className="wrap py-6">
        <div className="h-40 animate-pulse rounded-3xl bg-moss/80" />
      </main>
    );
  }
  const token = tokens.find((item) => item.id === id);
  if (!token) {
    return (
      <main className="wrap py-6">
        <PageHeader kicker="Missing" title="That curve is not on the board." lede="It may have been cleared from this browser." />
        <Link href="/explore" className="text-sm font-semibold text-lime">
          Back to the market
        </Link>
      </main>
    );
  }
  const stock = token.quote === "ETH" ? null : stockBySymbol(token.quote);
  const recent = trades.filter((trade) => trade.tokenId === token.id).slice(0, 8);

  return (
      <main className="wrap grid gap-6 py-6 lg:grid-cols-[minmax(0,1fr)_360px]">
      <div>
        <div className="flex items-center gap-4">
          <TokenMark token={token} size={64} />
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-mute">
              {token.graduated ? "Graduated" : "On the curve"} · {token.quote === "ETH" ? "ETH pair" : `${token.quote} pair`}
            </p>
            <h1 className="truncate text-2xl font-extrabold tracking-tight">{token.name}</h1>
            <p className="font-mono text-sm text-mute">
              {token.symbol} · {age(token.createdAt, now)}
            </p>
          </div>
        </div>
        <div className="mt-6 rounded-2xl border border-line bg-forest p-4">
          <div className="mb-2 flex items-end justify-between px-2">
            <p className="font-mono text-2xl">{usd(token.priceUsd)}</p>
            <p className={`font-mono text-sm ${changeClass(token.change24h)}`}>{pct(token.change24h)}</p>
          </div>
          <PriceChart token={token} trades={trades} />
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Fact label="Market cap" value={usd(mcap(token))} />
          <Fact label="24h volume" value={usd(token.volume24h)} />
          <Fact label="Raised" value={eth(token.raisedEth)} />
          <Fact label="Holders" value={token.holders.toLocaleString("en-US")} />
        </div>
        <section className="mt-6 rounded-2xl border border-line bg-forest p-5">
          <h2 className="text-lg font-extrabold">About</h2>
          <p className="mt-2 text-sm leading-relaxed text-mute">{token.description}</p>
          <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
            <FactInline label="Creator" value={shortAddr(token.creator)} />
            <FactInline label="Supply" value={tokenAmount(token.supply)} />
            <FactInline label="Quote" value={token.quote} />
            <FactInline label="Curve target" value={eth(token.curveEth)} />
          </dl>
          {stock ? (
            <a
              href={`${ROBINHOOD_CHAIN.explorer}/token/${stock.address}`}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex text-sm font-semibold text-lime"
            >
              {stock.symbol} stock token on Blockscout
            </a>
          ) : null}
        </section>
        <section className="mt-6">
          <h2 className="text-lg font-extrabold">Recent fills</h2>
          <div className="mt-3 overflow-hidden rounded-2xl border border-line bg-forest">
            {recent.length ? (
              recent.map((trade) => (
                <div key={trade.id} className="grid grid-cols-[72px_1fr_auto] items-center gap-3 border-b border-line px-4 py-3 text-sm last:border-b-0">
                  <span className={trade.side === "buy" ? "font-semibold text-lime" : "font-semibold text-down"}>
                    {trade.side === "buy" ? "Buy" : "Sell"}
                  </span>
                  <span className="truncate font-mono text-xs text-mute">
                    {tokenAmount(trade.tokens)} {token.symbol} · {shortAddr(trade.wallet)}
                  </span>
                  <span className="font-mono text-xs">{eth(trade.eth)}</span>
                </div>
              ))
            ) : (
              <p className="px-4 py-6 text-sm text-mute">No fills yet.</p>
            )}
          </div>
        </section>
      </div>
      <TradePanel token={token} />
    </main>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-line bg-forest px-4 py-3">
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-mute">{label}</p>
      <p className="mt-1 font-mono text-sm text-mist">{value}</p>
    </div>
  );
}

function FactInline({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl bg-forest px-3 py-2">
      <dt className="text-mute">{label}</dt>
      <dd className="font-mono text-mist">{value}</dd>
    </div>
  );
}
