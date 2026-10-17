import type { Metadata } from "next";
import { PortfolioScreen } from "@/components/portfolio-screen";

export const metadata: Metadata = { title: "Portfolio" };

export default function Page() {
  return <PortfolioScreen />;
}
