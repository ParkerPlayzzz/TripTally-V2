import React, { useMemo, useState } from "react";

import { Plus, Hotel, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import HotelForm from "@/components/hotels/HotelForm";
import HotelCard from "@/components/hotels/HotelCard";
import { useLocalData } from "@/context/LocalDataContext";

export default function Hotels() {
  const { hotels, addHotel, updateHotel, deleteHotel } = useLocalData();
  const [showForm, setShowForm] = useState(false);
  const [editHotel, setEditHotel] = useState(null);
  const [sortKey, setSortKey] = useState("closest");
  const [filterCountry, setFilterCountry] = useState("");
  const [filterCity, setFilterCity] = useState("");
  const [filterPlatform, setFilterPlatform] = useState("");
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

  const allCountries = useMemo(
    () => [...new Set(hotels.map((h) => h.country).filter(Boolean))].sort(),
    [hotels],
  );

  const allCities = useMemo(
    () => [...new Set(hotels.map((h) => h.city).filter(Boolean))].sort(),
    [hotels],
  );

  const allPlatforms = useMemo(
    () => [...new Set(hotels.map((h) => h.platform).filter(Boolean))].sort(),
    [hotels],
  );

  const filtered = useMemo(() => {
    return hotels
      .filter((h) => {
        const matchesCountry = filterCountry ? (h.country || "").toLowerCase() === filterCountry.toLowerCase() : true;
        const matchesCity = filterCity ? (h.city || "").toLowerCase() === filterCity.toLowerCase() : true;
        const matchesPlatform = filterPlatform ? (h.platform || "").toLowerCase() === filterPlatform.toLowerCase() : true;
        return matchesCountry && matchesCity && matchesPlatform;
      })
      .sort((a, b) => {
        const dateA = a.check_in || a.checkInDate || "";
        const dateB = b.check_in || b.checkInDate || "";
        const priceA = typeof a.price === "number" ? a.price : Number(a.price) || 0;
        const priceB = typeof b.price === "number" ? b.price : Number(b.price) || 0;

        if (sortKey === "closest") {
          return dateA.localeCompare(dateB);
        }
        if (sortKey === "farthest") {
          return dateB.localeCompare(dateA);
        }
        if (sortKey === "priceAsc") {
          return priceA - priceB;
        }
        if (sortKey === "priceDesc") {
          return priceB - priceA;
        }
        if (sortKey === "city") {
          return (a.city || "").localeCompare(b.city || "");
        }
        if (sortKey === "country") {
          return (a.country || "").localeCompare(b.country || "");
        }
        if (sortKey === "platform") {
          return (a.platform || "").localeCompare(b.platform || "");
        }
        return 0;
      });
  }, [hotels, sortKey, filterCountry, filterCity, filterPlatform]);

  const hasFilters = filterCountry || filterCity || filterPlatform;

  return (
    <div className="p-6 lg:p-10 max-w-5xl mx-auto">
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

      <div className="grid gap-2 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 mb-3">
        <select
          value={sortKey}
          onChange={(e) => setSortKey(e.target.value)}
          className="w-full text-xs bg-secondary border border-border rounded-xl px-3 py-1.5 text-foreground outline-none cursor-pointer"
        >
          <option value="closest">Closest check-in</option>
          <option value="farthest">Farthest check-in</option>
          <option value="priceAsc">Price: Low to high</option>
          <option value="priceDesc">Price: High to low</option>
          <option value="city">City</option>
          <option value="country">Country</option>
          <option value="platform">Booking platform</option>
        </select>

        <select
          value={filterCountry}
          onChange={(e) => setFilterCountry(e.target.value)}
          className="w-full text-xs bg-secondary border border-border rounded-xl px-3 py-1.5 text-foreground outline-none cursor-pointer"
        >
          <option value="">All countries</option>
          {allCountries.map((country) => (
            <option key={country} value={country}>{country}</option>
          ))}
        </select>

        <select
          value={filterCity}
          onChange={(e) => setFilterCity(e.target.value)}
          className="w-full text-xs bg-secondary border border-border rounded-xl px-3 py-1.5 text-foreground outline-none cursor-pointer"
        >
          <option value="">All cities</option>
          {allCities.map((city) => (
            <option key={city} value={city}>{city}</option>
          ))}
        </select>

        <select
          value={filterPlatform}
          onChange={(e) => setFilterPlatform(e.target.value)}
          className="w-full text-xs bg-secondary border border-border rounded-xl px-3 py-1.5 text-foreground outline-none cursor-pointer"
        >
          <option value="">All booking platforms</option>
          {allPlatforms.map((platform) => (
            <option key={platform} value={platform}>{platform}</option>
          ))}
        </select>

        {hasFilters && (
          <button
            onClick={() => {
              setFilterCountry("");
              setFilterCity("");
              setFilterPlatform("");
            }}
            className="col-span-1 sm:col-span-2 xl:col-span-4 self-center justify-self-end text-xs text-muted-foreground flex items-center gap-1 px-2 py-1.5 hover:text-foreground transition-colors"
          >
            <X className="w-3 h-3" /> Clear
          </button>
        )}
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
          <p className="text-gray-500 font-medium">No hotels match your filters</p>
          <p className="text-gray-400 text-sm mt-1">Adjust your filter selections or add a new hotel booking.</p>
          <Button
            onClick={() => setShowForm(true)}
            className="mt-5 rounded-xl bg-gray-900 hover:bg-gray-800 text-white gap-2 px-5"
          >
            <Plus size={16} />
            Add Hotel
          </Button>
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