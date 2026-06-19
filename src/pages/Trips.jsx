import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Plus, MapPin, Calendar, Wallet, ChevronRight, Plane } from "lucide-react";
import { format, differenceInDays } from "date-fns";

function parseLocalDate(dateStr) {
  if (!dateStr) return new Date(NaN);
  const parts = dateStr.split("-").map((p) => parseInt(p, 10));
  if (parts.length !== 3) return new Date(dateStr);
  const [y, m, d] = parts;
  return new Date(y, m - 1, d);
}
import EmptyState from "@/components/shared/EmptyState";
import TripDialog from "@/components/trips/TripDialog";
import { formatCurrency } from "@/lib/currencies";
import { cn } from "@/lib/utils";
import { useLocalData } from "@/context/LocalDataContext";

export default function Trips() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTrip, setEditingTrip] = useState(null);
  const { trips, addTrip, updateTrip, deleteTrip } = useLocalData();

  const handleSave = (data) => {
    if (editingTrip) {
      updateTrip(editingTrip.id, data);
    } else {
      addTrip(data);
    }
    setEditingTrip(null);
  };

  const statusColors = {
    planning: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    active: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    completed: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
  };

  return (
    <div className="p-6 lg:p-10 max-w-5xl mx-auto space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-heading tracking-tight">Trips</h1>
          <p className="text-sm text-muted-foreground mt-1">Plan and manage your adventures</p>
        </div>
        <Button onClick={() => { setEditingTrip(null); setDialogOpen(true); }} className="rounded-2xl gap-2 shadow-lg shadow-primary/20">
          <Plus className="w-4 h-4" /> New Trip
        </Button>
      </motion.div>

      {trips.length === 0 ? (
        <EmptyState
          icon={Plane}
          title="No trips yet"
          description="Start planning your next adventure by creating a new trip"
          actionLabel="Create Trip"
          onAction={() => setDialogOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {trips.map((trip, i) => {
            const daysUntil = differenceInDays(parseLocalDate(trip.start_date), new Date());
            const isUpcoming = daysUntil > 0;
            return (
              <motion.div
                key={trip.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-card border border-border rounded-3xl p-6 hover:shadow-lg transition-all cursor-pointer group"
                onClick={() => { setEditingTrip(trip); setDialogOpen(true); }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold font-heading">{trip.name}</h3>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {trip.destinations?.join(", ") || "No destinations"}
                    </div>
                  </div>
                  <span className={cn("text-xs font-medium px-3 py-1 rounded-full", statusColors[trip.status])}>
                    {trip.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-secondary/50 rounded-2xl p-3">
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> Dates
                    </p>
                    <p className="text-sm font-medium mt-1">
                      {format(parseLocalDate(trip.start_date), "MMM d")} – {format(parseLocalDate(trip.end_date), "MMM d")}
                    </p>
                  </div>
                  <div className="bg-secondary/50 rounded-2xl p-3">
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Wallet className="w-3 h-3" /> Budget
                    </p>
                    <p className="text-sm font-medium mt-1">{formatCurrency(trip.total_budget, trip.home_currency)}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  {isUpcoming ? (
                    <p className="text-xs text-muted-foreground">{daysUntil} days until departure</p>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      {differenceInDays(parseLocalDate(trip.end_date), parseLocalDate(trip.start_date))} day trip
                    </p>
                  )}
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      <TripDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        trip={editingTrip}
        onSave={handleSave}
        onDelete={deleteTrip}
      />
    </div>
  );
}