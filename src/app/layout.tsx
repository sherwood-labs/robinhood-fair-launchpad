import type { Metadata } from "next";
import Script from "next/script";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";
import "@fontsource/inter/800.css";
import "@fontsource/jetbrains-mono/400.css";
import "@fontsource/jetbrains-mono/500.css";
import "@fontsource/jetbrains-mono/700.css";
import { Providers } from "@/components/providers";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Sherwood",
    template: "%s · Sherwood",
  },
  description:
    "Sherwood is a fair token launchpad on Robinhood Chain. Launch a curve, pair it with ETH or a stock token, and trade it.",
  icons: { icon: "/logo.jpg" },
};

const themeBoot = `(function(){try{var t=localStorage.getItem('sherwood-theme');if(t!=='light'&&t!=='dark')t='dark';document.documentElement.setAttribute('data-theme',t);}catch(e){document.documentElement.setAttribute('data-theme','dark');}})();`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased" data-theme="dark" data-scroll-behavior="smooth" suppressHydrationWarning>
      <body>
        <Script id="sherwood-theme" strategy="beforeInteractive">
          {themeBoot}
        </Script>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
