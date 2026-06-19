import logger from "@/lib/logger";

// Static exchange rates (approximate, USD-based)
const BASE_RATES_TO_USD = {
  USD: 1,
  CAD: 0.74,
  JPY: 0.0067,
  EUR: 1.08,
  GBP: 1.26,
  KRW: 0.00075,
  AUD: 0.65,
};

const KEY_API_KEY = "triptally:exchange-rate-api-key";
const KEY_RATES = "triptally:exchange-rates";
const KEY_RATES_TS = "triptally:exchange-rates-ts";

function loadJSON(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    if (key === KEY_RATES) {
      try { logger.debug('[triptally] saveJSON - saved rates count:', Object.keys(value || {}).length); } catch (e) {}
    }
  } catch {}
}

function loadSavedApiRates() {
  return loadJSON(KEY_RATES);
}

function getCustomOverrides() {
  try {
    const saved = localStorage.getItem("custom-exchange-rates");
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
}

// Effective rates: base <- API rates <- custom overrides
function getEffectiveRates() {
  const apiRates = loadSavedApiRates() || {};
  const custom = getCustomOverrides() || {};
  const effective = { ...BASE_RATES_TO_USD, ...apiRates, ...custom };
  try { logger.debug('[triptally] getEffectiveRates - effective sample:', { USD: effective.USD, CAD: effective.CAD, EUR: effective.EUR }); } catch (e) {}
  return effective;
}

export function getExchangeApiKey() {
  return localStorage.getItem(KEY_API_KEY) || "";
}

export function setExchangeApiKey(key) {
  if (key) localStorage.setItem(KEY_API_KEY, key);
  else localStorage.removeItem(KEY_API_KEY);
}

export function getRatesLastUpdated() {
  const ts = localStorage.getItem(KEY_RATES_TS);
  return ts ? parseInt(ts, 10) : null;
}

export async function fetchAndSaveRates(apiKey) {
  const key = apiKey || getExchangeApiKey();
  if (!key) throw new Error("No API key provided");

  // exchangerate-api.com v6 returns conversion_rates
  const url = `https://v6.exchangerate-api.com/v6/${encodeURIComponent(key)}/latest/USD`;
  logger.debug('[triptally] fetchAndSaveRates - fetching host: exchangerate-api.com');
  let res;
  try {
    res = await fetch(url);
  } catch (err) {
    logger.warn('[triptally] fetch failed, attempting proxied relative URL (dev proxy):', err?.message);
    // try proxied path (vite dev proxy configured to forward /v6 -> exchangerate-api.com/v6)
    const proxied = `/v6/${encodeURIComponent(key)}/latest/USD`;
    res = await fetch(proxied);
  }
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Fetch failed: ${res.status} ${txt}`);
  }
  const data = await res.json();
  logger.debug('[triptally] fetchAndSaveRates - response keys:', Object.keys(data || {}));
  const rates = data.conversion_rates || data.rates || {};
  if (!rates || Object.keys(rates).length === 0) throw new Error("No rates returned from API");

  saveJSON(KEY_RATES, rates);
  try { localStorage.setItem(KEY_RATES_TS, String(Date.now())); } catch {}
  try { window.dispatchEvent(new CustomEvent('triptally:rates-updated', { detail: { ts: Date.now(), count: Object.keys(rates).length } })); } catch (e) {}
  return rates;
}

export async function ensureRatesFresh(maxAgeMs = 24 * 60 * 60 * 1000) {
  const ts = getRatesLastUpdated();
  if (!ts || Date.now() - ts > maxAgeMs) {
    try {
      await fetchAndSaveRates();
      return true;
    } catch (e) {
      return false;
    }
  }
  return true;
}

export const CURRENCIES = [
  { code: "CAD", name: "Canadian Dollar", symbol: "CA$", flag: "🇨🇦" },
  { code: "USD", name: "US Dollar", symbol: "$", flag: "🇺🇸" },
  { code: "JPY", name: "Japanese Yen", symbol: "¥", flag: "🇯🇵" },
  { code: "EUR", name: "Euro", symbol: "€", flag: "🇪🇺" },
  { code: "GBP", name: "British Pound", symbol: "£", flag: "🇬🇧" },
  { code: "KRW", name: "Korean Won", symbol: "₩", flag: "🇰🇷" },
  { code: "AUD", name: "Australian Dollar", symbol: "A$", flag: "🇦🇺" },
];

export function convertCurrency(amount, from, to) {
  if (from === to) return amount;
  const rates = getEffectiveRates();
  try { logger.debug('[triptally] convertCurrency - inputs', { amount, from, to, ratesFrom: rates[from], ratesTo: rates[to] }); } catch (e) {}
  // conversion_rates from API are expressed as units of currency per 1 USD
  // to convert `amount` from `from` -> `to`: result = amount * (rate_to / rate_from)
  const rateFrom = rates[from] || BASE_RATES_TO_USD[from] || 1;
  const rateTo = rates[to] || BASE_RATES_TO_USD[to] || 1;
  const result = amount * (rateTo / rateFrom);
  const rounded = Math.round(result * 100) / 100;
  try { logger.debug('[triptally] convertCurrency - result', rounded); } catch (e) {}
  return rounded;
}

export function getExchangeRate(from, to) {
  const rates = getEffectiveRates();
  const fromToUSD = rates[from] || BASE_RATES_TO_USD[from] || 1;
  const toToUSD = rates[to] || BASE_RATES_TO_USD[to] || 1;
  const r = fromToUSD / toToUSD;
  try { logger.debug('[triptally] getExchangeRate', { from, to, fromToUSD, toToUSD, rate: r }); } catch (e) {}
  return r;
}

export function getBaseRates() { return BASE_RATES_TO_USD; }

export function formatCurrency(amount, currencyCode) {
  const currency = CURRENCIES.find(c => c.code === currencyCode);
  if (!currency) return `${amount.toFixed(2)}`;
  
  if (currencyCode === "JPY" || currencyCode === "KRW") {
    return `${currency.symbol}${Math.round(amount).toLocaleString()}`;
  }
  return `${currency.symbol}${amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
}

export const DEFAULT_CATEGORIES = [
  { name: "Entertainment", icon: "Gamepad2", color: "#8b5cf6", subcategories: ["Arcades", "Attractions", "Theme Parks", "Museums", "Games", "Movies", "Events"] },
  { name: "Food", icon: "UtensilsCrossed", color: "#f97316", subcategories: ["Restaurants", "Convenience Stores", "Snacks", "Cafes", "Drinks", "Groceries"] },
  { name: "Clothing", icon: "Shirt", color: "#ec4899", subcategories: ["Shirts", "Hoodies", "Pants", "Shoes", "Accessories"] },
  { name: "Skincare", icon: "Sparkles", color: "#14b8a6", subcategories: ["Cleansers", "Moisturizers", "Sunscreen", "Acne Treatments", "Face Masks"] },
  { name: "Knives", icon: "Scissors", color: "#64748b", subcategories: ["Chef Knives", "Santoku Knives", "Utility Knives", "Knife Accessories", "Knife Sharpening"] },
  { name: "Everyday Use", icon: "ShoppingBag", color: "#3b82f6", subcategories: ["Battery Packs", "Electronics", "Chargers", "Stationery", "Travel Gear", "Miscellaneous"] },
];

export const DEFAULT_DESTINATIONS = [
  "Tokyo", "Kyoto", "Osaka", "Yokohama", "Kamakura", "Nara"
];