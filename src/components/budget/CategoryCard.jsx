import React from "react";
import { motion } from "framer-motion";
import { formatCurrency } from "@/lib/currencies";
import { Lock, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

export default function CategoryCard({ category, spent, currency, onClick }) {
  const budget = category.planned_budget || 0;
  const percentage = budget > 0 ? Math.round((spent / budget) * 100) : 0;
  const isOverBudget = percentage > 100;
  const isWarning = percentage >= (category.warning_threshold || 80);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="bg-card border border-border rounded-3xl p-5 cursor-pointer hover:shadow-md transition-all"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center"
            style={{ backgroundColor: `${category.color}20` }}
          >
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: category.color }} />
          </div>
          <div>
            <p className="font-semibold text-sm">{category.name}</p>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(spent, currency)} of {formatCurrency(budget, currency)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {category.is_locked && <Lock className="w-3.5 h-3.5 text-muted-foreground" />}
          {isWarning && !isOverBudget && <AlertTriangle className="w-3.5 h-3.5 text-warning" />}
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-secondary rounded-full h-2 mb-2">
        <motion.div
          className="h-2 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(percentage, 100)}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          style={{
            backgroundColor: isOverBudget
              ? "hsl(var(--destructive))"
              : isWarning
              ? "hsl(var(--warning))"
              : category.color,
          }}
        />
      </div>

      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          {formatCurrency(Math.max(budget - spent, 0), currency)} remaining
        </p>
        <p className={cn(
          "text-xs font-semibold",
          isOverBudget ? "text-destructive" : isWarning ? "text-warning" : "text-muted-foreground"
        )}>
          {percentage}%
        </p>
      </div>
    </motion.div>
  );
}