const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Hotel, Upload } from "lucide-react";

export default function HotelForm({ onSubmit, onCancel, initial }) {
  const [form, setForm] = useState({
    name: initial?.name || "",
    check_in: initial?.check_in || "",
    check_out: initial?.check_out || "",
    guests: initial?.guests || 1,
    country: initial?.country || "",
    city: initial?.city || "",
    price: initial?.price || "",
    logo_url: initial?.logo_url || "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef();

  const set = (key, val) => setForm((prev) => ({ ...prev, [key]: val }));

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await db.integrations.Core.UploadFile({ file });
    setForm(p => ({ ...p, logo_url: file_url }));
    setUploading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    await onSubmit({ ...form, guests: Number(form.guests), price: Number(form.price) });
    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl shadow-2xl shadow-gray-200 w-full max-w-md p-6 space-y-5 animate-in fade-in zoom-in-95 duration-200"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            {initial ? "Edit Hotel" : "Add Hotel"}
          </h2>
          <button type="button" onClick={onCancel} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
            <X size={18} className="text-gray-400" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <Label className="text-xs font-medium text-gray-500 mb-1.5 block">Hotel Logo</Label>
            <div className="flex items-center gap-3">
              <div
                onClick={() => fileRef.current?.click()}
                className="w-14 h-14 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center cursor-pointer hover:border-gray-400 transition-colors overflow-hidden shrink-0"
              >
                {form.logo_url ? (
                  <img src={form.logo_url} alt="logo" className="w-full h-full object-cover" />
                ) : (
                  <Hotel size={20} className="text-gray-300" />
                )}
              </div>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 font-medium transition-colors"
              >
                <Upload size={14} />
                {uploading ? "Uploading..." : form.logo_url ? "Change logo" : "Upload logo"}
              </button>
              {form.logo_url && (
                <button type="button" onClick={() => setForm(p => ({ ...p, logo_url: "" }))} className="text-xs text-red-400 hover:text-red-600">Remove</button>
              )}
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
            </div>
          </div>

          <div>
            <Label className="text-xs font-medium text-gray-500 mb-1.5 block">Hotel Name</Label>
            <Input
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="e.g. The Ritz-Carlton"
              required
              className="rounded-xl border-gray-200 focus:border-gray-400 focus:ring-gray-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs font-medium text-gray-500 mb-1.5 block">Check-in</Label>
              <Input
                type="date"
                value={form.check_in}
                onChange={(e) => set("check_in", e.target.value)}
                required
                className="rounded-xl border-gray-200 focus:border-gray-400 focus:ring-gray-400"
              />
            </div>
            <div>
              <Label className="text-xs font-medium text-gray-500 mb-1.5 block">Check-out</Label>
              <Input
                type="date"
                value={form.check_out}
                onChange={(e) => set("check_out", e.target.value)}
                required
                className="rounded-xl border-gray-200 focus:border-gray-400 focus:ring-gray-400"
              />
            </div>
          </div>

          <div>
            <Label className="text-xs font-medium text-gray-500 mb-1.5 block">Number of Guests</Label>
            <Input
              type="number"
              min={1}
              value={form.guests}
              onChange={(e) => set("guests", e.target.value)}
              required
              className="rounded-xl border-gray-200 focus:border-gray-400 focus:ring-gray-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs font-medium text-gray-500 mb-1.5 block">Country</Label>
              <Input
                value={form.country}
                onChange={(e) => set("country", e.target.value)}
                placeholder="e.g. France"
                required
                className="rounded-xl border-gray-200 focus:border-gray-400 focus:ring-gray-400"
              />
            </div>
            <div>
              <Label className="text-xs font-medium text-gray-500 mb-1.5 block">City</Label>
              <Input
                value={form.city}
                onChange={(e) => set("city", e.target.value)}
                placeholder="e.g. Paris"
                required
                className="rounded-xl border-gray-200 focus:border-gray-400 focus:ring-gray-400"
              />
            </div>
          </div>

          <div>
            <Label className="text-xs font-medium text-gray-500 mb-1.5 block">Total Price ($)</Label>
            <Input
              type="number"
              min={0}
              step="0.01"
              value={form.price}
              onChange={(e) => set("price", e.target.value)}
              placeholder="0.00"
              required
              className="rounded-xl border-gray-200 focus:border-gray-400 focus:ring-gray-400"
            />
          </div>
        </div>

        <div className="flex gap-3 pt-1">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="flex-1 rounded-xl border-gray-200 text-gray-600 hover:bg-gray-50"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={submitting}
            className="flex-1 rounded-xl bg-gray-900 hover:bg-gray-800 text-white"
          >
            {submitting ? "Saving..." : initial ? "Update" : "Add Hotel"}
          </Button>
        </div>
      </form>
    </div>
  );
}