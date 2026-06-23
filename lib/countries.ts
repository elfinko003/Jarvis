// REST Countries now requires a paid-free account + API key (a change made
// after this project's original plan was written), so country metadata is
// bundled locally instead — it barely changes and this avoids an extra
// network dependency for a personal always-on dashboard. Population figures
// are approximate. Extend this list as new countries come up in voice use.
export interface CountryInfo {
  name: string;
  aliases: string[];
  capital: string;
  population: number;
  lat: number;
  lng: number;
  cca2: string;
}

export const COUNTRIES: CountryInfo[] = [
  { name: "Germany", aliases: ["deutschland"], capital: "Berlin", population: 84500000, lat: 52.52, lng: 13.405, cca2: "de" },
  { name: "Austria", aliases: ["österreich", "oesterreich"], capital: "Vienna", population: 9100000, lat: 48.2082, lng: 16.3738, cca2: "at" },
  { name: "Switzerland", aliases: ["schweiz", "suisse"], capital: "Bern", population: 8800000, lat: 46.948, lng: 7.4474, cca2: "ch" },
  { name: "France", aliases: ["frankreich"], capital: "Paris", population: 68000000, lat: 48.8566, lng: 2.3522, cca2: "fr" },
  { name: "United Kingdom", aliases: ["uk", "großbritannien", "england"], capital: "London", population: 67700000, lat: 51.5072, lng: -0.1276, cca2: "gb" },
  { name: "Italy", aliases: ["italien", "italia"], capital: "Rome", population: 58900000, lat: 41.9028, lng: 12.4964, cca2: "it" },
  { name: "Spain", aliases: ["spanien", "españa"], capital: "Madrid", population: 47400000, lat: 40.4168, lng: -3.7038, cca2: "es" },
  { name: "Netherlands", aliases: ["niederlande", "holland"], capital: "Amsterdam", population: 17800000, lat: 52.3676, lng: 4.9041, cca2: "nl" },
  { name: "Belgium", aliases: ["belgien"], capital: "Brussels", population: 11700000, lat: 50.8503, lng: 4.3517, cca2: "be" },
  { name: "Poland", aliases: ["polen"], capital: "Warsaw", population: 37700000, lat: 52.2297, lng: 21.0122, cca2: "pl" },
  { name: "Sweden", aliases: ["schweden"], capital: "Stockholm", population: 10500000, lat: 59.3293, lng: 18.0686, cca2: "se" },
  { name: "Norway", aliases: ["norwegen"], capital: "Oslo", population: 5500000, lat: 59.9139, lng: 10.7522, cca2: "no" },
  { name: "Denmark", aliases: ["dänemark", "daenemark"], capital: "Copenhagen", population: 5900000, lat: 55.6761, lng: 12.5683, cca2: "dk" },
  { name: "Finland", aliases: ["finnland"], capital: "Helsinki", population: 5600000, lat: 60.1699, lng: 24.9384, cca2: "fi" },
  { name: "Russia", aliases: ["russland"], capital: "Moscow", population: 144000000, lat: 55.7558, lng: 37.6173, cca2: "ru" },
  { name: "Ukraine", aliases: ["ukraine"], capital: "Kyiv", population: 38000000, lat: 50.4501, lng: 30.5234, cca2: "ua" },
  { name: "United States", aliases: ["usa", "us", "vereinigte staaten", "amerika"], capital: "Washington, D.C.", population: 334900000, lat: 38.9072, lng: -77.0369, cca2: "us" },
  { name: "Canada", aliases: ["kanada"], capital: "Ottawa", population: 39600000, lat: 45.4215, lng: -75.6972, cca2: "ca" },
  { name: "Mexico", aliases: ["mexiko"], capital: "Mexico City", population: 128900000, lat: 19.4326, lng: -99.1332, cca2: "mx" },
  { name: "Brazil", aliases: ["brasilien"], capital: "Brasília", population: 216400000, lat: -15.8267, lng: -47.9218, cca2: "br" },
  { name: "Argentina", aliases: ["argentinien"], capital: "Buenos Aires", population: 45800000, lat: -34.6037, lng: -58.3816, cca2: "ar" },
  { name: "Japan", aliases: ["japan"], capital: "Tokyo", population: 123700000, lat: 35.6762, lng: 139.6503, cca2: "jp" },
  { name: "China", aliases: ["china"], capital: "Beijing", population: 1412000000, lat: 39.9042, lng: 116.4074, cca2: "cn" },
  { name: "South Korea", aliases: ["südkorea", "suedkorea", "korea"], capital: "Seoul", population: 51700000, lat: 37.5665, lng: 126.978, cca2: "kr" },
  { name: "India", aliases: ["indien"], capital: "New Delhi", population: 1428600000, lat: 28.6139, lng: 77.209, cca2: "in" },
  { name: "Australia", aliases: ["australien"], capital: "Canberra", population: 26600000, lat: -35.2809, lng: 149.13, cca2: "au" },
  { name: "New Zealand", aliases: ["neuseeland"], capital: "Wellington", population: 5200000, lat: -41.2865, lng: 174.7762, cca2: "nz" },
  { name: "Egypt", aliases: ["ägypten", "aegypten"], capital: "Cairo", population: 112700000, lat: 30.0444, lng: 31.2357, cca2: "eg" },
  { name: "South Africa", aliases: ["südafrika", "suedafrika"], capital: "Pretoria", population: 60400000, lat: -25.7479, lng: 28.2293, cca2: "za" },
  { name: "Turkey", aliases: ["türkei", "tuerkei"], capital: "Ankara", population: 85800000, lat: 39.9334, lng: 32.8597, cca2: "tr" },
  { name: "Greece", aliases: ["griechenland"], capital: "Athens", population: 10400000, lat: 37.9838, lng: 23.7275, cca2: "gr" },
  { name: "Portugal", aliases: ["portugal"], capital: "Lisbon", population: 10300000, lat: 38.7223, lng: -9.1393, cca2: "pt" },
  { name: "Ireland", aliases: ["irland"], capital: "Dublin", population: 5100000, lat: 53.3498, lng: -6.2603, cca2: "ie" },
];

