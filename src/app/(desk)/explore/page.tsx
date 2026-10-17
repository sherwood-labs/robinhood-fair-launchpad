import type { Metadata } from "next";
import { HomeScreen } from "@/components/home-screen";

export const metadata: Metadata = { title: "Explore" };

export default function ExplorePage() {
  return <HomeScreen />;
}
