import { NextResponse } from "next/server";

export interface CryptoSummary {
  id: string;
  symbol: string;
  price: number;
  change24h: number;
  sparkline: number[];
}

export interface Candle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
}

export interface MarketsResponse {
  crypto: CryptoSummary[];
  btcCandles: Candle[];
  mock: boolean;
}

const COINS = ["bitcoin", "ethereum"];
const SYMBOLS: Record<string, string> = { bitcoin: "BTC", ethereum: "ETH" };

function mockResponse(): MarketsResponse {
  let btc = 62000;
  let eth = 2400;
  const btcSparkline: number[] = [];
  const ethSparkline: number[] = [];
  for (let i = 0; i < 40; i++) {
    btc *= 1 + (Math.random() - 0.5) * 0.01;
    eth *= 1 + (Math.random() - 0.5) * 0.012;
    btcSparkline.push(btc);
    ethSparkline.push(eth);
  }
  const now = Date.now();
  const btcCandles: Candle[] = Array.from({ length: 40 }, (_, i) => {
    const open = btc * (1 + (Math.random() - 0.5) * 0.015);
    const close = open * (1 + (Math.random() - 0.5) * 0.02);
    const high = Math.max(open, close) * (1 + Math.random() * 0.005);
    const low = Math.min(open, close) * (1 - Math.random() * 0.005);
    return { time: Math.floor((now - (40 - i) * 4 * 3_600_000) / 1000), open, high, low, close };
  });

  return {
    crypto: [
      { id: "bitcoin", symbol: "BTC", price: btc, change24h: -1.2, sparkline: btcSparkline },
      { id: "ethereum", symbol: "ETH", price: eth, change24h: 0.8, sparkline: ethSparkline },
    ],
    btcCandles,
    mock: true,
  };
}

// CoinGecko's free public API needs no key but is rate-limited — this route
// is polled at a low frequency from the client and falls back to mock data
// on any failure (including 429s) rather than showing a broken dashboard.
export async function GET() {
  try {
    const [priceRes, chartRes, ohlcRes] = await Promise.all([
      fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${COINS.join(",")}&vs_currencies=usd&include_24hr_change=true`
      ),
      Promise.all(
        COINS.map((id) =>
          fetch(`https://api.coingecko.com/api/v3/coins/${id}/market_chart?vs_currency=usd&days=1`).then((r) =>
            r.json()
          )
        )
      ),
      fetch("https://api.coingecko.com/api/v3/coins/bitcoin/ohlc?vs_currency=usd&days=7"),
    ]);

    if (!priceRes.ok || !ohlcRes.ok) {
      return NextResponse.json(mockResponse());
    }

    const prices = await priceRes.json();
    const ohlcRaw: [number, number, number, number, number][] = await ohlcRes.json();

    const crypto: CryptoSummary[] = COINS.map((id, i) => {
      const sparklinePrices: [number, number][] = chartRes[i]?.prices ?? [];
      return {
        id,
        symbol: SYMBOLS[id],
        price: prices[id]?.usd ?? 0,
        change24h: prices[id]?.usd_24h_change ?? 0,
        sparkline: sparklinePrices.slice(-40).map(([, p]) => p),
      };
    });

    const btcCandles: Candle[] = ohlcRaw.map(([time, open, high, low, close]) => ({
      time: Math.floor(time / 1000),
      open,
      high,
      low,
      close,
    }));

    return NextResponse.json({ crypto, btcCandles, mock: false });
  } catch (error) {
    console.error("markets route error", error);
    return NextResponse.json(mockResponse());
  }
}
