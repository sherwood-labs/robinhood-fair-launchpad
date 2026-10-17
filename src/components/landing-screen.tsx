"use client";

import Link from "next/link";
import { useState } from "react";
import { BrandMark } from "@/components/brand";
import { pct, usd } from "@/lib/format";
import { SEED_TOKENS } from "@/lib/seed";
import { STOCKS } from "@/lib/stocks";
import "@/app/landing.css";

const ORBIT = SEED_TOKENS.slice(0, 8);

const STEPS = [
  { n: "01", title: "Name the token", body: "Pick a name and ticker. Every launch starts with one billion tokens and the same public curve." },
  { n: "02", title: "Choose the pair", body: "Quote the curve in ETH, or in one of fifteen Robinhood stock tokens such as AAPL, NVDA, or TSLA." },
  { n: "03", title: "Trade the curve", body: "Buys raise the price. Sells pay a two percent fee. This build saves the launch and every fill in your browser." },
];

const FAQS = [
  { q: "Where do launches and trades live?", a: "In this browser. Connecting a wallet does not send a transaction, and a fill does not move funds on Robinhood Chain." },
  { q: "What is a preview wallet?", a: "A local address you can use without an extension. It can launch, buy, and sell inside this demo. An injected wallet can still switch to chain 4663." },
  { q: "How does the curve work?", a: "Price starts near $0.000008 and rises with tokens sold. The launch target is 8 ETH. Supply is 1,000,000,000. A sell pays a 2% fee." },
  { q: "Which stock pairs can I use?", a: STOCKS.map((stock) => stock.symbol).join(", ") + "." },
];

export function LandingScreen() {
  const [open, setOpen] = useState(0);

  return (
    <div className="landing">
      <header className="lnav">
        <div className="lnav-in">
          <Link href="/" className="lnav-brand">
            <BrandMark className="h-8 w-8" />
            <span>Sherwood</span>
          </Link>
          <nav className="lnav-links">
            <a href="#market">Markets</a>
            <a href="#how">How it works</a>
            <Link href="/docs">Docs</Link>
          </nav>
          <Link href="/explore" className="lbtn solid">Open App</Link>
        </div>
      </header>

      <section className="lhero">
        <div className="lbadge">Robinhood Chain · 4663</div>
        <h1>Fair launches,<br />out in the open.</h1>
        <p>Name a token, pair it with ETH or a Robinhood stock token, and let one public curve set the price until the raise is full.</p>
        <div className="lhero-cta">
          <Link href="/explore" className="lbtn solid">Explore markets</Link>
          <Link href="/create" className="lbtn ghost">Launch a token</Link>
        </div>
        <div className="lproof">
          <span>1B supply</span>
          <span>8 ETH target</span>
          <span>15 stock pairs</span>
        </div>
      </section>

      <section className="lorbit" aria-label="Live curves">
        <div className="lorbit-spin">
          {ORBIT.map((token, i) => (
            <Link key={token.id} href={`/token/${token.id}`} className="ltoken" style={{ transform: `rotate(${i * 45}deg) translateY(-168px) rotate(-${i * 45}deg)` }}>
              <strong>{token.symbol}</strong>
              <em>{usd(token.priceUsd)}</em>
              <span className={token.change24h >= 0 ? "up" : "dn"}>{pct(token.change24h)}</span>
            </Link>
          ))}
          <div className="lorbit-core">
            <BrandMark className="h-14 w-14" />
            <b>Sherwood</b>
            <small>fair curve</small>
          </div>
        </div>
      </section>

      <section className="lsec" id="market">
        <div className="lsec-h">
          <p className="lkick">Stock pairs</p>
          <h2>Fifteen Robinhood pairs, one curve.</h2>
        </div>
        <div className="lstocks">
          {STOCKS.map((stock) => (
            <Link key={stock.symbol} href={`/create?quote=${stock.symbol}`} className="lstock">
              <b>{stock.symbol}</b>
              <span>{stock.name}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="lsec" id="how">
        <div className="lsec-h">
          <p className="lkick">How it works</p>
          <h2>Three steps from name to market.</h2>
        </div>
        <div className="lsteps">
          {STEPS.map((step) => (
            <article key={step.n}>
              <span>{step.n}</span>
              <h3>{step.title}</h3>
              <p>{step.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="lsec">
        <div className="lsec-h">
          <p className="lkick">Questions</p>
          <h2>What this build actually does.</h2>
        </div>
        <div className="lfaq">
          {FAQS.map((item, i) => (
            <button key={item.q} type="button" className={open === i ? "open" : ""} onClick={() => setOpen(open === i ? -1 : i)}>
              <span>{item.q}</span>
              <small>{open === i ? "–" : "+"}</small>
              {open === i ? <p>{item.a}</p> : null}
            </button>
          ))}
        </div>
      </section>

      <section className="lcta">
        <h2>Start a curve.</h2>
        <p>Launch in the app, or look through the markets that are already moving.</p>
        <div className="lhero-cta">
          <Link href="/create" className="lbtn solid">Launch a token</Link>
          <Link href="/explore" className="lbtn ghost">Open the markets</Link>
        </div>
      </section>

      <footer className="lfoot">
        <span>© 2026 Sherwood</span>
        <nav>
          <Link href="/explore">Explore</Link>
          <Link href="/stocks">Fair Stocks</Link>
          <Link href="/collections">Collections</Link>
          <Link href="/docs">Docs</Link>
        </nav>
      </footer>
    </div>
  );
}
