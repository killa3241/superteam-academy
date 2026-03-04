declare global {
  interface Window {
    gtag?: (
      command: "event" | "config",
      targetId: string,
      config?: Record<string, unknown>
    ) => void;
  }
}

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

export function trackEvent(
  name: string,
  payload?: Record<string, unknown>
): void {
  if (!GA_ID || typeof window === "undefined") {
    console.log("Analytics event:", name, payload);
    return;
  }

  if (typeof window.gtag === "function") {
    window.gtag("event", name, payload);
  } else {
    console.log("Analytics fallback:", name, payload);
  }
}

export function trackPageView(url: string): void {
  if (!GA_ID || typeof window === "undefined") return;

  if (typeof window.gtag === "function") {
    window.gtag("config", GA_ID, {
      page_path: url,
    });
  }
}