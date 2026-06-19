import React, { useState, useEffect } from "react";
import { useLocalData } from "@/context/LocalDataContext";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Receipt, ArrowUpDown, SlidersHorizontal, X } from "lucide-react";
import CategoryCard from "@/components/budget/CategoryCard";
import PurchaseDialog from "@/components/budget/PurchaseDialog";
import CategoryDialog from "@/components/budget/CategoryDialog";
import StatCard from "@/components/shared/StatCard";
import EmptyState from "@/components/shared/EmptyState";
import GreetingHeader from "@/components/shared/GreetingHeader";
import { formatCurrency } from "@/lib/currencies";
import { Wallet, TrendingDown, CalendarDays, ShoppingCart } from "lucide-react";
import { format, differenceInDays } from "date-fns";

export default function Budget() {
  const [purchaseDialogOpen, setPurchaseDialogOpen] = useState(false);
  const [editingPurchase, setEditingPurchase] = useState(null);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [selectedTripId, setSelectedTripId] = useState("");
  const [sortOrder, setSortOrder] = useState("date_desc");
  const [filterCity, setFilterCity] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterPeriod, setFilterPeriod] = useState("");
  const { trips: allTrips = [], categories: allCategories = [], purchases: allPurchases = [], addCategory, updateCategory, deleteCategory, addPurchase, updatePurchase, deletePurchase } = useLocalData();

  const trips = allTrips;

  const activeTrip = selectedTripId
    ? trips.find((t) => t.id === selectedTripId)
    : trips.find((t) => t.status === "active") || trips[0];

  useEffect(() => {
    if (activeTrip && !selectedTripId) setSelectedTripId(activeTrip.id);
  }, [activeTrip]);

  const categories = activeTrip ? allCategories.filter((c) => c.trip_id === activeTrip.id) : [];

  const purchases = activeTrip ? allPurchases.filter((p) => p.trip_id === activeTrip.id) : [];

  const handleSaveCategory = (data) => {
    if (editingCategory) {
      updateCategory(editingCategory.id, data);
    } else {
      addCategory(data);
    }
    setEditingCategory(null);
  };

  const handleSavePurchase = (data) => {
    if (editingPurchase) {
      updatePurchase(editingPurchase.id, data);
    } else {
      addPurchase(data);
    }
    setEditingPurchase(null);
  };

  const totalSpent = purchases.reduce((sum, p) => sum + (p.converted_amount || p.amount), 0);
  const homeCurrency = activeTrip?.home_currency || "CAD";
  const remaining = (activeTrip?.total_budget || 0) - totalSpent;
  const budgetPct = activeTrip?.total_budget > 0 ? Math.round((totalSpent / activeTrip.total_budget) * 100) : 0;
  const budgetSubtext = activeTrip
    ? remaining >= 0
      ? `You are currently ${100 - budgetPct}% under budget.`
      : `You are ${budgetPct - 100}% over budget.`
    : null;
  const tripDays = activeTrip ? Math.max(differenceInDays(new Date(activeTrip.end_date), new Date(activeTrip.start_date)), 1) : 1;
  const dailyAvg = totalSpent / tripDays;

  const now = new Date();
  const filteredPurchases = purchases.filter((p) => {
    if (filterCity && p.city?.toLowerCase() !== filterCity.toLowerCase()) return false;
    if (filterCategory && p.category_id !== filterCategory) return false;
    if (filterPeriod) {
      const d = new Date(p.date);
      if (filterPeriod === "day" && d.toDateString() !== now.toDateString()) return false;
      if (filterPeriod === "month" && (d.getMonth() !== now.getMonth() || d.getFullYear() !== now.getFullYear())) return false;
      if (filterPeriod === "year" && d.getFullYear() !== now.getFullYear()) return false;
    }
    return true;
  }).sort((a, b) => {
    if (sortOrder === "date_desc") return new Date(b.date) - new Date(a.date);
    if (sortOrder === "date_asc") return new Date(a.date) - new Date(b.date);
    if (sortOrder === "amount_asc") return (a.converted_amount || a.amount) - (b.converted_amount || b.amount);
    if (sortOrder === "amount_desc") return (b.converted_amount || b.amount) - (a.converted_amount || a.amount);
    return 0;
  });

  const allCities = [...new Set(purchases.map(p => p.city).filter(Boolean))];
  const hasFilters = filterCity || filterCategory || filterPeriod;

  const getCategorySpent = (categoryId) => {
    return purchases
      .filter((p) => p.category_id === categoryId)
      .reduce((sum, p) => sum + (p.converted_amount || p.amount), 0);
  };

  if (!activeTrip) {
    return (
      <div className="p-6 lg:p-10 max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold font-heading tracking-tight mb-2">Budget</h1>
        <EmptyState
          icon={Wallet}
          title="No trips yet"
          description="Create a trip first to start tracking your budget"
          actionLabel="Create Trip"
          onAction={() => window.location.href = "/trips"}
        />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-10 max-w-5xl mx-auto space-y-8">
      {/* Greeting */}
      <GreetingHeader subtext={budgetSubtext} />

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-heading tracking-tight">Budget</h1>
          <p className="text-sm text-muted-foreground mt-1">Track your spending</p>
        </div>
        <div className="flex items-center gap-3">
          {trips.length > 1 && (
            <Select value={selectedTripId} onValueChange={setSelectedTripId}>
              <SelectTrigger className="w-48 rounded-xl">
                <SelectValue placeholder="Select trip" />
              </SelectTrigger>
              <SelectContent>
                {trips.map((t) => (
                  <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <Button onClick={() => { setEditingPurchase(null); setPurchaseDialogOpen(true); }} className="rounded-2xl gap-2 shadow-lg shadow-primary/20">
            <Plus className="w-4 h-4" /> Add Purchase
          </Button>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Budget" value={formatCurrency(activeTrip.total_budget, homeCurrency)} icon={Wallet} compact />
        <StatCard title="Total Spent" value={formatCurrency(totalSpent, homeCurrency)} icon={ShoppingCart} compact />
        <StatCard title="Remaining" value={formatCurrency(Math.max(remaining, 0), homeCurrency)} icon={TrendingDown} subtitle={remaining < 0 ? "Over budget!" : undefined} compact />
        <StatCard title="Daily Average" value={formatCurrency(dailyAvg, homeCurrency)} icon={CalendarDays} subtitle={`over ${tripDays} days`} compact />
      </div>

      {/* Budget Progress */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
        <div className="bg-card border border-border rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold font-heading">Overall Progress</h2>
            <span className="text-sm font-medium text-muted-foreground">
              {Math.min(Math.round((totalSpent / activeTrip.total_budget) * 100), 100)}%
            </span>
          </div>
          <div className="w-full bg-secondary rounded-full h-3">
            <motion.div
              className="h-3 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${Math.min((totalSpent / activeTrip.total_budget) * 100, 100)}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              style={{
                background: totalSpent > activeTrip.total_budget
                  ? "hsl(var(--destructive))"
                  : "linear-gradient(90deg, hsl(var(--primary)), hsl(var(--accent)))",
              }}
            />
          </div>
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            <span>{formatCurrency(0, homeCurrency)}</span>
            <span>{formatCurrency(activeTrip.total_budget, homeCurrency)}</span>
          </div>
        </div>
      </motion.div>

      {/* Categories */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-medium text-foreground uppercase tracking-widest">Categories</h2>
          <Button
            variant="outline"
            size="sm"
            className="rounded-xl text-xs h-8 px-3 gap-1.5"
            onClick={() => { setEditingCategory(null); setCategoryDialogOpen(true); }}
          >
            <Plus className="w-3.5 h-3.5" /> New Category
          </Button>
        </div>
        {categories.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No categories yet — add one to start tracking.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((cat) => (
              <div key={cat.id} className="cursor-pointer" onClick={() => { setEditingCategory(cat); setCategoryDialogOpen(true); }}>
                <CategoryCard
                  category={cat}
                  spent={getCategorySpent(cat.id)}
                  currency={homeCurrency}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Transaction History */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold font-heading">Purchases</h2>
          <p className="text-sm text-muted-foreground">{filteredPurchases.length} of {purchases.length}</p>
        </div>

        {/* Sort + Filter bar */}
        <div className="flex flex-wrap gap-2 mb-4">
          <select
            value={sortOrder}
            onChange={e => setSortOrder(e.target.value)}
            className="text-xs bg-secondary border border-border rounded-xl px-3 py-1.5 text-foreground outline-none cursor-pointer"
          >
            <option value="date_desc">Newest first</option>
            <option value="date_asc">Oldest first</option>
            <option value="amount_asc">Lowest amount</option>
            <option value="amount_desc">Highest amount</option>
          </select>

          <select
            value={filterPeriod}
            onChange={e => setFilterPeriod(e.target.value)}
            className="text-xs bg-secondary border border-border rounded-xl px-3 py-1.5 text-foreground outline-none cursor-pointer"
          >
            <option value="">All time</option>
            <option value="day">Today</option>
            <option value="month">This month</option>
            <option value="year">This year</option>
          </select>

          <select
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value)}
            className="text-xs bg-secondary border border-border rounded-xl px-3 py-1.5 text-foreground outline-none cursor-pointer"
          >
            <option value="">All categories</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>

          {allCities.length > 0 && (
            <select
              value={filterCity}
              onChange={e => setFilterCity(e.target.value)}
              className="text-xs bg-secondary border border-border rounded-xl px-3 py-1.5 text-foreground outline-none cursor-pointer"
            >
              <option value="">All cities</option>
              {allCities.map(city => <option key={city} value={city}>{city}</option>)}
            </select>
          )}

          {hasFilters && (
            <button
              onClick={() => { setFilterCity(""); setFilterCategory(""); setFilterPeriod(""); }}
              className="text-xs text-muted-foreground flex items-center gap-1 px-2 py-1.5 hover:text-foreground transition-colors"
            >
              <X className="w-3 h-3" /> Clear
            </button>
          )}
        </div>

        {purchases.length === 0 ? (
          <EmptyState icon={Receipt} title="No purchases yet" description="Add your first purchase to start tracking" />
        ) : filteredPurchases.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No purchases match your filters.</p>
        ) : (
          <div className="space-y-2">
            {filteredPurchases.map((p) => {
              const cat = categories.find(c => c.id === p.category_id);
              return (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center justify-between p-4 bg-card border border-border rounded-2xl hover:shadow-md transition-all cursor-pointer"
                  onClick={() => { setEditingPurchase(p); setPurchaseDialogOpen(true); }}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${cat?.color || "#6366f1"}20` }}>
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat?.color || "#6366f1" }} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{p.item_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {[p.store_name || cat?.name, p.city, format(new Date(p.date), "MMM d")].filter(Boolean).join(" · ")}
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 ml-3">
                    <p className="text-sm font-semibold">{formatCurrency(p.amount, p.original_currency)}</p>
                    {p.original_currency !== homeCurrency && (
                      <p className="text-xs text-muted-foreground">{formatCurrency(p.converted_amount || p.amount, homeCurrency)}</p>
                    )}
                    {p.payment_method && (
                      <p className="text-[10px] text-muted-foreground/60 capitalize">{p.payment_method}</p>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      <CategoryDialog
        open={categoryDialogOpen}
        onOpenChange={setCategoryDialogOpen}
        category={editingCategory}
        tripId={activeTrip?.id}
        tripCurrency={homeCurrency}
        onSave={handleSaveCategory}
        onDelete={(id) => deleteCategory(id)}
      />

      <PurchaseDialog
        open={purchaseDialogOpen}
        onOpenChange={setPurchaseDialogOpen}
        purchase={editingPurchase}
        categories={categories}
        trip={activeTrip}
        onSave={handleSavePurchase}
        onDelete={(id) => deletePurchase(id)}
      />
    </div>
  );
}