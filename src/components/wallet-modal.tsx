"use client";

import { ghostButton, limeButton } from "@/components/ui";
import { useMarket } from "@/lib/market";

export function WalletModal() {
  const { walletOpen, setWalletOpen, connectInjected, connectPreview, connecting, walletError } = useMarket();
  if (!walletOpen) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-end p-4 sm:place-items-center" role="presentation">
      <button
        type="button"
        className="absolute inset-0 bg-ink/70 backdrop-blur-sm"
        aria-label="Close wallet dialog"
        onClick={() => setWalletOpen(false)}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="wallet-title"
        className="relative w-full max-w-md rounded-[22px] border border-line bg-forest p-6 shadow-2xl"
      >
        <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-mute">Sherwood</p>
        <h2 id="wallet-title" className="mt-2 text-2xl font-extrabold tracking-tight">
          Connect a wallet
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-mute">
          A browser wallet can switch to Robinhood Chain. A preview wallet lets you launch and trade on this device without sending a transaction.
        </p>
        <div className="mt-6 grid gap-3">
          <button type="button" className={limeButton} onClick={() => void connectInjected()} disabled={connecting}>
            {connecting ? "Waiting for wallet…" : "Browser wallet"}
          </button>
          <button type="button" className={ghostButton} onClick={connectPreview}>
            Preview wallet
          </button>
        </div>
        {walletError ? <p className="mt-4 text-sm text-down">{walletError}</p> : null}
        <p className="mt-5 text-xs leading-relaxed text-mute">
          Fills on this desk are saved in the browser. Connecting a wallet does not send a trade.
        </p>
      </div>
    </div>
  );
}

export function Toast() {
  const { notice } = useMarket();
  if (!notice) return null;
  return (
    <div
      role="status"
      className="fixed bottom-16 left-1/2 z-50 max-w-[90vw] -translate-x-1/2 rounded-xl bg-[var(--action-bg)] px-4 py-2 text-center text-sm font-bold text-[var(--action-fg)] shadow-lg"
    >
      {notice}
    </div>
  );
}
