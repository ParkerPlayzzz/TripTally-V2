import React, { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { CURRENCIES } from "@/lib/currencies";
import { useTransparency } from "@/lib/TransparencyContext";
import { glassStyle } from "@/lib/glassStyle";

const EMPTY = { name: "", planned_budget: "", currency: "", color: "#6366f1" };

const PALETTE = [
  { label: "Default", value: null },
  { label: "Indigo", value: "#6366f1" },
  { label: "Navy", value: "#1e3a5f" },
  { label: "Slate", value: "#475569" },
  { label: "Stone", value: "#78716c" },
  { label: "Rose", value: "#e11d48" },
  { label: "Sage", value: "#4d7c6f" },
  { label: "Amber", value: "#b45309" },
  { label: "Sky", value: "#0369a1" },
];

export default function CategoryDialog({ open, onOpenChange, category, tripId, tripCurrency, onSave, onDelete }) {
  const [form, setForm] = useState(EMPTY);
  const { opacity } = useTransparency();

  useEffect(() => {
    if (open) {
      setForm(category
        ? { name: category.name, planned_budget: category.planned_budget?.toString() ?? "", currency: category.currency || tripCurrency || "CAD", color: category.color || "#6366f1" }
        : { ...EMPTY, currency: tripCurrency || "CAD" }
      );
    }
  }, [open, category, tripCurrency]);

  const handleSubmit = () => {
    if (!form.name || !form.planned_budget) return;
    onSave({ name: form.name, planned_budget: parseFloat(form.planned_budget), currency: form.currency, color: form.color, trip_id: tripId });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm rounded-2xl p-0 overflow-hidden border border-border" style={glassStyle(opacity)}>
        {/* Title bar */}
        <div className="px-5 pt-5 pb-3 border-b border-border">
          <p className="text-[11px] text-muted-foreground uppercase tracking-widest font-medium">
            {category ? "Edit Category" : "New Category"}
          </p>
        </div>

        {/* Fields */}
        <div className="divide-y divide-border">
          <label className="flex items-center px-5 py-3.5 gap-4">
            <span className="text-xs text-muted-foreground w-24 flex-shrink-0">Name</span>
            <input
              className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/40 text-right"
              placeholder="e.g. Food"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </label>

          <label className="flex items-center px-5 py-3.5 gap-4">
            <span className="text-xs text-muted-foreground w-24 flex-shrink-0">Budget</span>
            <input
              type="number"
              className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/40 text-right"
              placeholder="0.00"
              value={form.planned_budget}
              onChange={(e) => setForm({ ...form, planned_budget: e.target.value })}
            />
          </label>

          <div className="px-5 py-3.5">
            <span className="text-xs text-muted-foreground block mb-2.5">Color</span>
            <div className="flex flex-wrap gap-2">
              {PALETTE.map((p) => (
                <button
                  key={p.label}
                  title={p.label}
                  onClick={() => setForm({ ...form, color: p.value || "#6366f1" })}
                  className={`transition-all ${p.value === null ? "rounded-lg px-2 py-1 text-xs border" : "w-6 h-6 rounded-full"} ${
                    (p.value === null && form.color === "#6366f1") || form.color === p.value
                      ? "ring-2 ring-offset-1 ring-foreground scale-110"
                      : "hover:scale-110 opacity-80"
                  } ${p.value === null ? "border-border text-muted-foreground" : ""}`}
                  style={p.value ? { backgroundColor: p.value } : {}}
                >
                  {p.value === null ? "↺" : null}
                </button>
              ))}
            </div>
          </div>

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
        </div>

        {/* Actions */}
        <div className="flex border-t border-border divide-x divide-border">
          {category && (
            <button
              className="flex-1 py-3.5 text-sm text-destructive font-medium hover:bg-destructive/5 transition-colors"
              onClick={() => { onDelete(category.id); onOpenChange(false); }}
            >
              Delete
            </button>
          )}
          <button
            className="flex-1 py-3.5 text-sm text-muted-foreground hover:bg-secondary transition-colors"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </button>
          <button
            className="flex-1 py-3.5 text-sm font-semibold text-foreground hover:bg-secondary transition-colors disabled:opacity-30"
            onClick={handleSubmit}
            disabled={!form.name || !form.planned_budget}
          >
            {category ? "Save" : "Add"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}