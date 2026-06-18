import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGreeting } from "@/hooks/useGreeting";

export default function GreetingHeader({ subtext }) {
  const { greeting } = useGreeting();

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.25, 0.1, 0.25, 1] }}
      className="mb-8"
    >
      <h1 className="text-3xl font-semibold tracking-tight text-foreground leading-tight">
        {greeting}
      </h1>
      {subtext && (
        <AnimatePresence mode="wait">
          <motion.p
            key={subtext}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="text-sm text-muted-foreground mt-1.5"
          >
            {subtext}
          </motion.p>
        </AnimatePresence>
      )}
    </motion.div>
  );
}