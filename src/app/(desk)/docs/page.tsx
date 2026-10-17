import type { Metadata } from "next";
import Link from "next/link";
import { ROBINHOOD_CHAIN } from "@/lib/chain";
import { STOCKS } from "@/lib/stocks";

export const metadata: Metadata = { title: "Docs" };

export default function Page() {
  return (
    <main className="wrap max-w-3xl py-8">
      <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-mute">Docs</p>
      <h1 className="mt-2 text-[28px] font-extrabold tracking-tight">How Sherwood works</h1>
      <p className="mt-4 text-base leading-relaxed text-mute">
        Sherwood is a fair launchpad for Robinhood Chain. You open a curve, people buy along it, and the price climbs until the raise is full.
      </p>

      <section className="mt-10">
        <h2 className="font-display text-2xl font-extrabold">The curve</h2>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-mute">
          <li>A launch has a fixed supply of 1,000,000,000 tokens and an 8 ETH target.</li>
          <li>The opening price is $0.000008. It rises as ETH comes in, using the average price across the step you take.</li>
          <li>Selling pays the spot price minus a 2% fee that stays on the curve.</li>
          <li>When the raise fills, the token is marked graduated and trading stays open.</li>
        </ol>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-2xl font-extrabold">Stock pairs</h2>
        <p className="mt-3 text-sm leading-relaxed text-mute">
          A launch can be quoted in ETH or in one of {STOCKS.length} Robinhood stock tokens. Addresses come from the curated chain list and are the contracts traders already use for GME, AAPL, NVDA, and the rest. Sherwood does not accept a pasted address, so a lookalike token cannot replace the real one.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-2xl font-extrabold">This build</h2>
        <p className="mt-3 text-sm leading-relaxed text-mute">
          Launches, fills, and mints are stored in your browser. Connecting a wallet reads your account and can switch you to Robinhood Chain. It does not send a transaction. A preview wallet is there when you want to walk the whole desk without an extension.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-mute">
          Reset the local board any time from Portfolio.
        </p>
      </section>

      <section className="mt-10 rounded-2xl border border-line bg-forest p-5">
        <h2 className="font-display text-2xl font-extrabold">Chain</h2>
        <dl className="mt-4 space-y-2 text-sm">
          <Row label="Name" value={ROBINHOOD_CHAIN.name} />
          <Row label="Chain ID" value={String(ROBINHOOD_CHAIN.id)} />
          <Row label="RPC" value={ROBINHOOD_CHAIN.rpcUrl} />
        </dl>
        <a href={ROBINHOOD_CHAIN.explorer} target="_blank" rel="noreferrer" className="mt-4 inline-flex text-sm font-semibold text-lime">
          Open Blockscout
        </a>
      </section>

      <p className="mt-10 text-sm text-mute">
        Ready? <Link href="/create" className="font-semibold text-lime">Open a curve</Link> or <Link href="/tokens" className="font-semibold text-lime">read the board</Link>.
      </p>
    </main>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:justify-between">
      <dt className="text-mute">{label}</dt>
      <dd className="break-all font-mono text-mist">{value}</dd>
    </div>
  );
}
