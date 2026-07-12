import { APP_VERSION } from "@/constants/version";

const REFRESH_ATTEMPT_KEY = "app-version-refresh-attempt";

/** Version baked into this JS bundle at build time. */
export function getBundledAppVersion(): string {
  return APP_VERSION;
}

function getLiveIndexUrl(): string {
  const url = new URL("index.html", `${window.location.origin}${import.meta.env.BASE_URL}`);
  url.searchParams.set("v", String(Date.now()));
  return url.toString();
}

export function parseAppVersionFromHtml(html: string): string | null {
  const match = html.match(/<meta\s+name=["']app-version["']\s+content=["']([^"']+)["']/i);
  return match?.[1] ?? null;
}

/** Fetch the hosted index.html and read its app-version meta tag. */
export async function fetchLiveAppVersion(): Promise<string | null> {
  try {
    const response = await fetch(getLiveIndexUrl(), {
      cache: "no-store",
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
      },
    });

    if (!response.ok) {
      return null;
    }

    const html = await response.text();
    return parseAppVersionFromHtml(html);
  } catch {
    return null;
  }
}

function reloadWithCacheBust(): void {
  const url = new URL(window.location.href);
  url.searchParams.set("_v", String(Date.now()));
  window.location.replace(url.toString());
}

/**
 * If the live site version differs from this bundle, clear caches and reload.
 * Returns true when a reload was triggered (caller should not continue boot).
 */
export async function checkAndRefreshIfStale(): Promise<boolean> {
  const bundled = getBundledAppVersion();
  const live = await fetchLiveAppVersion();

  if (!live || live === bundled) {
    return false;
  }

  // Avoid infinite reload loops if CDN or browser is still serving an old bundle.
  const lastAttempt = sessionStorage.getItem(REFRESH_ATTEMPT_KEY);
  if (lastAttempt === live) {
    console.warn(
      `[app-version] Live is v${live} but bundle is v${bundled}; refresh already attempted this session.`
    );
    return false;
  }

  sessionStorage.setItem(REFRESH_ATTEMPT_KEY, live);
  reloadWithCacheBust();
  return true;
}
