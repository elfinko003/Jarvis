export interface City {
  name: string;
  country: string;
  lat: number;
  lng: number;
  timezone: string;
}

export const CITIES: City[] = [
  { name: "Stockholm", country: "Sweden", lat: 59.3293, lng: 18.0686, timezone: "UTC+1" },
  { name: "London", country: "United Kingdom", lat: 51.5072, lng: -0.1276, timezone: "UTC+0" },
  { name: "Berlin", country: "Germany", lat: 52.52, lng: 13.405, timezone: "UTC+1" },
  { name: "Moscow", country: "Russia", lat: 55.7558, lng: 37.6173, timezone: "UTC+3" },
  { name: "Paris", country: "France", lat: 48.8566, lng: 2.3522, timezone: "UTC+1" },
  { name: "Trier", country: "Germany", lat: 49.7596, lng: 6.6428, timezone: "UTC+1" },
  { name: "Tokyo", country: "Japan", lat: 35.6762, lng: 139.6503, timezone: "UTC+9" },
];
