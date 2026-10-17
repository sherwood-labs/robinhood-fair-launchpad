import type { Metadata } from "next";
import { CollectionsScreen } from "@/components/collections-screen";

export const metadata: Metadata = { title: "Collections" };

export default function Page() {
  return <CollectionsScreen />;
}
