// Stock data has no free real-time API wired up (CoinGecko only covers
// crypto), so indices/heatmap/watchlist are realistic mock baselines that
// drift via small client-side random walks — per the build spec's own
// "Mock-Daten mit leichter Live-Bewegung" instruction.
export interface MockAsset {
  symbol: string;
  name: string;
  basePrice: number;
  baseChange: number;
}

export const STOCK_INDICES: MockAsset[] = [
  { symbol: "DAX", name: "DAX 40", basePrice: 18339, baseChange: 0.42 },
  { symbol: "S&P 500", name: "S&P 500", basePrice: 5450, baseChange: 0.18 },
  { symbol: "NASDAQ", name: "NASDAQ Comp.", basePrice: 19200, baseChange: -0.25 },
];

export const HEATMAP_TICKERS: MockAsset[] = [
  { symbol: "SAP", name: "SAP SE", basePrice: 178.4, baseChange: 1.8 },
  { symbol: "SIE", name: "Siemens", basePrice: 172.1, baseChange: 0.6 },
  { symbol: "BAS", name: "BASF", basePrice: 48.3, baseChange: -1.1 },
  { symbol: "ALV", name: "Allianz", basePrice: 261.7, baseChange: 0.9 },
  { symbol: "BMW", name: "BMW", basePrice: 84.2, baseChange: -0.4 },
  { symbol: "ADS", name: "Adidas", basePrice: 219.5, baseChange: 2.3 },
  { symbol: "DTE", name: "Deutsche Telekom", basePrice: 24.1, baseChange: 0.2 },
  { symbol: "VOW3", name: "Volkswagen", basePrice: 96.8, baseChange: -2.1 },
  { symbol: "BAYN", name: "Bayer", basePrice: 28.6, baseChange: -0.8 },
  { symbol: "MBG", name: "Mercedes-Benz", basePrice: 58.9, baseChange: 0.5 },
  { symbol: "RWE", name: "RWE", basePrice: 31.4, baseChange: 1.2 },
  { symbol: "IFX", name: "Infineon", basePrice: 33.7, baseChange: -1.6 },
];

export const WATCHLIST: MockAsset[] = [
  { symbol: "AAPL", name: "Apple", basePrice: 213.4, baseChange: 0.6 },
  { symbol: "MSFT", name: "Microsoft", basePrice: 442.8, baseChange: 1.1 },
  { symbol: "TSLA", name: "Tesla", basePrice: 248.6, baseChange: -2.4 },
  { symbol: "NVDA", name: "NVIDIA", basePrice: 124.9, baseChange: 3.2 },
  { symbol: "AMZN", name: "Amazon", basePrice: 196.3, baseChange: 0.3 },
];

export function stepValue(value: number, volatility: number): number {
  const next = value * (1 + (Math.random() - 0.5) * volatility);
  return Math.round(next * 100) / 100;
}

export function stepSeries(series: number[], volatility: number, maxLength = 40): number[] {
  const last = series[series.length - 1] ?? 1;
  const next = stepValue(last, volatility);
  const updated = [...series, next];
  return updated.length > maxLength ? updated.slice(updated.length - maxLength) : updated;
}

export function buildInitialSeries(base: number, length = 40, volatility = 0.004): number[] {
  const series: number[] = [base];
  for (let i = 1; i < length; i++) {
    series.push(stepValue(series[i - 1], volatility));
  }
  return series;
}
