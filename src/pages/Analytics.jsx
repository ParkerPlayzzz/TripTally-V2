const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

import { motion } from "framer-motion";
import { BarChart3, ShoppingCart } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, ReferenceLine
} from "recharts";
import { formatCurrency } from "@/lib/currencies";
import { format } from "date-fns";
import EmptyState from "@/components/shared/EmptyState";

const stagger = { animate: { transition: { staggerChildren: 0.06 } } };
const fadeUp = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] } },
};

// ── Budget vs Spent bar for a single trip ────────────────────────────────────
function TripBudgetBar({ trip, spent }) {
  const pct = trip.total_budget > 0 ? Math.min((spent / trip.total_budget) * 100, 100) : 0;
  const over = spent > trip.total_budget;
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-baseline">
        <span className="text-sm font-medium truncate max-w-[60%]">{trip.name}</span>
        <span className="text-xs text-muted-foreground">
          {formatCurrency(spent, trip.home_currency)} / {formatCurrency(trip.total_budget, trip.home_currency)}
        </span>
      </div>
      <div className="h-2 bg-secondary rounded-full overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${over ? "bg-destructive" : "bg-foreground"}`}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
        />
      </div>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{Math.round(pct)}% used</span>
        <span className={over ? "text-destructive font-medium" : ""}>
          {over
            ? `${formatCurrency(spent - trip.total_budget, trip.home_currency)} over`
            : `${formatCurrency(trip.total_budget - spent, trip.home_currency)} left`}
        </span>
      </div>
    </div>
  );
}

