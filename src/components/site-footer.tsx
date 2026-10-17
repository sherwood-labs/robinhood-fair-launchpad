import Link from "next/link";
import { ROBINHOOD_CHAIN } from "@/lib/chain";

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-line">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:px-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="font-display text-sm font-extrabold tracking-[0.16em]">SHERWOOD LABS</p>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-mute">
            A fair token launchpad for Robinhood Chain. Curves in this build are saved in the browser until contracts are connected.
          </p>
        </div>
        <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-mute">
          <Link href="/explore" className="hover:text-lime">Market</Link>
          <Link href="/create" className="hover:text-lime">Launch</Link>
          <Link href="/docs" className="hover:text-lime">Docs</Link>
          <a href={ROBINHOOD_CHAIN.explorer} className="hover:text-lime" target="_blank" rel="noreferrer">
            Blockscout
          </a>
        </div>
      </div>
    </footer>
  );
}
