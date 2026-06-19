import React, { useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  CalendarDays,
  Wallet,
  BarChart3,
  Plane,
  Settings,
  Heart,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import AppLogo from "@/components/layout/AppLogo";
import { Toaster } from "@/components/ui/toaster";
import FirstRunDialog from "@/components/FirstRunDialog";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/" },
  { icon: CalendarDays, label: "Planner", path: "/planner" },
  { icon: Wallet, label: "Budget", path: "/budget" },
  { icon: BarChart3, label: "Analytics", path: "/analytics" },
  { icon: Plane, label: "Trips", path: "/trips" },
  { icon: Heart, label: "Wishlist", path: "/wishlist" },
  { icon: Settings, label: "Settings", path: "/settings" },
];

function NavItem({ item, isActive, onClick }) {
  return (
    <Link to={item.path} onClick={onClick}>
      <div
        className={cn(
          "relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 cursor-pointer select-none",
          isActive
            ? "bg-foreground text-background"
            : "text-muted-foreground hover:text-foreground hover:bg-secondary"
        )}
      >
        <item.icon className="w-[18px] h-[18px] flex-shrink-0" strokeWidth={isActive ? 2 : 1.75} />
        <span className={cn("text-sm tracking-[-0.01em]", isActive ? "font-semibold" : "font-normal")}>
          {item.label}
        </span>
      </div>
    </Link>
  );
}

export default function AppLayout() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (item) =>
    location.pathname === item.path ||
    (item.path !== "/" && location.pathname.startsWith(item.path));

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-56 border-r border-border bg-background px-3 py-5">
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-3 mb-8">
          <AppLogo size={28} />
          <span className="text-sm font-semibold tracking-tight">TripTally</span>
        </div>

        <nav className="flex-1 space-y-0.5">
          {navItems.map((item) => (
            <NavItem key={item.path} item={item} isActive={isActive(item)} />
          ))}
        </nav>

        <div className="px-3">
          <p className="text-[11px] text-muted-foreground/60 tracking-wide">v1.0</p>
        </div>
      </aside>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: -240 }}
              animate={{ x: 0 }}
              exit={{ x: -240 }}
              transition={{ type: "spring", stiffness: 400, damping: 40 }}
              className="fixed inset-y-0 left-0 w-56 bg-background border-r border-border z-50 px-3 py-5 lg:hidden"
            >
              <div className="flex items-center justify-between px-3 mb-8">
                <div className="flex items-center gap-2.5">
                  <AppLogo size={28} />
                  <span className="text-sm font-semibold">TripTally</span>
                </div>
                <button onClick={() => setMobileOpen(false)} className="p-1 rounded-lg hover:bg-secondary text-muted-foreground">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <nav className="space-y-0.5">
                {navItems.map((item) => (
                  <NavItem
                    key={item.path}
                    item={item}
                    isActive={isActive(item)}
                    onClick={() => setMobileOpen(false)}
                  />
                ))}
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <header className="lg:hidden flex items-center justify-between px-4 h-12 border-b border-border bg-background/90 backdrop-blur-xl">
          <button onClick={() => setMobileOpen(true)} className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground">
            <Menu className="w-4.5 h-4.5" />
          </button>
          <div className="flex items-center gap-2">
            <AppLogo size={24} />
            <span className="text-sm font-semibold">TripTally</span>
          </div>
          <div className="w-8" />
        </header>

        <div className="flex-1 overflow-y-auto">
          <Outlet />
        </div>
        <Toaster />
        <FirstRunDialog />
      </main>
    </div>
  );
}