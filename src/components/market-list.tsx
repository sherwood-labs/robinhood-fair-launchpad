import Link from "next/link";
import { curveProgress, mcap } from "@/lib/curve";
import { age, changeClass, pct, usd } from "@/lib/format";
import type { Token } from "@/lib/types";
import { CurveBar, TokenMark } from "@/components/ui";

export function MarketList({
  tokens,
  now,
  loading,
}: {
  tokens: Token[];
  now: number;
  loading?: boolean;
}) {
  if (loading) {
    return (
      <div className="grid gap-2">
        {Array.from({ length: 5 }, (_, index) => (
          <div key={index} className="h-16 animate-pulse rounded-2xl bg-moss/80" />
        ))}
      </div>
    );
  }

  if (!tokens.length) {
    return (
      <div className="rounded-3xl border border-dashed border-line px-6 py-14 text-center text-sm text-mute">
        Nothing on this filter. Try the full board.
      </div>
    );
  }

  return (
    <>
      <div className="hidden overflow-hidden rounded-2xl border border-line bg-forest md:block">
        <div className="grid grid-cols-[1.7fr_0.7fr_0.6fr_0.75fr_0.75fr_1fr_0.55fr] gap-3 border-b border-line px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-mute">
          <span>Token</span>
          <span>Price</span>
          <span>24h</span>
          <span>Mcap</span>
          <span>Volume</span>
          <span>Curve</span>
          <span>Age</span>
        </div>
        {tokens.map((token) => (
          <MarketRow key={token.id} token={token} now={now} />
        ))}
      </div>
      <div className="grid gap-3 md:hidden">
        {tokens.map((token) => (
          <MobileCard key={token.id} token={token} now={now} />
        ))}
      </div>
    </>
  );
}

function QuoteLabel({ token }: { token: Token }) {
  return token.quote === "ETH" ? "ETH pair" : `${token.quote} pair`;
}

function MarketRow({ token, now }: { token: Token; now: number }) {
  const progress = curveProgress(token) * 100;
  return (
    <Link
      href={`/token/${token.id}`}
      className="grid grid-cols-[1.7fr_0.7fr_0.6fr_0.75fr_0.75fr_1fr_0.55fr] items-center gap-3 border-b border-line px-4 py-3 transition last:border-b-0 hover:bg-moss"
    >
      <span className="flex min-w-0 items-center gap-3">
        <TokenMark token={token} />
        <span className="min-w-0">
          <span className="flex items-center gap-2">
            <span className="truncate font-semibold text-mist">{token.name}</span>
            {token.graduated ? <Badge /> : null}
          </span>
          <span className="mt-0.5 block truncate font-mono text-[11px] text-mute">
            {token.symbol} · <QuoteLabel token={token} />
          </span>
        </span>
      </span>
      <span className="font-mono text-sm text-mist">{usd(token.priceUsd)}</span>
      <span className={`font-mono text-sm ${changeClass(token.change24h)}`}>{pct(token.change24h)}</span>
      <span className="font-mono text-sm text-mist">{usd(mcap(token))}</span>
      <span className="font-mono text-sm text-mute">{usd(token.volume24h)}</span>
      <span>
        <span className="mb-1 block font-mono text-[11px] text-mute">
          {token.graduated ? "Full" : `${progress.toFixed(0)}%`}
        </span>
        <CurveBar value={progress} />
      </span>
      <span className="font-mono text-xs text-mute">{age(token.createdAt, now)}</span>
    </Link>
  );
}

function MobileCard({ token, now }: { token: Token; now: number }) {
  const progress = curveProgress(token) * 100;
  return (
    <Link href={`/token/${token.id}`} className="block rounded-2xl border border-line bg-forest p-4">
      <span className="flex items-center gap-3">
        <TokenMark token={token} size={44} />
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-2">
            <span className="truncate font-semibold">{token.name}</span>
            {token.graduated ? <Badge /> : null}
          </span>
          <span className="font-mono text-[11px] text-mute">
            {token.symbol} · <QuoteLabel token={token} /> · {age(token.createdAt, now)}
          </span>
        </span>
        <span className={`font-mono text-sm ${changeClass(token.change24h)}`}>{pct(token.change24h)}</span>
      </span>
      <span className="mt-4 grid grid-cols-3 gap-2 text-xs">
        <Stat label="Price" value={usd(token.priceUsd)} />
        <Stat label="Mcap" value={usd(mcap(token))} />
        <Stat label="Volume" value={usd(token.volume24h)} />
      </span>
      <span className="mt-3 block">
        <CurveBar value={progress} />
      </span>
    </Link>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <span>
      <span className="block text-[10px] uppercase tracking-[0.14em] text-mute">{label}</span>
      <span className="font-mono text-mist">{value}</span>
    </span>
  );
}

function Badge() {
  return (
    <span className="rounded-full border border-lime/40 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.12em] text-lime">
      Grad
    </span>
  );
}
