"use client";

import Link from "next/link";
import { useState } from "react";
import { GladeArt, limeButton, PageHeader } from "@/components/ui";
import { eth } from "@/lib/format";
import { useMarket } from "@/lib/market";
import { COLLECTIONS } from "@/lib/seed";

export function CollectionScreen({ slug }: { slug: string }) {
  const collection = COLLECTIONS.find((item) => item.slug === slug);
  const { mintedOf, walletMinted, mint, address, setWalletOpen, ready } = useMarket();
  const [qty, setQty] = useState(1);
  const [error, setError] = useState<string | null>(null);

  if (!collection) {
    return (
      <main className="wrap py-6">
        <PageHeader kicker="Missing" title="That collection is not listed." />
        <Link href="/collections" className="text-sm font-semibold text-lime">
          All collections
        </Link>
      </main>
    );
  }

  const minted = ready ? mintedOf(collection.slug) : collection.minted;
  const left = collection.supply - minted;
  const yours = walletMinted(collection.slug);
  const progress = Math.min(100, (minted / collection.supply) * 100);

  function submit() {
    if (!address) {
      setWalletOpen(true);
      return;
    }
    const result = mint(collection!.slug, qty);
    if (!result.ok) setError(result.error);
    else setError(null);
  }

  return (
    <main className="wrap grid gap-6 py-6 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div>
        <div className="overflow-hidden rounded-2xl border border-line">
          <GladeArt hue={collection.hue} className="h-72 w-full sm:h-96" />
        </div>
        <h1 className="mt-6 text-[28px] font-extrabold tracking-tight">{collection.name}</h1>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-mute">{collection.blurb}</p>
        <div className="mt-6">
          <div className="mb-2 flex justify-between font-mono text-xs text-mute">
            <span>
              {minted.toLocaleString("en-US")} minted
            </span>
            <span>{left.toLocaleString("en-US")} left</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-moss">
            <div className="h-full bg-lime" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>
      <aside className="h-fit rounded-2xl border border-line bg-forest p-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-lime">Mint</p>
        <p className="mt-3 font-display text-3xl font-extrabold">{eth(collection.priceEth)}</p>
        <p className="text-sm text-mute">Flat price. You have minted {yours}.</p>
        <div className="mt-5 flex items-center gap-3">
          <button type="button" className="h-11 w-11 rounded-full border border-line" onClick={() => setQty((value) => Math.max(1, value - 1))} aria-label="Decrease">
            −
          </button>
          <span className="w-8 text-center font-mono text-lg">{qty}</span>
          <button type="button" className="h-11 w-11 rounded-full border border-line" onClick={() => setQty((value) => Math.min(10, value + 1))} aria-label="Increase">
            +
          </button>
        </div>
        <p className="mt-3 font-mono text-sm text-mute">Total {eth(collection.priceEth * qty)}</p>
        {error ? <p className="mt-3 text-sm text-down">{error}</p> : null}
        <button type="button" className={`${limeButton} mt-5 w-full`} onClick={submit} disabled={left <= 0}>
          {left <= 0 ? "Sold out" : address ? "Mint" : "Connect to mint"}
        </button>
        <p className="mt-4 text-xs leading-relaxed text-mute">The mint is recorded in this browser. No transaction is sent.</p>
      </aside>
    </main>
  );
}
