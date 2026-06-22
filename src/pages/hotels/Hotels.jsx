import React, { useState } from "react";

import { Plus, Hotel, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import HotelForm from "@/components/hotels/HotelForm";
import HotelCard from "@/components/hotels/HotelCard";
import { useLocalData } from "@/context/LocalDataContext";

export default function Hotels() {
  const { hotels, addHotel, updateHotel, deleteHotel } = useLocalData();
  const [showForm, setShowForm] = useState(false);
  const [editHotel, setEditHotel] = useState(null);
  const [search, setSearch] = useState("");
  const loading = false;

  const handleCreate = async (data) => {
    addHotel(data);
    setShowForm(false);
  };

  const handleUpdate = async (data) => {
    updateHotel(editHotel.id, data);
    setEditHotel(null);
  };

  const handleDelete = async (id) => {
    deleteHotel(id);
  };

  const filtered = hotels.filter((h) => {
    const q = search.toLowerCase();
    return (
      h.name?.toLowerCase().includes(q) ||
      h.city?.toLowerCase().includes(q) ||
      h.country?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="p-6 lg:p-10 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 tracking-tight">Hotels</h1>
          <p className="text-gray-500 mt-1 text-sm">Manage your hotel bookings.</p>
        </div>
        <Button
          onClick={() => setShowForm(true)}
          className="rounded-xl bg-gray-900 hover:bg-gray-800 text-white gap-2 px-5 shadow-lg shadow-gray-900/10"
        >
          <Plus size={16} />
          Add Hotel
        </Button>
      </div>

      <div className="relative mb-6">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <Input
          placeholder="Search hotels..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 rounded-xl border-gray-200 focus:border-gray-400 focus:ring-gray-400 bg-white"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-6 h-6 border-2 border-gray-200 border-t-gray-800 rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <Hotel size={24} className="text-gray-400" />
          </div>
          <p className="text-gray-500 font-medium">
            {search ? "No hotels match your search" : "No hotels yet"}
          </p>
          <p className="text-gray-400 text-sm mt-1">
            {search ? "Try a different search term" : "Add your first hotel booking to get started"}
          </p>
          {!search && (
            <Button
              onClick={() => setShowForm(true)}
              className="mt-5 rounded-xl bg-gray-900 hover:bg-gray-800 text-white gap-2 px-5"
            >
              <Plus size={16} />
              Add Hotel
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {filtered.map((hotel) => (
            <HotelCard
              key={hotel.id}
              hotel={hotel}
              onEdit={(h) => setEditHotel(h)}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {showForm && (
        <HotelForm onSubmit={handleCreate} onCancel={() => setShowForm(false)} />
      )}
      {editHotel && (
        <HotelForm
          initial={editHotel}
          onSubmit={handleUpdate}
          onCancel={() => setEditHotel(null)}
        />
      )}
    </div>
  );
}