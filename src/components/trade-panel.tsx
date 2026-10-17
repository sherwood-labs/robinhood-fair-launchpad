"use client";

import { useMemo, useState } from "react";
import { curveProgress, previewBuy, previewSell } from "@/lib/curve";
import { eth as formatEth, pct, tokenAmount, usd } from "@/lib/format";
import { useMarket } from "@/lib/market";
import type { Token } from "@/lib/types";
import { CurveBar, limeButton } from "@/components/ui";

export function TradePanel({ token }: { token: Token }) {
  const { address, holding, buy, sell, setWalletOpen } = useMarket();
  const [side, setSide] = useState<"buy" | "sell">("buy");
  const [amount, setAmount] = useState("");
  const [error, setError] = useState<string | null>(null);
  const owned = holding(token.id);
  const progress = curveProgress(token) * 100;
  const numeric = Number(amount);

  const quote = useMemo(() => {
    if (!amount || !Number.isFinite(numeric) || numeric <= 0) return null;
    if (side === "buy") {
      const next = previewBuy(token, numeric);
      return "error" in next ? next : next;
    }
    const next = previewSell(token, numeric);
    return "error" in next ? next : next;
  }, [amount, numeric, side, token]);

  function submit() {
    if (!address) {
      setWalletOpen(true);
      return;
    }
    const result = side === "buy" ? buy(token.id, numeric) : sell(token.id, numeric);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setError(null);
    setAmount("");
  }

  const quoteError = quote && "error" in quote ? quote.error : null;
  const buyQuote = quote && !("error" in quote) && "filledEth" in quote ? quote : null;
  const sellQuote = quote && !("error" in quote) && "feeEth" in quote ? quote : null;

  return (
    <aside className="card h-fit rounded-2xl border border-line bg-forest p-5 lg:sticky lg:top-20">
      <div className="grid grid-cols-2 rounded-xl bg-canopy p-1">
        {(["buy", "sell"] as const).map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => {
              setSide(item);
              setAmount("");
              setError(null);
            }}
            className={`h-10 rounded-[9px] text-sm font-bold capitalize ${side === item ? (item === "buy" ? "bg-[#15c98a] text-[#03130b]" : "bg-down text-white") : "text-mute"}`}
          >
            {item}
          </button>
        ))}
      </div>
      <label className="mt-5 block text-[11px] font-semibold uppercase tracking-[0.16em] text-mute">
        {side === "buy" ? "You pay" : "You sell"}
      </label>
      <div className="mt-2 flex items-center gap-2 rounded-xl border border-line bg-canopy px-3">
        <input
          inputMode="decimal"
          value={amount}
          onChange={(event) => {
            setAmount(event.target.value);
            setError(null);
          }}
          placeholder="0.0"
          className="h-14 w-full bg-transparent font-mono text-lg outline-none"
        />
        <span className="font-mono text-xs text-mute">{side === "buy" ? "ETH" : token.symbol}</span>
      </div>
      {side === "buy" ? (
        <div className="mt-3 flex gap-2">
          {["0.05", "0.1", "0.5", "1"].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setAmount(value)}
              className="h-8 flex-1 rounded-lg border border-line bg-canopy text-xs text-mute hover:text-mist"
            >
              {value}
            </button>
          ))}
        </div>
      ) : (
        <div className="mt-3 flex gap-2">
          {[0.25, 0.5, 1].map((part) => (
            <button
              key={part}
              type="button"
              onClick={() => setAmount(owned ? String(Math.floor(owned * part * 100) / 100) : "0")}
              className="h-8 flex-1 rounded-lg border border-line bg-canopy text-xs text-mute hover:text-mist"
            >
              {part === 1 ? "Max" : `${part * 100}%`}
            </button>
          ))}
        </div>
      )}
      <dl className="mt-5 space-y-2 text-sm">
        <Row label="You receive" value={buyQuote ? tokenAmount(buyQuote.tokens) : sellQuote ? formatEth(sellQuote.eth) : "—"} />
        <Row label="Spot" value={usd(token.priceUsd)} />
        <Row
          label="Price impact"
          value={buyQuote ? pct(buyQuote.impact * 100) : sellQuote ? pct(sellQuote.impact * 100) : "—"}
        />
        <Row label="You hold" value={`${tokenAmount(owned)} ${token.symbol}`} />
      </dl>
      {buyQuote && buyQuote.filledEth + 1e-8 < numeric ? (
        <p className="mt-3 text-xs text-lime">This fill takes {formatEth(buyQuote.filledEth)} and completes the raise.</p>
      ) : null}
      {sellQuote ? <p className="mt-3 text-xs text-mute">A 2% fee stays on the curve.</p> : null}
      {error || quoteError ? <p className="mt-3 text-sm text-down">{error || quoteError}</p> : null}
      <button type="button" className={`${limeButton} mt-5 w-full`} onClick={submit}>
        {address ? (side === "buy" ? `Buy ${token.symbol}` : `Sell ${token.symbol}`) : "Connect to trade"}
      </button>
      <div className="mt-5">
        <div className="mb-2 flex justify-between font-mono text-[11px] text-mute">
          <span>{token.graduated ? "Graduated" : "Curve"}</span>
          <span>
            {token.raisedEth.toFixed(2)} / {token.curveEth} ETH
          </span>
        </div>
        <CurveBar value={progress} />
      </div>
      <p className="mt-4 text-xs leading-relaxed text-mute">
        Fills are saved in this browser. No transaction is sent.
      </p>
    </aside>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-mute">{label}</dt>
      <dd className="font-mono text-mist">{value}</dd>
    </div>
  );
}
