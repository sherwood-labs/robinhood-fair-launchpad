import type { Metadata } from "next";
import { Suspense } from "react";
import { CreateForm } from "@/components/create-form";

export const metadata: Metadata = { title: "Launch" };

export default function Page() {
  return (
    <Suspense fallback={<main className="mx-auto max-w-6xl px-4 py-16 text-mute">Opening the launch desk…</main>}>
      <CreateForm />
    </Suspense>
  );
}
