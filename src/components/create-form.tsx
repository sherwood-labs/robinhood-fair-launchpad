"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { fieldClass, ghostButton, limeButton, PageHeader, TokenMark } from "@/components/ui";
import { useMarket } from "@/lib/market";
import { normalizeQuote, STOCKS } from "@/lib/stocks";

export function CreateForm() {
  const params = useSearchParams();
  const router = useRouter();
  const { createToken, address, setWalletOpen } = useMarket();
  const [name, setName] = useState("");
  const [symbol, setSymbol] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const fromUrl = normalizeQuote(params.get("quote") ?? "ETH");
  const [pickedQuote, setPickedQuote] = useState<string | null>(null);
  const quote = pickedQuote ?? fromUrl;
  const [initial, setInitial] = useState("");
  const [error, setError] = useState<string | null>(null);

  const preview = useMemo(
    () => ({
      symbol: (symbol || "NEW").toUpperCase().slice(0, 8),
      image,
      hue: 80,
    }),
    [symbol, image],
  );

  function onFile(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Use an image file.");
      return;
    }
    if (file.size > 700_000) {
      setError("Use an image under 700 KB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setImage(String(reader.result));
      setError(null);
    };
    reader.readAsDataURL(file);
  }

  function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!address) {
      setWalletOpen(true);
      return;
    }
    const initialEth = initial.trim() === "" ? 0 : Number(initial);
    if (initial.trim() !== "" && (!Number.isFinite(initialEth) || initialEth < 0)) {
      setError("Initial buy needs to be a number.");
      return;
    }
    const result = createToken({
      name,
      symbol,
      description,
      image,
      quote,
      initialEth,
    });
    if (!result.ok) {
      setError(result.error);
      return;
    }
    router.push(`/token/${result.data.id}`);
  }

  return (
    <main className="wrap grid gap-8 py-6 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div>
        <PageHeader
          kicker="Launch"
          title="Open a curve"
          lede="One billion supply. An 8 ETH raise. Pair with ETH or a Robinhood stock token."
        />
        <form onSubmit={submit} className="grid gap-4">
          <label className="grid gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-mute">
            Name
            <input value={name} onChange={(event) => setName(event.target.value)} className={fieldClass} placeholder="Greenwood" maxLength={32} required />
          </label>
          <label className="grid gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-mute">
            Symbol
            <input
              value={symbol}
              onChange={(event) => setSymbol(event.target.value.toUpperCase())}
              className={`${fieldClass} font-mono uppercase`}
              placeholder="GRNW"
              maxLength={8}
              required
            />
          </label>
          <label className="grid gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-mute">
            Story
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              className={`${fieldClass} h-28 resize-none py-3`}
              placeholder="What is this curve for?"
              maxLength={280}
            />
          </label>
          <label className="grid gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-mute">
            Picture
            <input
              type="file"
              accept="image/*"
              onChange={(event) => onFile(event.target.files?.[0])}
              className="block text-sm text-mute file:mr-3 file:rounded-full file:border-0 file:bg-lime file:px-4 file:py-2 file:text-sm file:font-semibold file:text-ink"
            />
          </label>
          <label className="grid gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-mute">
            Quote
            <select value={quote} onChange={(event) => setPickedQuote(event.target.value)} className={fieldClass}>
              <option value="ETH">ETH</option>
              {STOCKS.map((stock) => (
                <option key={stock.symbol} value={stock.symbol}>
                  {stock.symbol} · {stock.name}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-mute">
            Initial buy, ETH
            <input
              value={initial}
              onChange={(event) => setInitial(event.target.value)}
              inputMode="decimal"
              placeholder="0.1"
              className={`${fieldClass} font-mono`}
            />
          </label>
          {error ? <p className="text-sm text-down">{error}</p> : null}
          <div className="mt-2 flex flex-wrap gap-3">
            <button type="submit" className={limeButton}>
              {address ? "Open the curve" : "Connect to launch"}
            </button>
            <button type="button" className={ghostButton} onClick={() => router.push("/explore")}>
              Cancel
            </button>
          </div>
        </form>
      </div>
      <aside className="h-fit rounded-2xl border border-line bg-forest p-5 lg:sticky lg:top-20">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-mute">Preview</p>
        <div className="mt-4 flex items-center gap-3">
          <TokenMark token={preview} size={52} />
          <div className="min-w-0">
            <p className="truncate font-display text-2xl font-extrabold">{name || "Untitled"}</p>
            <p className="font-mono text-xs text-mute">
              {preview.symbol} · {quote} pair
            </p>
          </div>
        </div>
        <p className="mt-4 text-sm leading-relaxed text-mute">{description || "The story shows up here."}</p>
        <dl className="mt-5 space-y-2 text-sm">
          <div className="flex justify-between"><dt className="text-mute">Supply</dt><dd className="font-mono">1,000,000,000</dd></div>
          <div className="flex justify-between"><dt className="text-mute">Target</dt><dd className="font-mono">8 ETH</dd></div>
          <div className="flex justify-between"><dt className="text-mute">Start price</dt><dd className="font-mono">$0.00000800</dd></div>
        </dl>
      </aside>
    </main>
  );
}
