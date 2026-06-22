import React from "react";
import { Hotel as HotelIcon, MapPin, Users, Calendar, Trash2, Pencil } from "lucide-react";
import { format } from "date-fns";
import { formatCurrency } from "@/lib/currencies";

export default function HotelCard({ hotel, onEdit, onDelete }) {
  const formatDate = (d) => {
    if (!d) return "";
    return format(new Date(d), "MMM d, yyyy");
  };

  const nights = () => {
    if (!hotel.check_in || !hotel.check_out) return 0;
    const diff = new Date(hotel.check_out) - new Date(hotel.check_in);
    return Math.max(0, Math.round(diff / (1000 * 60 * 60 * 24)));
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-lg hover:shadow-gray-100 transition-all duration-300 group">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-md shadow-orange-200 overflow-hidden">
            {hotel.logo_url ? (
              <img src={hotel.logo_url} alt={hotel.name} className="w-full h-full object-cover" />
            ) : (
              <HotelIcon size={18} className="text-white" />
            )}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 text-sm">{hotel.name}</h3>
            {hotel.platform && (
              <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-600 mt-1">
                {hotel.platform}
              </span>
            )}
            <div className="flex items-center gap-1 mt-2">
              <MapPin size={12} className="text-gray-400" />
              <span className="text-xs text-gray-400">{hotel.city}, {hotel.country}</span>
            </div>
            {hotel.address && (
              <div className="text-xs text-gray-500 mt-1">
                {hotel.address}
              </div>
            )}
            {hotel.reservation_number && (
              <div className="text-xs text-gray-500 mt-1">
                <span className="font-semibold text-slate-700">Reservation:</span> {hotel.reservation_number}
              </div>
            )}
          </div>
          </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button onClick={() => onEdit(hotel)} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <Pencil size={14} className="text-gray-400" />
          </button>
          <button onClick={() => onDelete(hotel.id)} className="p-2 rounded-lg hover:bg-red-50 transition-colors">
            <Trash2 size={14} className="text-red-400" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="bg-gray-50 rounded-xl px-3 py-2.5">
          <div className="flex items-center gap-1.5 mb-1">
            <Calendar size={12} className="text-gray-400" />
            <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wide">Dates</span>
          </div>
          <p className="text-xs font-semibold text-gray-900">{formatDate(hotel.check_in)}</p>
          <p className="text-xs text-gray-500">to {formatDate(hotel.check_out)}</p>
        </div>

        <div className="bg-gray-50 rounded-xl px-3 py-2.5">
          <div className="flex items-center gap-1.5 mb-1">
            <Users size={12} className="text-gray-400" />
            <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wide">Guests</span>
          </div>
          <p className="text-xs font-semibold text-gray-900">{hotel.guests}</p>
          <p className="text-xs text-gray-500">{nights()} nights</p>
        </div>

        <div className="bg-gray-50 rounded-xl px-3 py-2.5">
          <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wide block mb-1">Price</span>
          <p className="text-xs font-semibold text-gray-900">{formatCurrency(Number(hotel.price), hotel.currency || "CAD")}</p>
          <p className="text-xs text-gray-500">
            {nights() > 0
              ? `${formatCurrency(Number(hotel.price / nights()), hotel.currency || "CAD")}/night`
              : ""}
          </p>
        </div>
      </div>
    </div>
  );
}
