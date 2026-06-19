import { useState, useEffect } from "react";
import db from "@/lib/db-fallback";

function getTimeOfDay() {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return { label: "Good Morning", emoji: "☀️" };
  if (h >= 12 && h < 17) return { label: "Good Afternoon", emoji: "🌤️" };
  return { label: "Good Evening", emoji: "🌙" };
}

export function useGreeting() {
  const [timeOfDay, setTimeOfDay] = useState(getTimeOfDay);
  const stored = (() => {
    try {
      const raw = localStorage.getItem('triptally:user');
      return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
  })();

  const [userName, setUserName] = useState(stored ?? null);

  // Update greeting every minute
  useEffect(() => {
    const interval = setInterval(() => setTimeOfDay(getTimeOfDay()), 60_000);
    return () => clearInterval(interval);
  }, []);

  // Load user name
  useEffect(() => {
    // Fallback to remote auth if available
    db.auth.me().then((user) => {
      if (user?.full_name) setUserName(user.full_name.split(" ")[0]);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    // also watch localStorage changes from other tabs
    const onStorage = (e) => {
      if (e.key === 'triptally:user') {
        try { setUserName(e.newValue ? JSON.parse(e.newValue) : null); } catch {};
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const displayName = userName || "Traveler";
  const greeting = `${timeOfDay.label}, ${displayName} ${timeOfDay.emoji}`;

  return { greeting, displayName, timeOfDay, userName };
}