import type { Token } from "@/lib/types";

export function PageHeader({
  kicker,
  title,
  lede,
}: {
  kicker: string;
  title: string;
  lede?: string;
}) {
  return (
    <header className="mb-8 max-w-2xl">
      <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-mute">{kicker}</p>
      <h1 className="mt-2 text-[28px] font-extrabold tracking-tight text-mist">{title}</h1>
      {lede ? <p className="mt-3 text-base leading-relaxed text-mute">{lede}</p> : null}
    </header>
  );
}

export function TokenMark({
  token,
  size = 40,
}: {
  token: Pick<Token, "symbol" | "image" | "hue">;
  size?: number;
}) {
  if (token.image) {
    return (
      <img
        src={token.image}
        alt=""
        width={size}
        height={size}
        className="shrink-0 rounded-xl object-cover"
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <span
      className="inline-grid shrink-0 place-items-center rounded-[11px] text-[11px] font-extrabold text-white"
      style={{
        width: size,
        height: size,
        background: `linear-gradient(135deg, hsl(${token.hue} 72% 46%), hsl(${(token.hue + 40) % 360} 65% 32%))`,
      }}
    >
      {token.symbol.slice(0, 2)}
    </span>
  );
}

export function CurveBar({ value }: { value: number }) {
  const width = Math.max(0, Math.min(100, value));
  return (
    <div className="h-1.5 overflow-hidden rounded-full bg-moss">
      <div className="h-full rounded-full bg-lime" style={{ width: `${width}%` }} />
    </div>
  );
}

export function GladeArt({ hue, className }: { hue: number; className?: string }) {
  const sky = `hsl(${hue} 28% 11%)`;
  const tree = `hsl(${hue} 30% 7%)`;
  const moon = 430 + (hue % 70);
  return (
    <svg viewBox="0 0 640 360" className={className} aria-hidden>
      <rect width="640" height="360" fill={sky} />
      <circle cx={moon} cy="78" r="34" fill="#00C805" />
      <path d="M48 292 L132 118 L216 292 Z" fill={tree} />
      <path d="M150 310 L258 86 L366 310 Z" fill="#070806" />
      <path d="M300 300 L402 132 L504 300 Z" fill={tree} />
      <path d="M430 292 L520 168 L610 292 Z" fill="#070806" />
      <path d="M0 286 H640 V360 H0 Z" fill="#070806" />
      <path d="M96 250 h44 l18 8 -8 16 H108 z" fill="#00C805" />
      <path d="M140 246 h46" stroke="#00C805" strokeWidth="3" />
      <path d="M186 246 l16 -6" stroke="#070806" strokeWidth="3" />
    </svg>
  );
}

export const fieldClass =
  "h-12 w-full rounded-[10px] border border-line bg-canopy px-3.5 font-mono text-[13.5px] text-mist outline-none transition placeholder:text-mute/70 focus:border-[var(--line-2)]";

export const limeButton =
  "inline-flex h-[42px] items-center justify-center gap-2 rounded-xl bg-[var(--action-bg)] px-[18px] text-[13.5px] font-bold text-[var(--action-fg)] transition hover:bg-[var(--action-hover)] disabled:cursor-not-allowed disabled:opacity-50";

export const ghostButton =
  "inline-flex h-[42px] items-center justify-center gap-2 rounded-xl border border-line bg-forest px-[18px] text-[13.5px] font-bold text-mist transition hover:bg-moss disabled:cursor-not-allowed disabled:opacity-50";
