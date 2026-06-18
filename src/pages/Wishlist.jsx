const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { motion, AnimatePresence } from "framer-motion";
import { Plus, CheckCircle2, Circle, Pencil, X } from "lucide-react";
import { CURRENCIES, convertCurrency, formatCurrency } from "@/lib/currencies";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useTransparency } from "@/lib/TransparencyContext";
import { glassStyle } from "@/lib/glassStyle";

const stagger = {
  animate: { transition: { staggerChildren: 0.05 } },
};
const fadeUp = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] } },
};

const EMPTY = {
  name: "",
  store_name: "",
  city: "",
  price: "",
  currency: "JPY",
  home_currency: "CAD",
  notes: "",
  purchased: false,
};

export default function Wishlist() {
  const qc = useQueryClient();
  const { opacity } = useTransparency();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [sortOrder, setSortOrder] = useState("date_desc");
  const [filterCurrency, setFilterCurrency] = useState("");
  const [filterCity, setFilterCity] = useState("");
  const [filterPeriod, setFilterPeriod] = useState("");

  const { data: items = [] } = useQuery({
    queryKey: ["wishlist"],
    queryFn: () => db.entities.WishlistItem.list("-created_date"),
  });

  const createMutation = useMutation({
    mutationFn: (data) => db.entities.WishlistItem.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["wishlist"] }); close(); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => db.entities.WishlistItem.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["wishlist"] }); close(); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => db.entities.WishlistItem.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["wishlist"] }),
  });

  const openCreate = () => { setEditing(null); setForm(EMPTY); setOpen(true); };
  const openEdit = (item) => {
    setEditing(item);
    setForm({ ...item, price: item.price?.toString() ?? "" });
    setOpen(true);
  };
  const close = () => { setOpen(false); setEditing(null); };

  const handleSubmit = () => {
    if (!form.name || !form.price) return;
    const payload = { ...form, price: parseFloat(form.price) };
    if (editing) updateMutation.mutate({ id: editing.id, data: payload });
    else createMutation.mutate(payload);
  };

  const togglePurchased = (item) => {
    updateMutation.mutate({ id: item.id, data: { ...item, purchased: !item.purchased } });
  };

  const now = new Date();
  const applyFiltersSort = (list) => list
    .filter(i => {
      if (filterCurrency && i.currency !== filterCurrency) return false;
      if (filterCity && i.city?.toLowerCase() !== filterCity.toLowerCase()) return false;
      if (filterPeriod) {
        const d = new Date(i.created_date);
        if (filterPeriod === "day" && d.toDateString() !== now.toDateString()) return false;
        if (filterPeriod === "month" && (d.getMonth() !== now.getMonth() || d.getFullYear() !== now.getFullYear())) return false;
        if (filterPeriod === "year" && d.getFullYear() !== now.getFullYear()) return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortOrder === "date_desc") return new Date(b.created_date) - new Date(a.created_date);
      if (sortOrder === "date_asc") return new Date(a.created_date) - new Date(b.created_date);
      if (sortOrder === "amount_asc") return (a.price || 0) - (b.price || 0);
      if (sortOrder === "amount_desc") return (b.price || 0) - (a.price || 0);
      return 0;
    });

  const allCurrencies = [...new Set(items.map(i => i.currency).filter(Boolean))];
  const allCities = [...new Set(items.map(i => i.city).filter(Boolean))];
  const hasFilters = filterCurrency || filterCity || filterPeriod;

  const unpurchased = applyFiltersSort(items.filter((i) => !i.purchased));
  const purchased = applyFiltersSort(items.filter((i) => i.purchased));

  const totalCAD = unpurchased.reduce((sum, i) => {
    return sum + convertCurrency(i.price || 0, i.currency, i.home_currency || "CAD");
  }, 0);

  return (
    <motion.div
      variants={stagger}
      initial="initial"
      animate="animate"
      className="max-w-2xl mx-auto px-6 py-10 lg:py-14 space-y-8"
    >
      {/* Header */}
      <motion.div variants={fadeUp} className="flex items-end justify-between">
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium mb-1.5">Wishlist</p>
          <h1 className="text-3xl font-semibold tracking-tight">Things to Buy</h1>
        </div>
        <Button
          onClick={openCreate}
          size="sm"
          className="rounded-xl gap-1.5 text-xs h-8 px-3"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Item
        </Button>
      </motion.div>

      {/* Summary */}
      {unpurchased.length > 0 && (
        <motion.div variants={fadeUp} className="bg-card border border-border rounded-2xl p-5">
          <div className="grid grid-cols-3 divide-x divide-border">
            <div className="pr-3">
              <p className="text-xs text-muted-foreground mb-0.5 truncate">Items</p>
              <p className="text-lg font-semibold">{unpurchased.length}</p>
            </div>
            <div className="px-3">
              <p className="text-xs text-muted-foreground mb-0.5 truncate">Est. Total</p>
              <p className="text-sm font-semibold leading-tight break-all">{formatCurrency(totalCAD, "CAD")}</p>
            </div>
            <div className="pl-3">
              <p className="text-xs text-muted-foreground mb-0.5 truncate">Purchased</p>
              <p className="text-lg font-semibold">{purchased.length}</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Sort + Filter bar */}
      {items.length > 0 && (
        <motion.div variants={fadeUp} className="flex flex-wrap gap-2">
          <select
            value={sortOrder}
            onChange={e => setSortOrder(e.target.value)}
            className="text-xs bg-secondary border border-border rounded-xl px-3 py-1.5 text-foreground outline-none cursor-pointer"
          >
            <option value="date_desc">Newest first</option>
            <option value="date_asc">Oldest first</option>
            <option value="amount_asc">Lowest price</option>
            <option value="amount_desc">Highest price</option>
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

          {allCurrencies.length > 1 && (
            <select
              value={filterCurrency}
              onChange={e => setFilterCurrency(e.target.value)}
              className="text-xs bg-secondary border border-border rounded-xl px-3 py-1.5 text-foreground outline-none cursor-pointer"
            >
              <option value="">All currencies</option>
              {allCurrencies.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          )}

          {allCities.length > 0 && (
            <select
              value={filterCity}
              onChange={e => setFilterCity(e.target.value)}
              className="text-xs bg-secondary border border-border rounded-xl px-3 py-1.5 text-foreground outline-none cursor-pointer"
            >
              <option value="">All cities</option>
              {allCities.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          )}

          {hasFilters && (
            <button
              onClick={() => { setFilterCurrency(""); setFilterCity(""); setFilterPeriod(""); }}
              className="text-xs text-muted-foreground flex items-center gap-1 px-2 py-1.5 hover:text-foreground transition-colors"
            >
              <X className="w-3 h-3" /> Clear
            </button>
          )}
        </motion.div>
      )}

      {/* Items */}
      {items.length === 0 ? (
        <motion.div variants={fadeUp} className="border border-dashed border-border rounded-2xl p-10 text-center">
          <p className="text-sm text-muted-foreground mb-4">Your wishlist is empty</p>
          <button onClick={openCreate} className="text-sm font-medium underline underline-offset-4 hover:text-muted-foreground transition-colors">
            Add your first item
          </button>
        </motion.div>
      ) : (
        <motion.div variants={fadeUp} className="space-y-1">
          <AnimatePresence>
            {unpurchased.map((item) => (
              <WishlistRow key={item.id} item={item} onToggle={togglePurchased} onEdit={openEdit} onDelete={() => deleteMutation.mutate(item.id)} />
            ))}
          </AnimatePresence>

          {purchased.length > 0 && (
            <>
              <p className="text-xs text-muted-foreground uppercase tracking-widest pt-4 pb-1">Purchased</p>
              <AnimatePresence>
                {purchased.map((item) => (
                  <WishlistRow key={item.id} item={item} onToggle={togglePurchased} onEdit={openEdit} onDelete={() => deleteMutation.mutate(item.id)} />
                ))}
              </AnimatePresence>
            </>
          )}
        </motion.div>
      )}

      {/* Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm rounded-2xl p-0 overflow-hidden border border-border" style={glassStyle(opacity)}>
          {/* Title bar */}
          <div className="px-5 pt-5 pb-3 border-b border-border">
            <p className="text-[11px] text-muted-foreground uppercase tracking-widest font-medium">
              {editing ? "Edit Item" : "Add to Wishlist"}
            </p>
          </div>

          {/* Fields */}
          <div className="divide-y divide-border">
            <label className="flex items-center px-5 py-3.5 gap-4">
              <span className="text-xs text-muted-foreground w-24 flex-shrink-0">Item</span>
              <input
                className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/40 text-right"
                placeholder="e.g. Misono Knife"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </label>

            <label className="flex items-center px-5 py-3.5 gap-4">
              <span className="text-xs text-muted-foreground w-24 flex-shrink-0">Store</span>
              <input
                className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/40 text-right"
                placeholder="e.g. Kappabashi"
                value={form.store_name}
                onChange={(e) => setForm({ ...form, store_name: e.target.value })}
              />
            </label>

            <label className="flex items-center px-5 py-3.5 gap-4">
              <span className="text-xs text-muted-foreground w-24 flex-shrink-0">City</span>
              <input
                className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/40 text-right"
                placeholder="e.g. Tokyo"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
              />
            </label>

            <label className="flex items-center px-5 py-3.5 gap-4">
              <span className="text-xs text-muted-foreground w-24 flex-shrink-0">Price</span>
              <input
                type="number"
                className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/40 text-right"
                placeholder="0"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
              />
            </label>

            <label className="flex items-center px-5 py-3.5 gap-4">
              <span className="text-xs text-muted-foreground w-24 flex-shrink-0">Currency</span>
              <select
                className="flex-1 bg-transparent text-sm text-foreground outline-none text-right appearance-none cursor-pointer"
                value={form.currency}
                onChange={(e) => setForm({ ...form, currency: e.target.value })}
              >
                {CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>{c.flag} {c.code} — {c.name}</option>
                ))}
              </select>
            </label>

            <label className="flex items-center px-5 py-3.5 gap-4">
              <span className="text-xs text-muted-foreground w-24 flex-shrink-0">Convert to</span>
              <select
                className="flex-1 bg-transparent text-sm text-foreground outline-none text-right appearance-none cursor-pointer"
                value={form.home_currency}
                onChange={(e) => setForm({ ...form, home_currency: e.target.value })}
              >
                {CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>{c.flag} {c.code} — {c.name}</option>
                ))}
              </select>
            </label>

            {form.price && parseFloat(form.price) > 0 && form.currency !== form.home_currency && (
              <div className="flex items-center justify-between px-5 py-3 bg-secondary/50">
                <span className="text-xs text-muted-foreground">{formatCurrency(parseFloat(form.price), form.currency)}</span>
                <span className="text-xs text-muted-foreground">≈</span>
                <span className="text-sm font-semibold">
                  {formatCurrency(convertCurrency(parseFloat(form.price), form.currency, form.home_currency), form.home_currency)}
                </span>
              </div>
            )}

            <label className="flex items-center px-5 py-3.5 gap-4">
              <span className="text-xs text-muted-foreground w-24 flex-shrink-0">Notes</span>
              <input
                className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/40 text-right"
                placeholder="Optional"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
              />
            </label>
          </div>

          {/* Actions */}
          <div className="flex border-t border-border divide-x divide-border">
            {editing && (
              <button
                className="flex-1 py-3.5 text-sm text-destructive font-medium hover:bg-destructive/5 transition-colors"
                onClick={() => { deleteMutation.mutate(editing.id); close(); }}
              >
                Delete
              </button>
            )}
            <button
              className="flex-1 py-3.5 text-sm text-muted-foreground hover:bg-secondary transition-colors"
              onClick={close}
            >
              Cancel
            </button>
            <button
              className="flex-1 py-3.5 text-sm font-semibold text-foreground hover:bg-secondary transition-colors disabled:opacity-30"
              onClick={handleSubmit}
              disabled={!form.name || !form.price}
            >
              {editing ? "Save" : "Add"}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}

