const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useState, useEffect } from "react";

function getTimeOfDay() {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return { label: "Good Morning", emoji: "☀️" };
  if (h >= 12 && h < 17) return { label: "Good Afternoon", emoji: "🌤️" };
  return { label: "Good Evening", emoji: "🌙" };
}

export function useGreeting() {
  const [timeOfDay, setTimeOfDay] = useState(getTimeOfDay);
  const [userName, setUserName] = useState(null);

  // Update greeting every minute
  useEffect(() => {
    const interval = setInterval(() => setTimeOfDay(getTimeOfDay()), 60_000);
    return () => clearInterval(interval);
  }, []);

  // Load user name
  useEffect(() => {
    db.auth.me().then((user) => {
      if (user?.full_name) setUserName(user.full_name.split(" ")[0]);
    }).catch(() => {});
  }, []);

  const displayName = userName || "Traveler";
  const greeting = `${timeOfDay.label}, ${displayName} ${timeOfDay.emoji}`;

  return { greeting, displayName, timeOfDay, userName };
}