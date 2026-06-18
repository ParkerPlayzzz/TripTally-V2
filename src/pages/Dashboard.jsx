const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

import { format, differenceInDays } from "date-fns";
import { CheckCircle2, Circle, ArrowRight, Plane } from "lucide-react";
import { Link } from "react-router-dom";
import { formatCurrency } from "@/lib/currencies";
import { motion, AnimatePresence } from "framer-motion";
import { useGreeting } from "@/hooks/useGreeting";

const stagger = {
  animate: { transition: { staggerChildren: 0.06 } },
};
const item = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.25, 0.1, 0.25, 1] } },
};

export default function Dashboard() {
  const { greeting } = useGreeting();
  const today = format(new Date(), "yyyy-MM-dd");

  const { data: tasks = [] } = useQuery({
    queryKey: ["tasks", today],
    queryFn: () => db.entities.Task.filter({ date: today }),
  });

  const { data: trips = [] } = useQuery({
    queryKey: ["trips"],
    queryFn: () => db.entities.Trip.list("-created_date", 5),
  });

  const { data: purchases = [] } = useQuery({
    queryKey: ["purchases-recent"],
    queryFn: () => db.entities.Purchase.list("-created_date", 10),
  });

  const completedTasks = tasks.filter((t) => t.completed).length;
  const totalTasks = tasks.length;
  const taskProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const activeTrip = trips.find((t) => t.status === "active") || trips[0];
  const tripPurchases = purchases.filter((p) => activeTrip && p.trip_id === activeTrip?.id);
  const totalSpent = tripPurchases.reduce((sum, p) => sum + (p.converted_amount || p.amount), 0);
  const remaining = (activeTrip?.total_budget || 0) - totalSpent;
  const budgetProgress = activeTrip?.total_budget
    ? Math.min(Math.round((totalSpent / activeTrip.total_budget) * 100), 100)
    : 0;

  // Rotating contextual subtext
  const subtextOptions = [
    activeTrip && tasks.length > 0 && `You have ${tasks.length} activit${tasks.length === 1 ? "y" : "ies"} planned today.`,
    activeTrip && remaining >= 0 && `${formatCurrency(Math.max(remaining, 0), activeTrip.home_currency)} remaining in your budget.`,
    activeTrip && activeTrip.destinations?.length > 0 && `Current destination: ${activeTrip.destinations[0]}.`,
    activeTrip && (() => {
      const daysLeft = Math.max(differenceInDays(new Date(activeTrip.end_date), new Date()), 0);
      return daysLeft > 0 ? `${daysLeft} days remaining on your ${activeTrip.name} trip.` : null;
    })(),
    !activeTrip && "Plan your next adventure in Trips.",
  ].filter(Boolean);

  const [subtextIdx, setSubtextIdx] = useState(0);
  useEffect(() => {
    if (subtextOptions.length <= 1) return;
    const t = setInterval(() => setSubtextIdx((i) => (i + 1) % subtextOptions.length), 5000);
    return () => clearInterval(t);
  }, [subtextOptions.length]);
  const subtext = subtextOptions[subtextIdx] || null;

  return (
    <motion.div
      variants={stagger}
      initial="initial"
      animate="animate"
      className="max-w-2xl mx-auto px-6 py-10 lg:py-14 space-y-10"
    >
      {/* Greeting */}
      <motion.div variants={item}>
        <p className="text-xs text-muted-foreground font-medium tracking-widest uppercase mb-1.5">
          {format(new Date(), "EEEE, MMMM d")}
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">{greeting}</h1>
        <AnimatePresence mode="wait">
          {subtext && (
            <motion.p
              key={subtext}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="text-sm text-muted-foreground mt-1.5"
            >
              {subtext}
            </motion.p>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Task Progress */}
      <motion.div variants={item}>
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-foreground">Today's Tasks</span>
          <Link to="/planner" className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
            View all <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        {/* Progress bar */}
        <div className="h-1.5 bg-secondary rounded-full overflow-hidden mb-4">
          <motion.div
            className="h-full bg-foreground rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${taskProgress}%` }}
            transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1], delay: 0.3 }}
          />
        </div>
        {/* Task list */}
        {tasks.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">No tasks for today</p>
        ) : (
          <div className="space-y-1">
            {tasks.slice(0, 5).map((task) => (
              <div
                key={task.id}
                className="flex items-center gap-3 py-2.5 border-b border-border last:border-0"
              >
                {task.completed ? (
                  <CheckCircle2 className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                ) : (
                  <Circle className="w-4 h-4 text-muted-foreground/40 flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className={`text-sm truncate ${task.completed ? "line-through text-muted-foreground" : "text-foreground"}`}>
                    {task.title}
                  </p>
                </div>
                {task.start_time && (
                  <span className="text-xs text-muted-foreground flex-shrink-0">{task.start_time}</span>
                )}
              </div>
            ))}
          </div>
        )}
        <div className="mt-3 flex items-center gap-1.5">
          <span className="text-xs text-muted-foreground">{completedTasks} of {totalTasks} completed</span>
        </div>
      </motion.div>

      {/* Active Trip */}
      {activeTrip && (
        <motion.div variants={item} className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="px-5 pt-5 pb-4">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium mb-1">Active Trip</p>
                <h2 className="text-lg font-semibold tracking-tight">{activeTrip.name}</h2>
                {activeTrip.destinations?.length > 0 && (
                  <p className="text-sm text-muted-foreground mt-0.5">{activeTrip.destinations.join(" → ")}</p>
                )}
              </div>
              <Link to="/trips">
                <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center hover:bg-foreground hover:text-background transition-colors">
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </Link>
            </div>

            {/* Budget bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Spent {formatCurrency(totalSpent, activeTrip.home_currency)}</span>
                <span>of {formatCurrency(activeTrip.total_budget, activeTrip.home_currency)}</span>
              </div>
              <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                <motion.div
                  className={`h-full rounded-full ${budgetProgress > 80 ? "bg-destructive" : "bg-foreground"}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${budgetProgress}%` }}
                  transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1], delay: 0.4 }}
                />
              </div>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 divide-x divide-border border-t border-border">
            {[
              { label: "Budget", value: formatCurrency(activeTrip.total_budget, activeTrip.home_currency) },
              { label: "Remaining", value: formatCurrency(activeTrip.total_budget - totalSpent, activeTrip.home_currency) },
              { label: "Purchases", value: tripPurchases.length },
            ].map(({ label, value }) => (
              <div key={label} className="px-4 py-3 text-center">
                <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
                <p className="text-sm font-semibold tracking-tight">{value}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* No trip */}
      {!activeTrip && (
        <motion.div variants={item} className="border border-dashed border-border rounded-2xl p-8 text-center">
          <Plane className="w-6 h-6 text-muted-foreground/50 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground mb-4">No trips planned yet</p>
          <Link to="/trips" className="text-sm font-medium underline underline-offset-4 hover:text-muted-foreground transition-colors">
            Create a trip
          </Link>
        </motion.div>
      )}

      {/* Recent Purchases */}
      {purchases.length > 0 && (
        <motion.div variants={item}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium">Recent Purchases</span>
            <Link to="/budget" className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-1">
            {purchases.slice(0, 5).map((p) => (
              <div key={p.id} className="flex items-center justify-between py-2.5 border-b border-border last:border-0">
                <div className="min-w-0">
                  <p className="text-sm text-foreground truncate">{p.item_name}</p>
                  <p className="text-xs text-muted-foreground">{p.store_name || p.city || p.date}</p>
                </div>
                <span className="text-sm font-medium ml-4 flex-shrink-0">
                  {formatCurrency(p.amount, p.original_currency)}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}