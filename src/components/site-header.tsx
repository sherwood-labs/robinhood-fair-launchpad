"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { BrandMark } from "@/components/brand";
import { TokenMark } from "@/components/ui";
import { shortAddr } from "@/lib/format";
import { ROBINHOOD_CHAIN, useMarket } from "@/lib/market";
import { SEED_TOKENS } from "@/lib/seed";

const TABS = [
  ["/explore", "Explore"],
  ["/tokens", "Tokens"],
  ["/collections", "NFTs"],
] as const;

export function AppChrome() {
  const path = usePathname();
  const { address, walletKind, chainId, setWalletOpen, disconnect, switchChain } = useMarket();
  const [navOpen, setNavOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const wrongChain = walletKind === "injected" && chainId !== null && chainId !== ROBINHOOD_CHAIN.id;

  function chooseTheme(next: "dark" | "light") {
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("sherwood-theme", next);
  }

  const side = [
    ["/portfolio", "Portfolio", BagIcon, path.startsWith("/portfolio")],
    ["/create", "Create", PlusIcon, path.startsWith("/create")],
    ["/stocks", "Fair Stocks", ChartIcon, path.startsWith("/stocks")],
    ["/collections", "NFTs", GridIcon, path.startsWith("/collections")],
    ["/docs", "Docs", DocIcon, path.startsWith("/docs")],
  ] as const;

  return (
    <>
      <aside className={`sidebar${navOpen ? " open" : ""}`}>
        <Link href="/explore" className="side-brand" onClick={() => setNavOpen(false)}>
          <BrandMark className="h-[30px] w-[30px]" />
          <span className="lbl">Sherwood</span>
        </Link>
        <nav className="side-nav">
          {side.map(([href, label, Icon, active]) => (
            <Link key={href} href={href} className={`side-item${active ? " active" : ""}`} onClick={() => setNavOpen(false)}>
              <Icon />
              <span className="lbl">{label}</span>
            </Link>
          ))}
        </nav>
        <div className="side-foot">
          <div className="side-div" />
          {address ? (
            <button type="button" className="side-item" onClick={disconnect}>
              <OutIcon />
              <span className="lbl">Log Out</span>
            </button>
          ) : null}
        </div>
      </aside>

      <header className="topbar">
        <div className="topbar-inner">
          <button type="button" className="burger" aria-label="Menu" onClick={() => setNavOpen((open) => !open)}>
            <MenuIcon />
          </button>
          <Link href="/explore" className="topbrand">
            <BrandMark className="h-[26px] w-[26px]" />
            <span>Sherwood</span>
          </Link>
          <nav className="top-tabs">
            {TABS.map(([href, label]) => {
              const active = path === href || path.startsWith(`${href}/`);
              return (
                <Link key={href} href={href} className={active ? "on" : ""}>
                  {label}
                </Link>
              );
            })}
          </nav>
          <SearchBox />
          <div className="create-wrap">
            <button type="button" className="create-btn" onClick={() => setCreateOpen((open) => !open)}>
              <span>Create</span>
              <Chevron />
            </button>
            {createOpen ? (
              <div className="create-menu">
                <Link href="/create" onClick={() => setCreateOpen(false)}>Create Token</Link>
                <Link href="/collections" onClick={() => setCreateOpen(false)}>NFT Collections</Link>
              </div>
            ) : null}
          </div>
          {wrongChain ? (
            <button type="button" className="wallet-btn" onClick={() => void switchChain()}>
              Switch to 4663
            </button>
          ) : address ? (
            <button type="button" className="wallet-btn" onClick={disconnect} title="Disconnect">
              <span className="live" style={{ background: walletKind === "preview" ? "var(--txt-3)" : undefined }} />
              {shortAddr(address)}
            </button>
          ) : (
            <button type="button" className="wallet-btn" onClick={() => setWalletOpen(true)}>
              Connect
            </button>
          )}
        </div>
      </header>

      <div className="statusbar">
        <div className="sb-group">
          <span className="sb-item"><span className="live" /> Live</span>
          <span className="sb-item">Robinhood Chain</span>
        </div>
        <div className="sb-group">
          <div className="sb-toggles">
            <button type="button" data-set="light" onClick={() => chooseTheme("light")}>Light</button>
            <button type="button" data-set="dark" onClick={() => chooseTheme("dark")}>Dark</button>
          </div>
          <span className="sb-item">© 2026 SHERWOOD</span>
        </div>
      </div>

      <nav className="mobile-bar">
        <Link href="/explore" className={path.startsWith("/explore") ? "active" : ""}>Explore</Link>
        <Link href="/tokens" className={path.startsWith("/tokens") ? "active" : ""}>Tokens</Link>
        <Link href="/create" className="plus" aria-label="Create">+</Link>
        <Link href="/collections" className={path.startsWith("/collections") ? "active" : ""}>NFTs</Link>
        <Link href="/portfolio" className={path.startsWith("/portfolio") ? "active" : ""}>Wallet</Link>
      </nav>
    </>
  );
}

function SearchBox() {
  const router = useRouter();
  const { tokens, ready } = useMarket();
  const [query, setQuery] = useState("");
  const blurTimer = useRef(0);
  const list = ready ? tokens : SEED_TOKENS;
  const needle = query.trim().toLowerCase();
  const hits = needle
    ? list.filter((token) => token.symbol.toLowerCase().includes(needle) || token.name.toLowerCase().includes(needle)).slice(0, 6)
    : [];

  return (
    <div className="relative top-search">
      <SearchIcon />
      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        onFocus={() => window.clearTimeout(blurTimer.current)}
        onBlur={() => {
          blurTimer.current = window.setTimeout(() => setQuery(""), 160);
        }}
        placeholder="Search tokens"
        aria-label="Search tokens"
      />
      {needle ? (
        <div className="create-menu" style={{ left: 0, right: "auto", width: "100%", top: 48 }}>
          {hits.length ? (
            hits.map((token) => (
              <button
                key={token.id}
                type="button"
                className="flex w-full items-center gap-2 rounded-[9px] px-2 py-2 text-left hover:bg-moss"
                onMouseDown={(event) => {
                  event.preventDefault();
                  window.clearTimeout(blurTimer.current);
                }}
                onClick={() => {
                  setQuery("");
                  router.push(`/token/${token.id}`);
                }}
              >
                <TokenMark token={token} size={28} />
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold">{token.name}</span>
                  <span className="font-mono text-[11px] text-mute">{token.symbol}</span>
                </span>
              </button>
            ))
          ) : (
            <p className="px-3 py-3 text-sm text-mute">No match on the board.</p>
          )}
        </div>
      ) : null}
    </div>
  );
}

function MenuIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="20" height="20">
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}
function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="18" height="18" className="text-mute">
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3.5-3.5" />
    </svg>
  );
}
function Chevron() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="14" height="14">
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}
function BagIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <path d="M6 8h12l-1 12H7L6 8z" />
      <path d="M9 8V7a3 3 0 016 0v1" />
    </svg>
  );
}
function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <circle cx="12" cy="12" r="8" />
      <path d="M12 8v8M8 12h8" />
    </svg>
  );
}
function ChartIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <path d="M4 19h16" />
      <path d="M7 16l4-5 3 3 5-7" />
    </svg>
  );
}
function GridIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <rect x="4" y="4" width="7" height="7" rx="1.5" />
      <rect x="13" y="4" width="7" height="7" rx="1.5" />
      <rect x="4" y="13" width="7" height="7" rx="1.5" />
      <rect x="13" y="13" width="7" height="7" rx="1.5" />
    </svg>
  );
}
function DocIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <path d="M7 3h7l5 5v13H7z" />
      <path d="M14 3v5h5M9 13h6M9 17h6" />
    </svg>
  );
}
function OutIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <path d="M10 7V5h9v14h-9v-2" />
      <path d="M13 12H4m0 0l3-3m-3 3l3 3" />
    </svg>
  );
}
