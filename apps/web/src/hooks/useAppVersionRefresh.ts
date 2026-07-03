import { useEffect } from "react";
import { checkAndRefreshIfStale } from "@/lib/appVersionCheck";

const POLL_INTERVAL_MS = 3 * 60 * 1000;

/**
 * Re-check the hosted app version while the tab is open (deploy mid-session,
 * returning from another tab, etc.).
 */
export function useAppVersionRefresh(): void {
  useEffect(() => {
    let cancelled = false;

    const runCheck = async () => {
      if (cancelled || document.visibilityState === "hidden") {
        return;
      }
      await checkAndRefreshIfStale();
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        void runCheck();
      }
    };

    const intervalId = window.setInterval(() => {
      void runCheck();
    }, POLL_INTERVAL_MS);

    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, []);
}
