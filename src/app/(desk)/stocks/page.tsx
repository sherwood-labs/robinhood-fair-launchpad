import type { Metadata } from "next";
import { StocksScreen } from "@/components/stocks-screen";

export const metadata: Metadata = { title: "Stocks" };

export default function Page() {
  return <StocksScreen />;
}
