/**
 * PRIVATE PRICINE ENGINE — Renolab Fitted Furniture
 *
 * ⚠️  This file MUST NEVER be imported by client-side code.
 *     It is server-only. Do not expose raw cost layers, buy rates,
 *     margin percentages, or individual item prices to any public API response.
 *
 * Categories supported:
 *   - kitchen  (Phase 1)
 *   - wardrobe (Phase 2)
 *   - media_wall / bespoke_storage (Phase 3)
 */

// ─── BOARD / SHEET MATERIAL COSTS (ex-VAT) ───────────────────────────────────
const BOARD = {
  mfc_white_sheet: 40,        // 18mm white MFC 2800×2070mm per sheet
  mdf_mr_sheet: 28,           // 18mm MR MDF 3051�_220mm per sheet
  premium_egger_sheet: 52,    // Uni colours / premium Egger finishes
  feelwood_sheet: 65,         // Feelwood / textured decorative premium
};
