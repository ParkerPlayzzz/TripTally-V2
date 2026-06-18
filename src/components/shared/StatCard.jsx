import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export default function StatCard({ title, value, subtitle, icon: Icon, className, gradient, compact }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={cn(
        "relative overflow-hidden rounded-2xl p-5 bg-card border border-border",
        className
      )}
    >
      {gradient && (
        <div className={cn("absolute inset-0 opacity-[0.04]", gradient)} />
      )}
      <div className="relative z-10">
        {Icon && (
          <div className="w-8 h-8 rounded-xl bg-secondary flex items-center justify-center mb-3">
            <Icon className="w-4 h-4 text-muted-foreground" strokeWidth={1.75} />
          </div>
        )}
        <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">{title}</p>
        <p className={cn("font-semibold tracking-tight break-all", compact ? "text-lg leading-tight" : "text-2xl")}>{value}</p>
        {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
      </div>
    </motion.div>
  );
}