import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CURRENCIES, convertCurrency, getExchangeRate } from "@/lib/currencies";
import { Trash2, CreditCard, Banknote } from "lucide-react";

export default function PurchaseDialog({ open, onOpenChange, purchase, categories = [], trip, onSave, onDelete }) {
  const homeCurrency = trip?.home_currency || "CAD";
  
  const [form, setForm] = useState(
    purchase || {
      trip_id: trip?.id || "",
      item_name: "",
      store_name: "",
      date: new Date().toISOString().split("T")[0],
      amount: "",
      original_currency: homeCurrency,
      converted_amount: "",
      home_currency: homeCurrency,
      exchange_rate: 1,
      quantity: 1,
      subcategory: "",
      category_id: "",
      city: "",
      notes: "",
      payment_method: "card",
    }
  );

  const handleAmountChange = (amount) => {
    const numAmount = parseFloat(amount) || 0;
    const rate = getExchangeRate(form.original_currency, homeCurrency);
    setForm({
      ...form,
      amount: amount,
      exchange_rate: rate,
      converted_amount: convertCurrency(numAmount, form.original_currency, homeCurrency),
    });
  };

  const handleCurrencyChange = (currency) => {
    const numAmount = parseFloat(form.amount) || 0;
    const rate = getExchangeRate(currency, homeCurrency);
    setForm({
      ...form,
      original_currency: currency,
      exchange_rate: rate,
      converted_amount: convertCurrency(numAmount, currency, homeCurrency),
    });
  };

  const handleSave = () => {
    if (!form.item_name.trim() || !form.amount) return;
    onSave({
      ...form,
      amount: parseFloat(form.amount),
      trip_id: trip?.id || form.trip_id,
      home_currency: homeCurrency,
    });
    onOpenChange(false);
  };

  const selectedCategory = categories.find(c => c.id === form.category_id);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading">{purchase ? "Edit Purchase" : "New Purchase"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <div>
            <Label className="text-xs font-medium text-muted-foreground">Item Name</Label>
            <Input value={form.item_name} onChange={(e) => setForm({ ...form, item_name: e.target.value })} placeholder="What did you buy?" className="rounded-xl mt-1" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs font-medium text-muted-foreground">Amount</Label>
              <Input type="number" step="0.01" value={form.amount} onChange={(e) => handleAmountChange(e.target.value)} placeholder="0.00" className="rounded-xl mt-1" />
            </div>
            <div>
              <Label className="text-xs font-medium text-muted-foreground">Currency</Label>
              <Select value={form.original_currency} onValueChange={handleCurrencyChange}>
                <SelectTrigger className="rounded-xl mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map((c) => (
                    <SelectItem key={c.code} value={c.code}>{c.flag} {c.code}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {form.original_currency !== homeCurrency && form.amount && (
            <div className="bg-primary/5 border border-primary/10 rounded-2xl p-3">
              <p className="text-xs text-muted-foreground">Converted Amount</p>
              <p className="text-lg font-bold text-primary">
                {CURRENCIES.find(c => c.code === homeCurrency)?.symbol}
                {form.converted_amount?.toFixed(2)}
                <span className="text-xs font-normal text-muted-foreground ml-2">
                  (1 {form.original_currency} = {form.exchange_rate?.toFixed(4)} {homeCurrency})
                </span>
              </p>
            </div>
          )}

          <div>
            <Label className="text-xs font-medium text-muted-foreground">Category</Label>
            <Select value={form.category_id} onValueChange={(v) => setForm({ ...form, category_id: v, subcategory: "" })}>
              <SelectTrigger className="rounded-xl mt-1">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedCategory?.subcategories?.length > 0 && (
            <div>
              <Label className="text-xs font-medium text-muted-foreground">Subcategory</Label>
              <Select value={form.subcategory} onValueChange={(v) => setForm({ ...form, subcategory: v })}>
                <SelectTrigger className="rounded-xl mt-1">
                  <SelectValue placeholder="Select subcategory" />
                </SelectTrigger>
                <SelectContent>
                  {selectedCategory.subcategories.map((sc) => (
                    <SelectItem key={sc} value={sc}>{sc}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs font-medium text-muted-foreground">Store</Label>
              <Input value={form.store_name} onChange={(e) => setForm({ ...form, store_name: e.target.value })} placeholder="Store name" className="rounded-xl mt-1" />
            </div>
            <div>
              <Label className="text-xs font-medium text-muted-foreground">City</Label>
              <Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="City" className="rounded-xl mt-1" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs font-medium text-muted-foreground">Date</Label>
              <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="rounded-xl mt-1" />
            </div>
            <div>
              <Label className="text-xs font-medium text-muted-foreground">Quantity</Label>
              <Input type="number" min="1" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: parseInt(e.target.value) || 1 })} className="rounded-xl mt-1" />
            </div>
          </div>

          <div>
            <Label className="text-xs font-medium text-muted-foreground">Payment Method</Label>
            <div className="flex gap-2 mt-1">
              <button
                type="button"
                onClick={() => setForm({ ...form, payment_method: "card" })}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl border text-sm font-medium transition-all ${form.payment_method === "card" ? "border-foreground bg-foreground text-background" : "border-border text-muted-foreground hover:border-foreground/40"}`}
              >
                <CreditCard className="w-3.5 h-3.5" /> Card
              </button>
              <button
                type="button"
                onClick={() => setForm({ ...form, payment_method: "cash" })}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl border text-sm font-medium transition-all ${form.payment_method === "cash" ? "border-foreground bg-foreground text-background" : "border-border text-muted-foreground hover:border-foreground/40"}`}
              >
                <Banknote className="w-3.5 h-3.5" /> Cash
              </button>
            </div>
          </div>

          <div>
            <Label className="text-xs font-medium text-muted-foreground">Notes</Label>
            <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Additional notes..." className="rounded-xl mt-1 min-h-[60px]" />
          </div>
        </div>

        <div className="flex items-center justify-between mt-4">
          {purchase && onDelete ? (
            <Button variant="ghost" size="sm" className="text-destructive rounded-xl" onClick={() => { onDelete(purchase.id); onOpenChange(false); }}>
              <Trash2 className="w-4 h-4 mr-1" /> Delete
            </Button>
          ) : <div />}
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl">Cancel</Button>
            <Button onClick={handleSave} className="rounded-xl">Save</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}