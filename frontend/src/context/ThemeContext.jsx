// ============================================================
// ThemeContext.jsx — Global light/dark theme provider
// Usage: wrap app with <ThemeProvider>, consume with useTheme()
// ============================================================

import { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  // Initialize from localStorage or default to "dark"
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "dark");

  useEffect(() => {
    // Apply theme class to <html> for Tailwind dark mode
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
    console.log("[THEME] Theme set to:", theme);
  }, [theme]);

  const toggleTheme = () =>
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// Custom hook for easy consumption
export function useTheme() {
  return useContext(ThemeContext);
}
