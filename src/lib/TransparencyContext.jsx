import React, { createContext, useContext, useState } from "react";

const TransparencyContext = createContext({ opacity: 0.85, setOpacity: () => {} });

export function TransparencyProvider({ children }) {
  const [opacity, setOpacity] = useState(() => {
    const stored = localStorage.getItem("dialog-transparency");
    return stored ? parseFloat(stored) : 0.85;
  });

  const update = (val) => {
    setOpacity(val);
    localStorage.setItem("dialog-transparency", String(val));
  };

  return (
    <TransparencyContext.Provider value={{ opacity, setOpacity: update }}>
      {children}
    </TransparencyContext.Provider>
  );
}

export function useTransparency() {
  return useContext(TransparencyContext);
}