"use client";

import Link from "next/link";
import { GladeArt, PageHeader } from "@/components/ui";
import { useMarket } from "@/lib/market";
import { COLLECTIONS } from "@/lib/seed";

export function CollectionsScreen() {
  const { mintedOf, ready } = useMarket();
  return (
    <main className="wrap py-6">
      <PageHeader
        kicker="Collections"
        title="Mint from the glade"
        lede="Fixed-supply collections. The mint price is flat, and the count updates on this device."
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {COLLECTIONS.map((collection) => {
          const minted = ready ? mintedOf(collection.slug) : collection.minted;
          const progress = Math.min(100, (minted / collection.supply) * 100);
          return (
            <Link key={collection.slug} href={`/collections/${collection.slug}`} className="overflow-hidden rounded-2xl border border-line bg-forest transition hover:border-[var(--line-2)]">
              <GladeArt hue={collection.hue} className="h-40 w-full" />
              <div className="p-4">
                <h2 className="font-display text-2xl font-extrabold">{collection.name}</h2>
                <p className="mt-1 line-clamp-2 text-sm text-mute">{collection.blurb}</p>
                <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-moss">
                  <div className="h-full bg-lime" style={{ width: `${progress}%` }} />
                </div>
                <p className="mt-2 flex justify-between font-mono text-[11px] text-mute">
                  <span>
                    {minted.toLocaleString("en-US")} / {collection.supply.toLocaleString("en-US")}
                  </span>
                  <span>{collection.priceEth} ETH</span>
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </main>
  );
}
