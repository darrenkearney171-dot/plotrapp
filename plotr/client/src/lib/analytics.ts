/**
 * analytics.ts
 * Centralised helpers for Meta Pixel and Google Analytics 4 events.
 *
 * Both tracking scripts are loaded via index.html.
 * These helpers are safe to call even before the scripts load — they queue
 * events internally until the SDK is ready.
 *
 * IMPORTANT: Replace placeholder IDs in index.html before going live:
 *   - REPLACE_WITH_META_PIXEL_ID → your Meta Pixel ID
 *   - REPLACE_WITH_GA4_ID → your GA4 Measurement ID (G-XXXXXXXXXX)
 */

// ─── Type declarations ────────────────────────────────────────────────────────

declare global {
  interface Window {
    fbq?: (...args: any[]) => void;
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

// ─── Meta Pixel ───────────────────────────────────────────────────────────────

function fbq(...args: any[]) {
  if (typeof window !== "undefined" && typeof window.fbq === "function") {
    window.fbq(...args);
  }
}

// ─── Google Analytics 4 ───────────────────────────────────────────────────────

function gtag(...args: any[]) {
  if (typeof window !== "undefined" && typeof window.gtag === "function") {
    window.gtag(...args);
  }
}

// ─── Unified event helpers ────────────────────────────────────────────────────

/** Fire on every page load (called in each page component via useEffect) */
export function trackPageView(pageName?: string) {
  fbq("track", "PageView");
  if (pageName) {
    gtag("event", "page_view", { page_title: pageName });
  }
}

// ── Estimate Funnel ──────────────────────────────────────────────────────────

/** User clicks any "Get My Free Estimate" / "Start Your Project" CTA */
export function trackEstimateStart(estimateType: "renovation" | "new_build" | "kitchen" = "renovation") {
  fbq("track", "Lead", { content_name: "estimate_start", content_category: estimateType });
  gtag("event", "estimate_start", { event_category: "engagement", estimate_type: estimateType });
}

/** User completes a step in the estimate wizard */
export function trackEstimateStep(step: number, estimateType: string) {
  gtag("event", "estimate_step", { event_category: "engagement", step_number: step, estimate_type: estimateType });
}

/** User reaches the estimate results page */
export function trackEstimateComplete(estimateType: "renovation" | "new_build" | "kitchen" = "renovation") {
  fbq("track", "Lead", { content_name: "estimate_complete", content_category: estimateType });
  gtag("event", "estimate_complete", { event_category: "conversion", estimate_type: estimateType });
}

/** User abandons estimate wizard (fires on unmount if not completed) */
export function trackEstimateAbandon(step: number, estimateType: string) {
  gtag("event", "estimate_abandon", { event_category: "engagement", step_number: step, estimate_type: estimateType });
}

// ── Kitchen Estimator ────────────────────────────────────────────────────────

/** User lands on the kitchen estimator page */
export function trackKitchenEstimatorView() {
  fbq("track", "ViewContent", { content_name: "kitchen_estimator" });
  gtag("event", "kitchen_estimator_view", { event_category: "engagement" });
}

/** User submits a kitchen estimate calculation */
export function trackKitchenEstimateComplete(supplyMode: string) {
  fbq("track", "Lead", { content_name: "kitchen_estimate_complete", content_category: supplyMode });
  gtag("event", "kitchen_estimate_complete", { event_category: "conversion", supply_mode: supplyMode });
}

/** User submits a formal quote request */
export function trackQuoteRequest(category: string) {
  fbq("track", "Lead", { content_name: "quote_request", content_category: category });
  gtag("event", "quote_request", { event_category: "conversion", quote_category: category });
}

// ── Waitlist & Signups ───────────────────────────────────────────────────────

/** User submits email on any waitlist form */
export function trackWaitlistSignup(source?: string) {
  fbq("track", "Lead", { content_name: "waitlist_signup", content_category: source });
  gtag("event", "waitlist_signup", { event_category: "conversion", signup_source: source });
}

/** User clicks "Join the Waitlist" for Pro tier */
export function trackProWaitlist() {
  fbq("track", "InitiateCheckout", { content_name: "pro_waitlist" });
  gtag("event", "pro_waitlist", { event_category: "conversion" });
}

/** User clicks "Join the Waitlist" for Trade tier */
export function trackTradeWaitlist() {
  fbq("track", "InitiateCheckout", { content_name: "trade_waitlist" });
  gtag("event", "trade_waitlist", { event_category: "conversion" });
}

// ── Subscription & Payment ───────────────────────────────────────────────────

/** User clicks upgrade / subscribe button */
export function trackSubscriptionStart(tier: string) {
  fbq("track", "InitiateCheckout", { content_name: "subscription_start", content_category: tier });
  gtag("event", "begin_checkout", { event_category: "conversion", subscription_tier: tier });
}

/** Subscription successfully completed */
export function trackSubscriptionComplete(tier: string) {
  fbq("track", "Purchase", { content_name: "subscription_complete", content_category: tier });
  gtag("event", "purchase", { event_category: "conversion", subscription_tier: tier });
}

// ── Content & Navigation ─────────────────────────────────────────────────────

/** User lands on the New Build page */
export function trackNewBuildView() {
  fbq("track", "ViewContent", { content_name: "new_build" });
  gtag("event", "new_build_view", { event_category: "engagement" });
}

/** User submits the tradesperson application form */
export function trackTradeApplication() {
  fbq("track", "Lead", { content_name: "trade_application" });
  gtag("event", "trade_application", { event_category: "conversion" });
}

/** User views a supplier profile */
export function trackSupplierView(supplierId: number) {
  gtag("event", "supplier_view", { event_category: "engagement", supplier_id: supplierId });
}

/** User clicks a supplier affiliate link */
export function trackAffiliateClick(supplierId: number) {
  fbq("track", "ViewContent", { content_name: "affiliate_click" });
  gtag("event", "affiliate_click", { event_category: "engagement", supplier_id: supplierId });
}

/** User generates a 3D visualisation */
export function trackVisualisationGenerate() {
  fbq("track", "ViewContent", { content_name: "visualisation_generate" });
  gtag("event", "visualisation_generate", { event_category: "engagement" });
}

/** User uploads a file (photo, floor plan) */
export function trackFileUpload(fileType: string) {
  gtag("event", "file_upload", { event_category: "engagement", file_type: fileType });
}
