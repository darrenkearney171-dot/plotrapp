/**
 * analytics.ts
 * Centralised helpers for Meta Pixel and Google Analytics 4 events.
 *
 * Scripts are dynamically injected at runtime using Vite environment variables:
 *   - VITE_GA4_ID        → Google Analytics 4 Measurement ID (G-XXXXXXXXXX)
 *   - VITE_META_PIXEL_ID → Meta (Facebook) Pixel ID
 *
 * Call initAnalytics() once from main.tsx to load the scripts.
 * All track* helpers are safe to call before or after init — they silently
 * no-op when the underlying SDK is unavailable.
 */

// ─── Type declarations ─────────────────────────────────────────────────────────────────

declare global {
  interface Window {
    fbq: (...args: any[]) => void;
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

// ─── Script injection ─────────────────────────────────────────────────────────────────

let _initialised = false;

/**
 * Dynamically inject GA4 and Meta Pixel scripts.
 * Safe to call multiple times — only runs once.
 */
export function initAnalytics() {
  if (_initialised || typeof document === "undefined") return;
  _initialised = true;

  const ga4Id = import.meta.env.VITE_GA4_ID as string | undefined;
  const metaPixelId = import.meta.env.VITE_META_PIXEL_ID as string | undefined;

  // ── Google Analytics 4 ──
  if (ga4Id) {
    const gtagScript = document.createElement("script");
    gtagScript.async = true;
    gtagScript.src = `https://www.googletagmanager.com/gtag/js?id=${ga4Id}`;
    document.head.appendChild(gtagScript);

    window.dataLayer = window.dataLayer || [];
    window.gtag = function (...args: any[]) {
      window.dataLayer.push(args);
    };
    window.gtag("js", new Date());
    window.gtag("config", ga4Id, { send_page_view: false });
  }

  // ── Meta Pixel ──
  if (metaPixelId) {
    (function (f: any, b: any, e: any, v: any) {
      if (f.fbq) return;
      const n: any = (f.fbq = function (...args: any[]) {
        n.callMethod ? n.callMethod(...args) : n.queue.push(args);
      });
      if (!f._fbq) f._fbq = n;
      n.push = n;
      n.loaded = true;
      n.version = "2.0";
      n.queue = [];
      const t = b.createElement(e) as HTMLScriptElement;
      t.async = true;
      t.src = v;
      const s = b.getElementsByTagName(e)[0];
      s?.parentNode?.insertBefore(t, s);
    })(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");

    window.fbq("init", metaPixelId);
    window.fbq("track", "PageView");
  }
}

// ─── Safe wrappers ─────────────────────────────────────────────────────────────────────

function fbq(...args: any[]) {
  if (typeof window !== "undefined" && typeof window.fbq === "function") {
    window.fbq(...args);
  }
}

function gtag(...args: any[]) {
  if (typeof window !== "undefined" && typeof window.gtag === "function") {
    window.gtag(...args);
  }
}

// ─── Unified event helpers ───────────────────────────────────────────────────────────────

export function trackPageView(pageName?: string) {
  fbq("track", "PageView");
  if (pageName) {
    gtag("event", "page_view", { page_title: pageName });
  }
}

// ── Estimate Funnel ────────────────────────────────────────────────────────────────

export function trackEstimateStart(estimateType: "renovation" | "new_build" | "kitchen" = "renovation") {
  fbq("track", "Lead", { content_name: estimateType });
  gtag("event", "estimate_start", { estimate_type: estimateType });
}

export function trackEstimateStep(step: number, estimateType: string) {
  gtag("event", "estimate_step", { step, estimate_type: estimateType });
}

export function trackEstimateComplete(estimateType: "renovation" | "new_build" | "kitchen" = "renovation") {
  fbq("track", "CompleteRegistration", { content_name: estimateType });
  gtag("event", "estimate_complete", { estimate_type: estimateType });
}

export function trackEstimateAbandon(step: number, estimateType: string) {
  gtag("event", "estimate_abandon", { step, estimate_type: estimateType });
}

// ── Kitchen Estimator ──────────────────────────────────────────────────────────────

export function trackKitchenEstimatorView() {
  fbq("track", "ViewContent", { content_name: "kitchen_estimator" });
  gtag("event", "kitchen_estimator_view");
}

export function trackKitchenEstimateComplete(supplyMode: string) {
  fbq("track", "Lead", { content_name: "kitchen_estimate" });
  gtag("event", "kitchen_estimate_complete", { supply_mode: supplyMode });
}

// ── Quote & Contact ────────────────────────────────────────────────────────────────

export function trackQuoteRequest(category: string) {
  fbq("track", "Contact", { content_name: category });
  gtag("event", "quote_request", { category });
}

// ── Signups & Waitlist ──────────────────────────────────────────────────────────────

export function trackWaitlistSignup(source?: string) {
  fbq("track", "Lead", { content_name: source || "waitlist" });
  gtag("event", "waitlist_signup", { source: source || "general" });
}

export function trackProWaitlist() {
  fbq("track", "Lead", { content_name: "pro_waitlist" });
  gtag("event", "pro_waitlist_signup");
}

export function trackTradeWaitlist() {
  fbq("track", "Lead", { content_name: "trade_waitlist" });
  gtag("event", "trade_waitlist_signup");
}

// ── Email Capture ──────────────────────────────────────────────────────────────────

export function trackEmailCapture(source: string) {
  fbq("track", "Lead", { content_name: `email_capture_${source}` });
  gtag("event", "email_capture", { source });
}

// ── CTA Clicks ─────────────────────────────────────────────────────────────────────

export function trackCtaClick(ctaName: string, location: string) {
  gtag("event", "cta_click", { cta_name: ctaName, location });
}

export function trackEarlyAccessClick(source: string) {
  fbq("track", "Lead", { content_name: "early_access" });
  gtag("event", "early_access_click", { source });
}

// ── Subscription & Renovation Pass ─────────────────────────────────────────────────

export function trackSubscriptionStart(tier: string) {
  fbq("track", "InitiateCheckout", { content_name: tier });
  gtag("event", "subscription_start", { tier });
}

export function trackSubscriptionComplete(tier: string) {
  fbq("track", "Purchase", { content_name: tier });
  gtag("event", "subscription_complete", { tier });
}

export function trackRenovationPassClick() {
  fbq("track", "InitiateCheckout", { content_name: "renovation_pass" });
  gtag("event", "renovation_pass_click");
}

export function trackRenovationPassPurchase() {
  fbq("track", "Purchase", { content_name: "renovation_pass" });
  gtag("event", "renovation_pass_purchase");
}

// ── Page-specific views ──────────────────────────────────────────────────────────────

export function trackNewBuildView() {
  fbq("track", "ViewContent", { content_name: "new_build_estimator" });
  gtag("event", "new_build_view");
}

export function trackTradeApplication() {
  fbq("track", "Lead", { content_name: "trade_application" });
  gtag("event", "trade_application");
}

export function trackSupplierView(supplierId: number) {
  gtag("event", "supplier_view", { supplier_id: supplierId });
}

export function trackAffiliateClick(supplierId: number) {
  gtag("event", "affiliate_click", { supplier_id: supplierId });
}

// ── Visualisation & Upload ───────────────────────────────────────────────────────────

export function trackVisualisationGenerate() {
  gtag("event", "visualisation_generate");
}

export function trackFileUpload(fileType: string) {
  gtag("event", "file_upload", { file_type: fileType });
}
