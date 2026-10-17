"use client";

import Link from "next/link";
import { PageHeader, TokenMark, limeButton } from "@/components/ui";
import { mcap } from "@/lib/curve";
import { shortAddr, tokenAmount, usd } from "@/lib/format";
import { useMarket } from "@/lib/market";

export function PortfolioScreen() {
  const { ready, address, walletKind, tokens, trades, holding, setWalletOpen, resetMarket, chainId } = useMarket();
  const key = address?.toLowerCase() ?? "";
  const holdings = tokens
    .map((token) => ({ token, amount: holding(token.id) }))
    .filter((row) => row.amount > 0);
  const value = holdings.reduce((sum, row) => sum + row.amount * row.token.priceUsd, 0);
  const created = tokens.filter((token) => token.creator.toLowerCase() === key);
  const mine = trades.filter((trade) => trade.wallet === key).slice(0, 8);

  return (
    <main className="wrap py-6">
      <PageHeader
        kicker="Portfolio"
        title={address ? shortAddr(address) : "No wallet yet"}
        lede={
          walletKind === "preview"
            ? "Preview wallet. Balances below live in this browser."
            : walletKind === "injected"
              ? `Browser wallet${chainId ? ` · chain ${chainId}` : ""}. Trades still settle locally in this build.`
              : "Connect to see holdings, or open a preview wallet and trade the board."
        }
      />
      {!address ? (
        <button type="button" className={limeButton} onClick={() => setWalletOpen(true)}>
          Connect
        </button>
      ) : (
        <div className="mb-8 grid gap-3 sm:grid-cols-3">
          <Stat label="Held value" value={ready ? usd(value) : "—"} />
          <Stat label="Tokens" value={ready ? String(holdings.length) : "—"} />
          <Stat label="Launches" value={ready ? String(created.length) : "—"} />
        </div>
      )}

      <section className="mt-8">
        <h2 className="font-display text-2xl font-extrabold">Holdings</h2>
        <div className="mt-3 overflow-hidden rounded-2xl border border-line">
          {holdings.length ? (
            holdings.map(({ token, amount }) => (
              <Link key={token.id} href={`/token/${token.id}`} className="flex items-center gap-3 border-b border-line px-4 py-3 last:border-b-0 hover:bg-moss/40">
                <TokenMark token={token} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-semibold">{token.name}</span>
                  <span className="font-mono text-[11px] text-mute">{token.symbol}</span>
                </span>
                <span className="text-right">
                  <span className="block font-mono text-sm">{tokenAmount(amount)}</span>
                  <span className="font-mono text-[11px] text-mute">{usd(amount * token.priceUsd)}</span>
                </span>
              </Link>
            ))
          ) : (
            <p className="px-4 py-8 text-sm text-mute">
              No tokens yet.{" "}
              <Link href="/explore" className="text-lime">
                The market is open.
              </Link>
            </p>
          )}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="font-display text-2xl font-extrabold">Your launches</h2>
        <div className="mt-3 grid gap-3">
          {created.length ? (
            created.map((token) => (
              <Link key={token.id} href={`/token/${token.id}`} className="flex items-center justify-between rounded-2xl border border-line px-4 py-3 hover:border-lime/40">
                <span>
                  <span className="block font-semibold">{token.name}</span>
                  <span className="font-mono text-xs text-mute">{token.symbol} · {token.quote}</span>
                </span>
                <span className="font-mono text-sm">{usd(mcap(token))}</span>
              </Link>
            ))
          ) : (
            <p className="text-sm text-mute">
              You have not opened a curve.{" "}
              <Link href="/create" className="text-lime">
                Launch one.
              </Link>
            </p>
          )}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="font-display text-2xl font-extrabold">Your fills</h2>
        <div className="mt-3 overflow-hidden rounded-2xl border border-line">
          {mine.length ? (
            mine.map((trade) => (
              <div key={trade.id} className="flex items-center justify-between border-b border-line px-4 py-3 text-sm last:border-b-0">
                <span className={trade.side === "buy" ? "text-lime" : "text-down"}>{trade.side}</span>
                <Link href={`/token/${trade.tokenId}`} className="font-mono text-xs text-mute">
                  {trade.tokenId}
                </Link>
                <span className="font-mono text-xs">{trade.eth.toFixed(4)} ETH</span>
              </div>
            ))
          ) : (
            <p className="px-4 py-6 text-sm text-mute">No fills from this wallet.</p>
          )}
        </div>
      </section>

      <button
        type="button"
        className="mt-10 text-sm text-mute underline-offset-4 hover:text-down hover:underline"
        onClick={() => {
          if (window.confirm("Clear launches, trades, and mints stored in this browser?")) resetMarket();
        }}
      >
        Reset local market
      </button>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-line bg-canopy px-4 py-4">
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-mute">{label}</p>
      <p className="mt-1 font-mono text-xl">{value}</p>
    </div>
  );
}
