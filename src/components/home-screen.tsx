"use client";

import Link from "next/link";
import { MarketList } from "@/components/market-list";
import { GladeArt } from "@/components/ui";
import { sortTokens } from "@/lib/board";
import { pct, usd } from "@/lib/format";
import { useMarket } from "@/lib/market";
import { COLLECTIONS } from "@/lib/seed";

export function HomeScreen() {
  const { tokens, ready, now, mintedOf } = useMarket();
  const board = sortTokens(ready ? tokens : [], "trending");
  const trend = board.slice(0, 6);

  return (
    <main className="wrap">
      <section className="nbx">
        {COLLECTIONS.slice(0, 2).map((collection) => {
          const minted = ready ? mintedOf(collection.slug) : collection.minted;
          return (
            <Link key={collection.slug} href={`/collections/${collection.slug}`} className="nb-card">
              <GladeArt hue={collection.hue} className="art" />
              <span className="nb-shade" />
              <span className="nb-live" />
              <div className="nb-btm">
                <div>
                  <div className="nb-name">{collection.name}</div>
                  <div className="nb-strip">
                    <div className="nb-col">
                      <span className="l">Minted</span>
                      <span className="v">
                        {minted.toLocaleString("en-US")} / {collection.supply.toLocaleString("en-US")}
                      </span>
                    </div>
                    <div className="nb-col">
                      <span className="l">Mint Price</span>
                      <span className="v">{collection.priceEth} ETH</span>
                    </div>
                  </div>
                </div>
                <span className="nb-mint">Mint</span>
              </div>
            </Link>
          );
        })}
      </section>

      <section className="trend6" aria-label="Trending tokens">
        {trend.map((token) => (
          <Link
            key={token.id}
            href={`/token/${token.id}`}
            className="t6"
            style={{
              background: token.image
                ? `center / cover url(${token.image})`
                : `linear-gradient(145deg, hsl(${token.hue} 42% 28%), hsl(${token.hue} 30% 12%))`,
            }}
          >
            {token.image ? null : <span className="t6-ini">{token.symbol.slice(0, 2)}</span>}
            <span className="t6-info">
              <span className="flex min-w-0 flex-col">
                <span className="t6-nm block">{token.symbol}</span>
                <span className="t6-val block">{usd(token.priceUsd)}</span>
              </span>
              <span className={`t6-chg ${token.change24h >= 0 ? "pos" : "neg"}`}>{pct(token.change24h)}</span>
            </span>
          </Link>
        ))}
      </section>

      <section className="section">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <div className="seg">
            <button type="button" className="on">Sherwood</button>
            <Link href="/tokens" className="grid place-items-center px-4 text-[13px] font-semibold text-mute">
              All tokens
            </Link>
          </div>
          <span className="text-[13px] font-semibold text-mute">Trending</span>
        </div>
        <MarketList tokens={board} now={now} loading={!ready} />
      </section>

      <section className="section">
        <div className="shead">
          <h2>New Collections</h2>
          <div className="sub">Fixed-supply mints on this device</div>
        </div>
        <div className="nft-grid">
          {COLLECTIONS.map((collection) => {
            const minted = ready ? mintedOf(collection.slug) : collection.minted;
            return (
              <Link key={collection.slug} href={`/collections/${collection.slug}`} className="nfc">
                <GladeArt hue={collection.hue} className="aspect-square w-full rounded-[14px]" />
                <div className="nfc-ttl">{collection.name}</div>
                <div className="nfc-foot">
                  <div>
                    <div className="lbl">Minted</div>
                    <div className="val">{minted.toLocaleString("en-US")}</div>
                  </div>
                  <div className="text-right">
                    <div className="lbl">Price</div>
                    <div className="val">{collection.priceEth} ETH</div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </main>
  );
}
