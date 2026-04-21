import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

// Global Tailwind styles
import "./index.css";

import App from "./App";
import { ThemeProvider } from "./context/ThemeContext";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    {/* Wrap entire app with ThemeProvider for light/dark support */}
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>
);
