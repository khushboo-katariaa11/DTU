import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { AuthProvider } from "./hooks/use-auth";
import { AccessibilityProvider } from "./context/AccessibilityContext";

createRoot(document.getElementById("root")!).render(
  <App />
);
