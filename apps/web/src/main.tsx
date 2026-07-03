import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { checkAndRefreshIfStale } from "./lib/appVersionCheck";
import "./index.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
});

function mountApp(): void {
  const root = document.getElementById("root");
  if (!root) {
    return;
  }

  createRoot(root).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter basename="/an-average-rpg">
          <App />
        </BrowserRouter>
      </QueryClientProvider>
    </StrictMode>
  );
}

void checkAndRefreshIfStale().then((reloading) => {
  if (!reloading) {
    mountApp();
  }
});
