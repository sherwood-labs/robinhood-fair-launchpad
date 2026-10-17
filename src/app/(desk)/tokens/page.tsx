import type { Metadata } from "next";
import { ExploreScreen } from "@/components/explore-screen";

export const metadata: Metadata = { title: "Tokens" };

export default function TokensPage() {
  return <ExploreScreen />;
}
