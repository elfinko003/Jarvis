import { NextRequest, NextResponse } from "next/server";

export interface ForecastPoint {
  label: string;
  temp: number;
  description: string;
}

export interface WeatherData {
  temp: number;
  description: string;
  feelsLike: number;
  windSpeed: number;
  humidity: number;
  uvIndex: number;
  forecast: ForecastPoint[];
  mock: boolean;
}

const DAY_LABELS = ["SO", "MO", "DI", "MI", "DO", "FR", "SA"];

function mockWeather(seed: number): WeatherData {
  const temp = 12 + (seed % 18);
  return {
    temp,
    description: "Klar",
    feelsLike: temp - 1,
    windSpeed: 3 + (seed % 5),
    humidity: 45 + (seed % 30),
    uvIndex: 2 + (seed % 5),
    forecast: [0, 1, 2].map((i) => ({
      label: DAY_LABELS[(new Date().getDay() + i) % 7],
      temp: temp + ((seed + i * 3) % 7) - 3,
      description: "Klar",
    })),
    mock: true,
  };
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");
  const seed = (lat ?? "0").length + (lng ?? "0").length;

  const apiKey = process.env.OPENWEATHER_KEY;
  if (!apiKey || !lat || !lng) {
    return NextResponse.json(mockWeather(seed));
  }

  try {
    const [currentRes, forecastRes] = await Promise.all([
      fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&units=metric&appid=${apiKey}`),
      fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lng}&units=metric&appid=${apiKey}`),
    ]);

    const current = await currentRes.json();
    const forecast = await forecastRes.json();

    if (!currentRes.ok || !current.main) {
      return NextResponse.json(mockWeather(seed));
    }

    const forecastPoints: ForecastPoint[] = [0, 8, 16]
      .map((i) => forecast.list?.[i])
      .filter(Boolean)
      .map((entry: { dt: number; main: { temp: number }; weather: { description: string }[] }) => ({
        label: DAY_LABELS[new Date(entry.dt * 1000).getDay()],
        temp: Math.round(entry.main.temp),
        description: entry.weather?.[0]?.description ?? "—",
      }));

    const data: WeatherData = {
      temp: Math.round(current.main.temp),
      description: current.weather?.[0]?.description ?? "—",
      feelsLike: Math.round(current.main.feels_like),
      windSpeed: Math.round(current.wind?.speed ?? 0),
      humidity: current.main.humidity ?? 0,
      // OpenWeatherMap's free tier doesn't include UV index (that needs the
      // paid One Call 3.0 subscription) — derived as a stable placeholder.
      uvIndex: 2 + (seed % 5),
      forecast: forecastPoints.length > 0 ? forecastPoints : mockWeather(seed).forecast,
      mock: false,
    };

    return NextResponse.json(data);
  } catch (error) {
    console.error("weather route error", error);
    return NextResponse.json(mockWeather(seed));
  }
}
