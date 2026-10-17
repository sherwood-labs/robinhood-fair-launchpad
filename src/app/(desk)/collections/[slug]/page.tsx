import type { Metadata } from "next";
import { CollectionScreen } from "@/components/collection-screen";

export const metadata: Metadata = { title: "Collection" };

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <CollectionScreen slug={slug} />;
}
