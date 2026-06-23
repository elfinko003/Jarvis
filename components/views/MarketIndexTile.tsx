import { GlowText } from "@/components/hud";

interface MarketIndexTileProps {
  symbol: string;
  price: number;
  change: number;
  decimals?: number;
}

export function MarketIndexTile({ symbol, price, change, decimals = 2 }: MarketIndexTileProps) {
  const isUp = change >= 0;
  return (
    <div className="flex-1 rounded-[2px] border border-border-dim p-3 [background:linear-gradient(160deg,var(--bg-panel),#0d0d10)]">
      <p className="font-mono text-[9px] uppercase tracking-[2px] text-text-dim">{symbol}</p>
      <GlowText className="font-mono text-xl text-text-bright">
        {price.toLocaleString("de-DE", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}
      </GlowText>
      <p className={`font-mono text-[10px] ${isUp ? "text-green" : "text-red"}`}>
        {isUp ? "▲" : "▼"} {isUp ? "+" : ""}
        {change.toFixed(2)}%
      </p>
    </div>
  );
}