// ── Category budget vs spent progress rows ───────────────────────────────────
function CategoryProgressRow({ cat, spent, homeCurrency }) {
  const pct = cat.planned_budget > 0 ? Math.min((spent / cat.planned_budget) * 100, 100) : 0;
  const over = spent > cat.planned_budget;
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-baseline">
        <span className="text-xs font-medium text-foreground">{cat.name}</span>
        <span className="text-xs text-muted-foreground">
          {formatCurrency(spent, homeCurrency)} / {formatCurrency(cat.planned_budget, homeCurrency)}
        </span>
      </div>
      <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${over ? "bg-destructive" : pct > 80 ? "bg-warning" : "bg-foreground"}`}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
        />
      </div>
    </div>
  );
}

export default function Analytics() {
  const [selectedTripId, setSelectedTripId] = useState("");

  const { data: trips = [] } = useQuery({
    queryKey: ["trips"],
    queryFn: () => db.entities.Trip.list("-created_date"),
  });

  // All purchases — for cross-trip overview
  const { data: allPurchases = [] } = useQuery({
    queryKey: ["purchases-all"],
    queryFn: () => db.entities.Purchase.list("-created_date"),
  });

  const activeTrip = selectedTripId
    ? trips.find((t) => t.id === selectedTripId)
    : trips.find((t) => t.status === "active") || trips[0];

  useEffect(() => {
    if (activeTrip && !selectedTripId) setSelectedTripId(activeTrip.id);
  }, [activeTrip]);

  const { data: categories = [] } = useQuery({
    queryKey: ["categories", activeTrip?.id],
    queryFn: () => db.entities.BudgetCategory.filter({ trip_id: activeTrip.id }),
    enabled: !!activeTrip,
  });

  const { data: purchases = [] } = useQuery({
    queryKey: ["purchases", activeTrip?.id],
    queryFn: () => db.entities.Purchase.filter({ trip_id: activeTrip.id }),
    enabled: !!activeTrip,
  });

  const homeCurrency = activeTrip?.home_currency || "CAD";

  // Per-trip totals for overview
  const tripTotals = trips.map((t) => ({
    trip: t,
    spent: allPurchases.filter((p) => p.trip_id === t.id).reduce((s, p) => s + (p.converted_amount || p.amount), 0),
  }));

  // Category spending for selected trip
  const categoryData = categories.map((cat, i) => {
    const spent = purchases.filter((p) => p.category_id === cat.id).reduce((sum, p) => sum + (p.converted_amount || p.amount), 0);
    return { cat, spent };
  }).filter((d) => d.spent > 0 || d.cat.planned_budget > 0);

  // Recharts category bar data
  const catBarData = categoryData.map(({ cat, spent }) => ({
    name: cat.name,
    Spent: parseFloat(spent.toFixed(2)),
    Budget: parseFloat((cat.planned_budget || 0).toFixed(2)),
  }));

  // Daily spending
  const dailyMap = {};
  purchases.forEach((p) => {
    dailyMap[p.date] = (dailyMap[p.date] || 0) + (p.converted_amount || p.amount);
  });
  const dailyData = Object.entries(dailyMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, amount]) => ({ date: format(new Date(date + "T00:00:00"), "MMM d"), amount: parseFloat(amount.toFixed(2)) }));

  const totalSpent = purchases.reduce((sum, p) => sum + (p.converted_amount || p.amount), 0);
  const avgDaily = dailyData.length > 0 ? totalSpent / dailyData.length : 0;
  const largestPurchase = purchases.length > 0
    ? purchases.reduce((max, p) => (p.converted_amount || p.amount) > (max.converted_amount || max.amount) ? p : max, purchases[0])
    : null;

  if (!activeTrip) {
    return (
      <div className="p-6 lg:p-10 max-w-3xl mx-auto">
        <EmptyState icon={BarChart3} title="No data yet" description="Create a trip and add purchases to see analytics" />
      </div>
    );
  }

  return (
    <motion.div
      variants={stagger}
      initial="initial"
      animate="animate"
      className="max-w-2xl mx-auto px-6 py-10 lg:py-12 space-y-8"
    >
      {/* Header */}
      <motion.div variants={fadeUp} className="flex items-end justify-between">
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium mb-1.5">Analytics</p>
          <h1 className="text-2xl font-semibold tracking-tight">Spending Overview</h1>
        </div>
        {trips.length > 1 && (
          <Select value={selectedTripId} onValueChange={setSelectedTripId}>
            <SelectTrigger className="w-40 rounded-xl text-xs h-7 border-0 bg-secondary">
              <SelectValue placeholder="Select trip" />
            </SelectTrigger>
            <SelectContent>
              {trips.map((t) => (
                <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </motion.div>

      {/* All-trips Budget vs Spent */}
      {trips.length > 0 && (
        <motion.div variants={fadeUp} className="space-y-5">
          <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium">All Trips</p>
          <div className="divide-y divide-border border border-border rounded-2xl overflow-hidden bg-card">
            {tripTotals.map(({ trip, spent }, i) => (
              <div key={trip.id} className="px-5 py-4">
                <TripBudgetBar trip={trip} spent={spent} />
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Summary cards */}
      {purchases.length > 0 && (
        <motion.div variants={fadeUp} className="grid grid-cols-3 divide-x divide-border border border-border rounded-2xl overflow-hidden bg-card">
          <div className="px-4 py-3.5">
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Total Spent</p>
            <p className="text-base font-semibold tracking-tight">{formatCurrency(totalSpent, homeCurrency)}</p>
          </div>
          <div className="px-4 py-3.5">
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Avg / Day</p>
            <p className="text-base font-semibold tracking-tight">{formatCurrency(avgDaily, homeCurrency)}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">{dailyData.length} days</p>
          </div>
          <div className="px-4 py-3.5">
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Largest Buy</p>
            <p className="text-base font-semibold tracking-tight">{formatCurrency(largestPurchase?.converted_amount || largestPurchase?.amount || 0, homeCurrency)}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5 truncate">{largestPurchase?.item_name}</p>
          </div>
        </motion.div>
      )}

      {purchases.length === 0 ? (
        <motion.div variants={fadeUp}>
          <EmptyState icon={ShoppingCart} title="No purchases yet" description="Add purchases to see spending analytics" />
        </motion.div>
      ) : (
        <>
          {/* Category budget vs spent progress */}
          {categoryData.length > 0 && (
            <motion.div variants={fadeUp} className="divide-y divide-border border border-border rounded-2xl overflow-hidden bg-card">
              <div className="px-5 py-3.5">
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium">Budget by Category</p>
              </div>
              {categoryData.map(({ cat, spent }) => (
                <div key={cat.id} className="px-5 py-4">
                  <CategoryProgressRow cat={cat} spent={spent} homeCurrency={homeCurrency} />
                </div>
              ))}
            </motion.div>
          )}

          {/* Category grouped bar chart */}
          {catBarData.length > 0 && (
            <motion.div variants={fadeUp} className="border border-border rounded-2xl overflow-hidden bg-card">
              <div className="px-5 pt-4 pb-2 flex items-center justify-between">
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium">Category Comparison</p>
                <div className="flex gap-3">
                  <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                    <div className="w-2.5 h-2.5 rounded-sm bg-secondary border border-border" />Budget
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                    <div className="w-2.5 h-2.5 rounded-sm bg-foreground" />Spent
                  </div>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={catBarData} barCategoryGap="30%" margin={{ left: -10, right: 16, bottom: 0, top: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} width={48} />
                  <Tooltip
                    formatter={(v, name) => [formatCurrency(v, homeCurrency), name]}
                    contentStyle={{ borderRadius: 10, border: "1px solid hsl(var(--border))", fontSize: 11, padding: "6px 10px" }}
                  />
                  <Bar dataKey="Budget" fill="hsl(var(--secondary))" stroke="hsl(var(--border))" strokeWidth={1} radius={[3, 3, 0, 0]} />
                  <Bar dataKey="Spent" fill="hsl(var(--foreground))" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>
          )}

          {/* Daily spending */}
          {dailyData.length > 0 && (
            <motion.div variants={fadeUp} className="border border-border rounded-2xl overflow-hidden bg-card">
              <div className="px-5 pt-4 pb-2">
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium">Spending by Day</p>
              </div>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={dailyData} margin={{ left: -10, right: 16, bottom: 0, top: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} width={48} />
                  <Tooltip
                    formatter={(v) => [formatCurrency(v, homeCurrency), "Spent"]}
                    contentStyle={{ borderRadius: 10, border: "1px solid hsl(var(--border))", fontSize: 11, padding: "6px 10px" }}
                  />
                  {avgDaily > 0 && <ReferenceLine y={avgDaily} stroke="hsl(var(--muted-foreground))" strokeDasharray="4 4" label={{ value: "avg", fill: "hsl(var(--muted-foreground))", fontSize: 10, position: "right" }} />}
                  <Bar dataKey="amount" fill="hsl(var(--foreground))" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>
          )}
        </>
      )}
    </motion.div>
  );
}