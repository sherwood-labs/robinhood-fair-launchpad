"use client";

import { MarketProvider } from "@/lib/market";
import { Toast, WalletModal } from "@/components/wallet-modal";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <MarketProvider>
      {children}
      <WalletModal />
      <Toast />
    </MarketProvider>
  );
}
