import type { Metadata } from "next";
import { TokenScreen } from "@/components/token-screen";

export const metadata: Metadata = { title: "Token" };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <TokenScreen id={id} />;
}
