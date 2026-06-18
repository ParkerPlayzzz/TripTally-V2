import React, { createContext, useContext, useState } from "react";

const DEFAULT_SIZE = 1; // 1 = 100% = no change
const FontSizeContext = createContext({ size: DEFAULT_SIZE, setSize: () => {} });

export function FontSizeProvider({ children }) {
  const [size, setSize] = useState(() => {
    const saved = localStorage.getItem("app-font-size");
    return saved ? parseFloat(saved) : DEFAULT_SIZE;
  });

  const updateSize = (val) => {
    setSize(val);
    localStorage.setItem("app-font-size", val);
    document.documentElement.style.fontSize = `${val * 16}px`;
  };

  // Apply on mount
  React.useEffect(() => {
    document.documentElement.style.fontSize = `${size * 16}px`;
  }, []);

  return (
    <FontSizeContext.Provider value={{ size, setSize: updateSize, defaultSize: DEFAULT_SIZE }}>
      {children}
    </FontSizeContext.Provider>
  );
}

export const useFontSize = () => useContext(FontSizeContext);