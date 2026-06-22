import React, { useState } from "react";
import { ArrowLeftRight, TrendingUp, AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const CURRENCIES = [
  { code: "USD", name: "US Dollar", flag: "🇺🇸" },
  { code: "CAD", name: "Canadian Dollar", flag: "🇨🇦" },
  { code: "EUR", name: "Euro", flag: "🇪🇺" },
  { code: "GBP", name: "British Pound", flag: "🇬🇧" },
  { code: "JPY", name: "Japanese Yen", flag: "🇯🇵" },
  { code: "AUD", name: "Australian Dollar", flag: "🇦🇺" },
  { code: "CHF", name: "Swiss Franc", flag: "🇨🇭" },
  { code: "CNY", name: "Chinese Yuan", flag: "🇨🇳" },
  { code: "KRW", name: "South Korean Won", flag: "🇰🇷" },
  { code: "THB", name: "Thai Baht", flag: "🇹🇭" },
  { code: "SGD", name: "Singapore Dollar", flag: "🇸🇬" },
  { code: "HKD", name: "Hong Kong Dollar", flag: "🇭🇰" },
  { code: "MXN", name: "Mexican Peso", flag: "🇲🇽" },
  { code: "INR", name: "Indian Rupee", flag: "🇮🇳" },
  { code: "BRL", name: "Brazilian Real", flag: "🇧🇷" },
  { code: "NOK", name: "Norwegian Krone", flag: "🇳🇴" },
  { code: "SEK", name: "Swedish Krona", flag: "🇸🇪" },
  { code: "NZD", name: "New Zealand Dollar", flag: "🇳🇿" },
];

const QUICK_AMOUNTS = [50, 100, 500, 1000];

function CurrencySelect({ value, onChange, label }) {
  return (
    <div className="flex-1">
      <Label className="text-xs font-medium text-gray-500 mb-1.5 block">{label}</Label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full h-11 rounded-xl border border-gray-200 bg-white px-3 pr-8 text-sm font-medium text-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 appearance-none cursor-pointer"
        >
          {CURRENCIES.map((c) => (
            <option key={c.code} value={c.code}>
              {c.flag}  {c.code} — {c.name}
            </option>
          ))}
        </select>
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">▼</span>
      </div>
    </div>
  );
}

export default function CurrencyExchange() {
  const [from, setFrom] = useState("CAD");
  const [to, setTo] = useState("JPY");
  const [amount, setAmount] = useState("100");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const fromCurrency = CURRENCIES.find((c) => c.code === from);
  const toCurrency = CURRENCIES.find((c) => c.code === to);

  const handleSwap = () => {
    setFrom(to);
    setTo(from);
    setResult(null);
    setError(null);
  };

  const handleConvert = async () => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      setError("Please enter a valid amount.");
      return;
    }
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const API_KEY = "2ee109054e19536827f0e304";
      const res = await fetch(
        `https://v6.exchangerate-api.com/v6/${API_KEY}/latest/${from}`
      );
      
      if (!res.ok) {
        throw new Error("Failed to fetch exchange rates");
      }

      const data = await res.json();

      if (data.result === "error") {
        setError("Error fetching exchange rate: " + (data["error-type"] || "Unknown error"));
        setLoading(false);
        return;
      }

      const rate = data.conversion_rates[to];
      const converted = Number(amount) * rate;

      setResult({
        converted: converted,
        rate: rate,
        date: new Date().toLocaleDateString(),
      });
    } catch (err) {
      setError("Failed to fetch exchange rate. Please try again.");
      console.error(err);
    }
    setLoading(false);
  };

  const handleQuickAmount = (val) => {
    setAmount(String(val));
    setResult(null);
    setError(null);
  };

  return (
    <div className="p-6 lg:p-10 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 tracking-tight">Currency Exchange</h1>
        <p className="text-gray-500 mt-1 text-sm">Convert between currencies for your travels.</p>
      </div>

      {/* Converter Card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">

        {/* Currency Selectors */}
        <div className="flex items-end gap-3">
          <CurrencySelect value={from} onChange={(v) => { setFrom(v); setResult(null); setError(null); }} label="From" />

          <button
            onClick={handleSwap}
            className="mb-0.5 w-10 h-10 shrink-0 rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 flex items-center justify-center transition-colors"
            title="Swap currencies"
          >
            <ArrowLeftRight size={16} className="text-gray-500" />
          </button>

          <CurrencySelect value={to} onChange={(v) => { setTo(v); setResult(null); setError(null); }} label="To" />
        </div>

        {/* Amount Input */}
        <div>
          <Label className="text-xs font-medium text-gray-500 mb-1.5 block">Amount</Label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-400">
              {fromCurrency?.flag}
            </span>
            <Input
              type="number"
              min="0"
              step="any"
              value={amount}
              onChange={(e) => { setAmount(e.target.value); setResult(null); setError(null); }}
              placeholder="Enter amount"
              className="pl-10 rounded-xl border-gray-200 focus:border-gray-400 focus:ring-gray-400 text-base font-semibold"
            />
          </div>
          {/* Quick amounts */}
          <div className="flex gap-2 mt-2.5">
            {QUICK_AMOUNTS.map((q) => (
              <button
                key={q}
                onClick={() => handleQuickAmount(q)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors border ${
                  amount === String(q)
                    ? "bg-gray-900 text-white border-gray-900"
                    : "bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100"
                }`}
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Convert Button */}
        <Button
          onClick={handleConvert}
          disabled={loading}
          className="w-full rounded-xl bg-gray-900 hover:bg-gray-800 text-white h-11 text-sm font-semibold gap-2"
        >
          {loading ? (
            <>
              <RefreshCw size={15} className="animate-spin" />
              Fetching rate...
            </>
          ) : (
            <>
              <TrendingUp size={15} />
              Convert
            </>
          )}
        </Button>
      </div>

      {/* Result Card */}
      {result && (
        <div className="mt-4 bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 text-white shadow-lg shadow-gray-900/10">
          <p className="text-sm text-gray-400 mb-1">
            {Number(amount).toLocaleString()} {from} =
          </p>
          <p className="text-4xl font-bold tracking-tight">
            {toCurrency?.flag} {result.converted?.toLocaleString(undefined, { maximumFractionDigits: 2 })}
          </p>
          <p className="text-sm text-gray-400 mt-1">{to}</p>
          <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-gray-400">
            <span>1 {from} = {result.rate} {to}</span>
            <span>Rate as of {result.date}</span>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="mt-4 bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-3 items-start">
          <AlertCircle size={18} className="text-amber-500 shrink-0 mt-0.5" />
          <p className="text-sm text-amber-700">{error}</p>
        </div>
      )}

      {/* Info Card */}
      <div className="mt-4 bg-blue-50 border border-blue-100 rounded-2xl p-4">
        <p className="text-xs font-semibold text-blue-700 mb-1">💡 Travel Tip</p>
        <p className="text-xs text-blue-600">
          Exchange rates fluctuate daily. Always check rates close to your travel date and consider using a no-foreign-transaction-fee card abroad.
        </p>
      </div>
    </div>
  );
}