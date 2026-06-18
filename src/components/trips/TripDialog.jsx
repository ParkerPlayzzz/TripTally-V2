import React, { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, X } from "lucide-react";
import { CURRENCIES, DEFAULT_DESTINATIONS } from "@/lib/currencies";
import { useTransparency } from "@/lib/TransparencyContext";
import { glassStyle } from "@/lib/glassStyle";

export default function TripDialog({ open, onOpenChange, trip, onSave, onDelete }) {
  const { opacity } = useTransparency();
  const [form, setForm] = useState(
    trip || { name: "", destinations: [], start_date: "", end_date: "", total_budget: "", home_currency: "CAD", status: "planning", notes: "" }
  );
  const [destInput, setDestInput] = useState("");

  React.useEffect(() => {
    if (open) {
      setForm(trip || { name: "", destinations: [], start_date: "", end_date: "", total_budget: "", home_currency: "CAD", status: "planning", notes: "" });
      setDestInput("");
    }
  }, [open, trip]);

  const addDestination = (dest) => {
    if (dest && !form.destinations?.includes(dest)) {
      setForm({ ...form, destinations: [...(form.destinations || []), dest] });
    }
    setDestInput("");
  };

  const removeDestination = (dest) => {
    setForm({ ...form, destinations: (form.destinations || []).filter((d) => d !== dest) });
  };

  const handleSave = () => {
    if (!form.name.trim() || !form.start_date || !form.end_date) return;
    onSave({ ...form, total_budget: parseFloat(form.total_budget) || 0 });
    onOpenChange(false);
  };

  const inputCls = "flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/40 text-right";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-sm rounded-2xl p-0 overflow-hidden border border-border"
        style={glassStyle(opacity)}
      >
        {/* Title bar */}
        <div className="px-5 pt-5 pb-3 border-b border-border">
          <p className="text-[11px] text-muted-foreground uppercase tracking-widest font-medium">
            {trip ? "Edit Trip" : "New Trip"}
          </p>
        </div>

        {/* Fields */}
        <div className="max-h-[65vh] overflow-y-auto divide-y divide-border">
          {/* Name */}
          <label className="flex items-center px-5 py-3.5 gap-4">
            <span className="text-xs text-muted-foreground w-24 flex-shrink-0">Name</span>
            <input
              className={inputCls}
              placeholder="Japan 2025"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </label>

          {/* Destinations */}
          <div className="px-5 py-3.5">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs text-muted-foreground">Destinations</span>
              <div className="flex gap-2">
                <input
                  className="bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/40 text-right w-28"
                  placeholder="Add city…"
                  value={destInput}
                  onChange={(e) => setDestInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addDestination(destInput))}
                />
                <button onClick={() => addDestination(destInput)} className="text-foreground">
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            {(form.destinations || []).length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-2">
                {(form.destinations || []).map((d) => (
                  <span key={d} className="flex items-center gap-1 text-xs bg-secondary px-2.5 py-1 rounded-lg">
                    {d}
                    <button onClick={() => removeDestination(d)} className="text-muted-foreground/60 hover:text-foreground">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
            <div className="flex flex-wrap gap-1.5">
              {DEFAULT_DESTINATIONS.filter((d) => !(form.destinations || []).includes(d)).slice(0, 8).map((d) => (
                <button
                  key={d}
                  onClick={() => addDestination(d)}
                  className="text-xs px-2 py-0.5 rounded-md bg-secondary/60 hover:bg-secondary transition-colors text-muted-foreground"
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Dates */}
          <div className="flex items-center px-5 py-3.5 gap-4">
            <span className="text-xs text-muted-foreground w-24 flex-shrink-0">Dates</span>
            <div className="flex-1 flex items-center justify-end gap-2">
              <input
                type="date"
                className="bg-transparent text-sm text-foreground outline-none text-right appearance-none cursor-pointer"
                value={form.start_date}
                onChange={(e) => setForm({ ...form, start_date: e.target.value })}
              />
              <span className="text-muted-foreground/40 text-xs">–</span>
              <input
                type="date"
                className="bg-transparent text-sm text-foreground outline-none text-right appearance-none cursor-pointer"
                value={form.end_date}
                onChange={(e) => setForm({ ...form, end_date: e.target.value })}
              />
            </div>
          </div>

          {/* Budget */}
          <label className="flex items-center px-5 py-3.5 gap-4">
            <span className="text-xs text-muted-foreground w-24 flex-shrink-0">Budget</span>
            <input
              type="number"
              className={inputCls}
              placeholder="5000"
              value={form.total_budget}
              onChange={(e) => setForm({ ...form, total_budget: e.target.value })}
            />
          </label>

          {/* Currency */}
          <label className="flex items-center px-5 py-3.5 gap-4">
            <span className="text-xs text-muted-foreground w-24 flex-shrink-0">Currency</span>
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

          {/* Status */}
          <label className="flex items-center px-5 py-3.5 gap-4">
            <span className="text-xs text-muted-foreground w-24 flex-shrink-0">Status</span>
            <select
              className="flex-1 bg-transparent text-sm text-foreground outline-none text-right appearance-none cursor-pointer capitalize"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
            >
              <option value="planning">Planning</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
            </select>
          </label>
        </div>

        {/* Actions */}
        <div className="flex border-t border-border divide-x divide-border">
          {trip && onDelete && (
            <button
              className="flex-1 py-3.5 text-sm text-destructive font-medium hover:bg-destructive/5 transition-colors"
              onClick={() => { onDelete(trip.id); onOpenChange(false); }}
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
            onClick={handleSave}
            disabled={!form.name.trim() || !form.start_date || !form.end_date}
          >
            {trip ? "Save" : "Add"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}