function WishlistRow({ item, onToggle, onEdit, onDelete }) {
  const converted = item.currency !== item.home_currency
    ? convertCurrency(item.price, item.currency, item.home_currency || "CAD")
    : null;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0 }}
      className={`flex items-center gap-3 py-3 border-b border-border last:border-0 group ${item.purchased ? "opacity-50" : ""}`}
    >
      <button onClick={() => onToggle(item)} className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors">
        {item.purchased
          ? <CheckCircle2 className="w-4 h-4" />
          : <Circle className="w-4 h-4 text-muted-foreground/40" />
        }
      </button>

      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium truncate ${item.purchased ? "line-through" : ""}`}>{item.name}</p>
        {(item.store_name || item.city) && (
          <p className="text-xs text-muted-foreground truncate">
            {[item.store_name, item.city].filter(Boolean).join(" · ")}
          </p>
        )}
      </div>

      <div className="text-right flex-shrink-0">
        <p className="text-sm font-medium">{formatCurrency(item.price, item.currency)}</p>
        {converted !== null && (
          <p className="text-xs text-muted-foreground">≈ {formatCurrency(converted, item.home_currency)}</p>
        )}
      </div>

      <button
        onClick={() => onEdit(item)}
        className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground ml-1 flex-shrink-0"
      >
        <Pencil className="w-3.5 h-3.5" />
      </button>
    </motion.div>
  );
}