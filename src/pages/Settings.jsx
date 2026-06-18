const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Moon, Sun, Monitor, LogOut, User, Bell, Layers, Type, RefreshCw, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

import CurrencyConverter from "@/components/budget/CurrencyConverter";
import { useTransparency } from "@/lib/TransparencyContext";
import { glassStyle } from "@/lib/glassStyle";
import { useFontSize } from "@/lib/FontSizeContext";
import { CURRENCIES, getBaseRates } from "@/lib/currencies";

export default function Settings() {
  const [theme, setTheme] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("theme") || "system";
    }
    return "system";
  });
  const [notifications, setNotifications] = useState(true);
  const { opacity, setOpacity } = useTransparency();
  const { size: fontSize, setSize: setFontSize, defaultSize } = useFontSize();

  // Exchange rate state — stored as "how many units of foreign currency per 1 USD"
  const baseRates = getBaseRates();
  const [customRates, setCustomRates] = useState(() => {
    try {
      const saved = localStorage.getItem("custom-exchange-rates");
      return saved ? JSON.parse(saved) : {};
    } catch { return {}; }
  });

  const updateRate = (code, value) => {
    const parsed = parseFloat(value);
    const updated = { ...customRates };
    if (!isNaN(parsed) && parsed > 0) {
      updated[code] = parsed;
    } else {
      delete updated[code];
    }
    setCustomRates(updated);
    localStorage.setItem("custom-exchange-rates", JSON.stringify(updated));
  };

  const resetRate = (code) => {
    const updated = { ...customRates };
    delete updated[code];
    setCustomRates(updated);
    localStorage.setItem("custom-exchange-rates", JSON.stringify(updated));
  };

  const applyTheme = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    const root = document.documentElement;
    if (newTheme === "dark") {
      root.classList.add("dark");
    } else if (newTheme === "light") {
      root.classList.remove("dark");
    } else {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      root.classList.toggle("dark", prefersDark);
    }
  };

  const themeOptions = [
    { value: "light", label: "Light", icon: Sun },
    { value: "dark", label: "Dark", icon: Moon },
    { value: "system", label: "System", icon: Monitor },
  ];

  return (
    <div className="p-6 lg:p-10 max-w-3xl mx-auto space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold font-heading tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Customize your experience</p>
      </motion.div>

      {/* Appearance */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="bg-card border border-border rounded-3xl p-6 shadow-sm">
        <h2 className="font-semibold font-heading mb-4 flex items-center gap-2">
          <Sun className="w-4 h-4 text-primary" /> Appearance
        </h2>
        <div className="grid grid-cols-3 gap-3">
          {themeOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => applyTheme(opt.value)}
              className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${
                theme === opt.value
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/30"
              }`}
            >
              <opt.icon className={`w-5 h-5 ${theme === opt.value ? "text-primary" : "text-muted-foreground"}`} />
              <span className={`text-sm font-medium ${theme === opt.value ? "text-primary" : ""}`}>
                {opt.label}
              </span>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Notifications */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card border border-border rounded-3xl p-6 shadow-sm">
        <h2 className="font-semibold font-heading mb-4 flex items-center gap-2">
          <Bell className="w-4 h-4 text-primary" /> Notifications
        </h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Budget Warnings</p>
              <p className="text-xs text-muted-foreground">Alert when nearing budget limits</p>
            </div>
            <Switch checked={notifications} onCheckedChange={setNotifications} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Daily Reminders</p>
              <p className="text-xs text-muted-foreground">Remind to log purchases</p>
            </div>
            <Switch />
          </div>
        </div>
      </motion.div>

      {/* Transparency */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm">
        <div className="p-6 pb-5">
          <h2 className="font-semibold font-heading mb-1 flex items-center gap-2">
            <Layers className="w-4 h-4 text-primary" /> Transparency
          </h2>
          <p className="text-xs text-muted-foreground mb-4">Controls how see-through dialogs and panels appear</p>

          {/* Live preview — image behind, glass card on top */}
          <div className="relative rounded-2xl overflow-hidden mb-5" style={{ height: 220 }}>
            <img
              src="https://media.db.com/images/public/6a29bf0d4d931c5df388f555/1e7a48249_IMG_1079.jpg"
              alt="preview backdrop"
              className="absolute inset-0 w-full h-full object-cover"
            />
            {/* Scrim so text on card is readable regardless */}
            <div className="absolute inset-0 bg-black/10" />

            {/* The glass card — mirrors exactly what dialogs look like */}
            <div
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-56 rounded-2xl border border-white/20 transition-all duration-200 px-5 py-4"
              style={glassStyle(opacity)}
            >
              <p className="text-xs font-semibold text-black/80 mb-0.5">Dialog Preview</p>
              <p className="text-[11px] text-black/55 leading-snug">
                {opacity <= 0.2 ? "Crystal clear — content fully visible" : opacity >= 0.97 ? "Solid — no transparency" : "Frosted glass effect"}
              </p>
              <div className="mt-3 h-1.5 rounded-full bg-black/10 overflow-hidden">
                <div className="h-full rounded-full bg-black/25" style={{ width: "60%" }} />
              </div>
            </div>
          </div>

          {/* Slider row — clear icon ↔ solid icon */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-3">
              {/* Clear icon */}
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none" className="flex-shrink-0 text-muted-foreground">
                <rect x="3" y="3" width="16" height="16" rx="4" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.4"/>
              </svg>
              <input
                type="range"
                min={0.05}
                max={1}
                step={0.01}
                value={opacity}
                onChange={(e) => setOpacity(parseFloat(e.target.value))}
                className="flex-1 h-1.5 rounded-full appearance-none bg-secondary cursor-pointer accent-foreground"
              />
              {/* Solid icon */}
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none" className="flex-shrink-0 text-foreground">
                <rect x="3" y="3" width="16" height="16" rx="4" fill="currentColor"/>
              </svg>
            </div>
            <p className="text-[10px] text-muted-foreground text-center">
              Clear is more transparent · Solid adds contrast to content
            </p>
          </div>
        </div>
      </motion.div>

      {/* Font Size */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-card border border-border rounded-3xl p-6 shadow-sm">
        <h2 className="font-semibold font-heading mb-1 flex items-center gap-2">
          <Type className="w-4 h-4 text-primary" /> Font Size
        </h2>
        <p className="text-xs text-muted-foreground mb-4">Adjust the text size across the app</p>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground flex-shrink-0">A</span>
          <input
            type="range"
            min={0.8}
            max={1.3}
            step={0.05}
            value={fontSize}
            onChange={(e) => setFontSize(parseFloat(e.target.value))}
            className="flex-1 h-1.5 rounded-full appearance-none bg-secondary cursor-pointer accent-foreground"
          />
          <span className="text-base text-muted-foreground flex-shrink-0 font-medium">A</span>
        </div>
        <div className="flex items-center justify-between mt-3">
          <p className="text-[10px] text-muted-foreground">{Math.round(fontSize * 100)}% size</p>
          {fontSize !== defaultSize && (
            <button
              onClick={() => setFontSize(defaultSize)}
              className="text-[10px] text-muted-foreground underline underline-offset-2 hover:text-foreground transition-colors"
            >
              Reset to default
            </button>
          )}
        </div>
      </motion.div>

      {/* Exchange Rates */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }} className="bg-card border border-border rounded-3xl p-6 shadow-sm">
        <h2 className="font-semibold font-heading mb-1 flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-primary" /> Exchange Rates
        </h2>
        <p className="text-xs text-muted-foreground mb-4">Override rates — enter how many units of each currency equal 1 USD</p>
        <div className="divide-y divide-border border border-border rounded-2xl overflow-hidden">
          {CURRENCIES.filter(c => c.code !== "USD").map((c) => {
            const defaultRate = baseRates[c.code];
            const currentVal = customRates[c.code] ?? defaultRate;
            const isCustom = !!customRates[c.code];
            return (
              <div key={c.code} className="flex items-center px-4 py-3 gap-3">
                <span className="text-sm w-20 flex-shrink-0">{c.flag} {c.code}</span>
                <input
                  type="number"
                  step="any"
                  className="flex-1 bg-transparent text-sm text-foreground outline-none text-right placeholder:text-muted-foreground/40"
                  value={currentVal}
                  onChange={(e) => updateRate(c.code, e.target.value)}
                />
                {isCustom && (
                  <button onClick={() => resetRate(c.code)} className="text-muted-foreground/50 hover:text-foreground transition-colors flex-shrink-0" title="Reset to default">
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
        <p className="text-[10px] text-muted-foreground mt-2">Modified rates show a reset button (↺). Changes apply immediately to all conversions.</p>
      </motion.div>

      {/* Currency Converter */}
      <CurrencyConverter />

      {/* Account */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-card border border-border rounded-3xl p-6 shadow-sm">
        <h2 className="font-semibold font-heading mb-4 flex items-center gap-2">
          <User className="w-4 h-4 text-primary" /> Account
        </h2>
        <Button
          variant="outline"
          onClick={() => db.auth.logout()}
          className="rounded-xl gap-2 text-destructive hover:text-destructive"
        >
          <LogOut className="w-4 h-4" /> Sign Out
        </Button>
      </motion.div>
    </div>
  );
}