const DEFAULT_COUNTRY = "Germany";

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

export function findCountry(query: string): CountryInfo | null {
  const needle = normalize(query);
  return (
    COUNTRIES.find(
      (c) => normalize(c.name) === needle || c.aliases.some((alias) => normalize(alias) === needle)
    ) ?? null
  );
}

export function getDefaultCountry(): CountryInfo {
  return findCountry(DEFAULT_COUNTRY) ?? COUNTRIES[0];
}

export function findCountryByCca2(cca2: string): CountryInfo | null {
  const needle = cca2.toLowerCase();
  return COUNTRIES.find((c) => c.cca2 === needle) ?? null;
}

// Flag emojis are pure Unicode (each letter of an ISO 3166-1 alpha-2 code
// maps to a regional-indicator symbol) — no API or dataset needed, works
// for literally any country code.
const CURRENCY_BY_CCA2: Record<string, string> = {
  de: "EUR", at: "EUR", ch: "CHF", fr: "EUR", gb: "GBP", it: "EUR", es: "EUR",
  nl: "EUR", be: "EUR", pl: "PLN", se: "SEK", no: "NOK", dk: "DKK", fi: "EUR",
  ru: "RUB", ua: "UAH", us: "USD", ca: "CAD", mx: "MXN", br: "BRL", ar: "ARS",
  jp: "JPY", cn: "CNY", kr: "KRW", in: "INR", au: "AUD", nz: "NZD", eg: "EGP",
  za: "ZAR", tr: "TRY", gr: "EUR", pt: "EUR", ie: "EUR",
};

export function currencyForCca2(cca2: string | null): string {
  if (!cca2) return "—";
  return CURRENCY_BY_CCA2[cca2.toLowerCase()] ?? "—";
}

export function flagEmoji(countryCode: string | null): string {
  if (!countryCode || countryCode.length !== 2) return "🏳";
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((c) => 0x1f1e6 - 65 + c.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}
