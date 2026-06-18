import React, { useState } from "react";
import { CURRENCIES, convertCurrency, getExchangeRate } from "@/lib/currencies";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeftRight } from "lucide-react";
import { motion } from "framer-motion";

export default function CurrencyConverter() {
  const [amount, setAmount] = useState("100");
  const [from, setFrom] = useState("CAD");
  const [to, setTo] = useState("JPY");

  const converted = convertCurrency(parseFloat(amount) || 0, from, to);
  const rate = getExchangeRate(from, to);
  const toCurrency = CURRENCIES.find((c) => c.code === to);

  const swap = () => {
    setFrom(to);
    setTo(from);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border rounded-3xl p-6 shadow-sm"
    >
      <h3 className="font-semibold font-heading mb-4">Currency Converter</h3>

      <div className="space-y-3">
        <div className="flex gap-2">
          <Input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="rounded-xl flex-1"
            placeholder="Amount"
          />
          <Select value={from} onValueChange={setFrom}>
            <SelectTrigger className="w-28 rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CURRENCIES.map((c) => (
                <SelectItem key={c.code} value={c.code}>
                  {c.flag} {c.code}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex justify-center">
          <button
            onClick={swap}
            className="p-2 rounded-xl bg-secondary hover:bg-secondary/80 transition-colors"
          >
            <ArrowLeftRight className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        <div className="bg-primary/5 border border-primary/10 rounded-2xl p-4 text-center">
          <p className="text-2xl font-bold text-primary">
            {toCurrency?.symbol}{converted.toLocaleString(undefined, { minimumFractionDigits: to === "JPY" || to === "KRW" ? 0 : 2, maximumFractionDigits: to === "JPY" || to === "KRW" ? 0 : 2 })}
          </p>
          <div className="flex items-center justify-center gap-2 mt-1">
            <Select value={to} onValueChange={setTo}>
              <SelectTrigger className="w-28 rounded-xl h-8 text-xs border-none bg-transparent">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CURRENCIES.map((c) => (
                  <SelectItem key={c.code} value={c.code}>
                    {c.flag} {c.code}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            1 {from} = {rate.toFixed(4)} {to}
          </p>
        </div>
      </div>
    </motion.div>
  );
}