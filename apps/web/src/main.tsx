import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { checkAndRefreshIfStale } from "./lib/appVersionCheck";
import "./index.css";

function mountApp(): void {
  const root = document.getElementById("root");
  if (!root) {
    return;
  }

  createRoot(root).render(
    <StrictMode>
      <BrowserRouter basename="/an-average-rpg">
        <App />
      </BrowserRouter>
    </StrictMode>
  );
}

mountApp();
void checkAndRefreshIfStale();
