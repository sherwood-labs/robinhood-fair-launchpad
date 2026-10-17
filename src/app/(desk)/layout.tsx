import type { Metadata } from "next";
import { AppChrome } from "@/components/site-header";

export const metadata: Metadata = {
  title: "Sherwood",
};

export default function DeskLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="desk-root">
      <AppChrome />
      <div className="relative z-[1]">{children}</div>
    </div>
  );
}
