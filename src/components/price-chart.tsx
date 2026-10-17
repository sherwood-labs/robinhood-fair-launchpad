"use client";

import { useId } from "react";
import type { Token, Trade } from "@/lib/types";

export function PriceChart({ token, trades }: { token: Token; trades: Trade[] }) {
  const rawId = useId();
  const gradientId = `fill-${rawId.replace(/:/g, "")}`;
  const mine = trades
    .filter((trade) => trade.tokenId === token.id)
    .sort((a, b) => a.at - b.at)
    .map((trade) => trade.price);
  const series = [token.basePriceUsd, ...mine, token.priceUsd];
  const width = 640;
  const height = 220;
  const pad = 16;
  const min = Math.min(...series);
  const max = Math.max(...series);
  const span = max - min || max || 1;
  const points = series.map((price, index) => {
    const x = pad + (index / Math.max(1, series.length - 1)) * (width - pad * 2);
    const y = pad + (1 - (price - min) / span) * (height - pad * 2);
    return [x, y] as const;
  });
  const line = points.map(([x, y]) => `${x},${y}`).join(" ");
  const area = `${pad},${height - pad} ${line} ${width - pad},${height - pad}`;
  const up = token.change24h >= 0;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-56 w-full" role="img" aria-label={`${token.symbol} price`}>
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={up ? "#15c98a" : "#ff4d61"} stopOpacity="0.35" />
          <stop offset="100%" stopColor={up ? "#15c98a" : "#ff4d61"} stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0, 1, 2, 3].map((row) => (
        <line
          key={row}
          x1={pad}
          x2={width - pad}
          y1={pad + ((height - pad * 2) / 3) * row}
          y2={pad + ((height - pad * 2) / 3) * row}
          stroke="rgba(255,255,255,0.08)"
          strokeDasharray="3 6"
        />
      ))}
      <polygon points={area} fill={`url(#${gradientId})`} />
      <polyline points={line} fill="none" stroke={up ? "#15c98a" : "#ff4d61"} strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={points[points.length - 1][0]} cy={points[points.length - 1][1]} r="4" fill={up ? "#15c98a" : "#ff4d61"} />
    </svg>
  );
}
