import React, { createContext, useContext, useEffect, useState } from "react";

const KEY_TIME_FORMAT = "triptally:time-format";
const DEFAULT_FORMAT = "standard";

const TimeFormatContext = createContext({ format: DEFAULT_FORMAT, setFormat: () => {} });

export function TimeFormatProvider({ children }) {
  const [format, setFormatState] = useState(() => {
    const stored = localStorage.getItem(KEY_TIME_FORMAT);
    return stored === "military" ? "military" : DEFAULT_FORMAT;
  });

  const setFormat = (value) => {
    const next = value === "military" ? "military" : DEFAULT_FORMAT;
    setFormatState(next);
    localStorage.setItem(KEY_TIME_FORMAT, next);
  };

  useEffect(() => {
    localStorage.setItem(KEY_TIME_FORMAT, format);
  }, [format]);

  return (
    <TimeFormatContext.Provider value={{ format, setFormat }}>
      {children}
    </TimeFormatContext.Provider>
  );
}

export function useTimeFormat() {
  return useContext(TimeFormatContext);
}
