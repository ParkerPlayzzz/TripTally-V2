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

// Read custom overrides from localStorage
function getEffectiveRates() {
  try {
    const saved = localStorage.getItem("custom-exchange-rates");
    if (saved) {
      const custom = JSON.parse(saved);
      return { ...BASE_RATES_TO_USD, ...custom };
    }
  } catch {}
  return BASE_RATES_TO_USD;
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
  const amountInUSD = amount * (rates[from] || BASE_RATES_TO_USD[from] || 1);
  const result = amountInUSD / (rates[to] || BASE_RATES_TO_USD[to] || 1);
  return Math.round(result * 100) / 100;
}

export function getExchangeRate(from, to) {
  const rates = getEffectiveRates();
  const fromToUSD = rates[from] || BASE_RATES_TO_USD[from] || 1;
  const toToUSD = rates[to] || BASE_RATES_TO_USD[to] || 1;
  return fromToUSD / toToUSD;
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