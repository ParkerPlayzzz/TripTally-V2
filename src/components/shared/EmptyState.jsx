import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function EmptyState({ icon: Icon, title, description, actionLabel, onAction }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 px-8 text-center"
    >
      {Icon && (
        <div className="w-16 h-16 rounded-3xl bg-primary/10 flex items-center justify-center mb-5">
          <Icon className="w-8 h-8 text-primary" />
        </div>
      )}
      <h3 className="text-lg font-semibold font-heading mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-sm mb-6">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction} className="rounded-2xl gap-2">
          <Plus className="w-4 h-4" />
          {actionLabel}
        </Button>
      )}
    </motion.div>
  );
}