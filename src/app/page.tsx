import type { Metadata } from "next";
import { LandingScreen } from "@/components/landing-screen";

export const metadata: Metadata = {
  title: { absolute: "Sherwood — fair token launchpad" },
  description: "Launch a token on a public curve, pair it with ETH or a Robinhood stock token, and trade it in the browser.",
};

export default function Page() {
  return <LandingScreen />;
}
