/**
 * PRIVATE PRICING ENGINE — Plotrapp Fitted Furniture
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
  mdf_mr_sheet: 28,           // 18mm MR MDF 3050×1220mm per sheet
  premium_egger_sheet: 52,    // Uni colours / premium Egger finishes
  feelwood_sheet: 65,         // Feelwood / textured decorative premium
};

// ─── EDGING ───────────────────────────────────────────────────────────────────
const EDGING = {
  abs_08mm_per_metre: 0.17,   // £25 / 150m roll
  abs_2mm_per_metre: 0.56,    // £42 / 75m roll
};

// ─── HARDWARE ─────────────────────────────────────────────────────────────────
const HARDWARE = {
  blum_hinge_plate: 5,        // per hinge+plate set (Blum soft-close standard)
  blum_antaro_drawer_low: 30, // per drawer set — standard spec
  blum_antaro_drawer_high: 45,// per drawer set — premium spec
  handle_standard: 5,         // per handle
  handle_premium: 15,         // per handle — upgraded range
};

// ─── WORKTOPS (per 4.1m length) ──────────────────────────────────────────────
const WORKTOP = {
  postform_38mm_600: 103,
  square_edge_25mm_600: 145,
  bullnose_38mm_900: 245,
  square_edge_25mm_900: 245,
  quartz_per_sqm: 400,        // planning allowance — override with live sheet
};

// ─── LABOUR STRUCTURE (as % of total project cost — backend only) ─────────────
// These percentages are commercial targets, never shown to users.
const LABOUR_STRUCTURE = {
  factory_labour_pct: 0.28,   // ~high 20s
  fitting_pct: 0.14,          // ~mid teens (supply+fit only)
  management_pct: 0.03,
  design_pct: 0.02,
  delivery_pct: 0.03,
  margin_pct: 0.20,           // standard margin
};

// ─── UNIT CARCASS MATERIAL USAGE (sheets per unit type) ──────────────────────
// Approximate sheet consumption per unit, used for material cost layer.
const UNIT_SHEETS: Record<string, number> = {
  base_600: 0.8,
  base_500: 0.7,
  base_1000: 1.2,
  wall_600: 0.5,
  wall_500: 0.45,
  wall_1000: 0.8,
  tall_600: 1.8,
  tall_500: 1.6,
  drawer_pack_600: 1.0,
};

// ─── DOOR COST RANGES BY RANGE TIER ──────────────────────────────────────────
const DOOR_COST_PER_DOOR: Record<string, { min: number; max: number }> = {
  slab_mfc: { min: 18, max: 28 },
  shaker_painted: { min: 35, max: 55 },
  handleless_j_pull: { min: 40, max: 65 },
  premium_lacquered: { min: 75, max: 120 },
};

// ─── TYPES ────────────────────────────────────────────────────────────────────

export type CarcassFinish = "white_mfc" | "premium_egger" | "feelwood";
export type DoorRange = "slab_mfc" | "shaker_painted" | "handleless_j_pull" | "premium_lacquered";
export type HandleRange = "standard" | "premium" | "none";
export type WorktopSpec =
  | "postform_38mm_600"
  | "square_edge_25mm_600"
  | "bullnose_38mm_900"
  | "square_edge_25mm_900"
  | "quartz"
  | "none";
export type SupplyMode = "supply_only" | "supply_and_fit";

export interface KitchenInputs {
  /** Linear run length in metres (used for blended per-LM output) */
  runLengthMetres: number;
  /** Unit counts */
  baseUnits600: number;
  baseUnits500: number;
  baseUnits1000: number;
  wallUnits600: number;
  wallUnits500: number;
  wallUnits1000: number;
  tallUnits600: number;
  tallUnits500: number;
  drawerPacks: number;
  /** Spec */
  carcassFinish: CarcassFinish;
  doorRange: DoorRange;
  handleRange: HandleRange;
  worktopSpec: WorktopSpec;
  worktopRunMetres: number;   // metres of worktop required
  /** Extras */
  endPanels: number;
  fillers: number;
  plinthMetres: number;
  corniceMetres: number;
  splashbackSqm: number;
  appliancesAllowance: number; // £ user-entered or 0
  /** Supply mode */
  supplyMode: SupplyMode;
}

export interface PricingLayerBreakdown {
  materialCost: number;
  factoryLabour: number;
  fittingLabour: number;
  management: number;
  design: number;
  delivery: number;
  margin: number;
  subtotal: number;
  totalIncMargin: number;
}

export interface KitchenEstimateResult {
  /** Public-safe outputs — these CAN be sent to the client */
  public: {
    estimateRangeLow: number;
    estimateRangeHigh: number;
    /** Blended per-linear-metre figure (trade output) */
    perLinearMetreLow: number;
    perLinearMetreHigh: number;
    totalCabinetryLow: number;
    totalCabinetryHigh: number;
    worktopCost: number;
    fittingCost: number;
    deliveryCost: number;
    appliancesAllowance: number;
    grandTotalLow: number;
    grandTotalHigh: number;
    /** Shopping list preview (names + quantities, NO prices) */
    shoppingListPreview: Array<{ item: string; qty: number; unit: string }>;
    /** Pro-level full list (names + quantities + indicative price range) */
    shoppingListFull: Array<{ item: string; qty: number; unit: string; priceRangeLow: number; priceRangeHigh: number }>;
    aiSummary: string;
    supplyMode: SupplyMode;
    runLengthMetres: number;
  };
  /** Private layers — NEVER send to client */
  _private: PricingLayerBreakdown;
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function boardCostPerSheet(finish: CarcassFinish): number {
  switch (finish) {
    case "white_mfc": return BOARD.mfc_white_sheet;
    case "premium_egger": return BOARD.premium_egger_sheet;
    case "feelwood": return BOARD.feelwood_sheet;
  }
}

function totalSheets(inputs: KitchenInputs): number {
  return (
    inputs.baseUnits600 * UNIT_SHEETS.base_600 +
    inputs.baseUnits500 * UNIT_SHEETS.base_500 +
    inputs.baseUnits1000 * UNIT_SHEETS.base_1000 +
    inputs.wallUnits600 * UNIT_SHEETS.wall_600 +
    inputs.wallUnits500 * UNIT_SHEETS.wall_500 +
    inputs.wallUnits1000 * UNIT_SHEETS.wall_1000 +
    inputs.tallUnits600 * UNIT_SHEETS.tall_600 +
    inputs.tallUnits500 * UNIT_SHEETS.tall_500 +
    inputs.drawerPacks * UNIT_SHEETS.drawer_pack_600
  );
}

function totalDoors(inputs: KitchenInputs): number {
  // Units >600mm get 2 doors; standard units get 1; drawer packs get fronts counted separately
  return (
    inputs.baseUnits600 * 1 +
    inputs.baseUnits500 * 1 +
    inputs.baseUnits1000 * 2 +
    inputs.wallUnits600 * 1 +
    inputs.wallUnits500 * 1 +
    inputs.wallUnits1000 * 2 +
    inputs.tallUnits600 * 2 +
    inputs.tallUnits500 * 2 +
    inputs.drawerPacks * 3  // 3 drawer fronts per pack
  );
}

function totalHinges(inputs: KitchenInputs): number {
  // 2 hinges per standard door; tall units get 3
  const standardDoors =
    inputs.baseUnits600 + inputs.baseUnits500 + inputs.baseUnits1000 * 2 +
    inputs.wallUnits600 + inputs.wallUnits500 + inputs.wallUnits1000 * 2;
  const tallDoors = (inputs.tallUnits600 + inputs.tallUnits500) * 2;
  return standardDoors * 2 + tallDoors * 3;
}

function totalHandles(inputs: KitchenInputs): number {
  return totalDoors(inputs) + inputs.endPanels; // end panels sometimes get handles
}

function worktopCost(inputs: KitchenInputs): number {
  if (inputs.worktopSpec === "none") return 0;
  const runs = Math.ceil(inputs.worktopRunMetres / 4.1);
  if (inputs.worktopSpec === "quartz") {
    // Approximate depth 600mm = 0.6 sqm per LM
    return inputs.worktopRunMetres * 0.6 * WORKTOP.quartz_per_sqm;
  }
  return runs * WORKTOP[inputs.worktopSpec];
}

function edgingCost(inputs: KitchenInputs): number {
  // Rough allowance: 3m of 0.8mm edging per unit on average
  const totalUnits =
    inputs.baseUnits600 + inputs.baseUnits500 + inputs.baseUnits1000 +
    inputs.wallUnits600 + inputs.wallUnits500 + inputs.wallUnits1000 +
    inputs.tallUnits600 + inputs.tallUnits500 + inputs.drawerPacks;
  return totalUnits * 3 * EDGING.abs_08mm_per_metre;
}

function drawerHardwareCost(inputs: KitchenInputs, spec: "low" | "high"): number {
  const cost = spec === "high" ? HARDWARE.blum_antaro_drawer_high : HARDWARE.blum_antaro_drawer_low;
  return inputs.drawerPacks * cost;
}

// ─── MAIN ENGINE ──────────────────────────────────────────────────────────────

export function calculateKitchenEstimate(inputs: KitchenInputs): KitchenEstimateResult {
  const sheetCost = boardCostPerSheet(inputs.carcassFinish);
  const sheets = totalSheets(inputs);
  const doors = totalDoors(inputs);
  const hinges = totalHinges(inputs);
  const handles = totalHandles(inputs);

  const doorRange = DOOR_COST_PER_DOOR[inputs.doorRange];
  const handleCost = inputs.handleRange === "premium"
    ? handles * HARDWARE.handle_premium
    : inputs.handleRange === "standard"
    ? handles * HARDWARE.handle_standard
    : 0;

  // Material cost (low / high range)
  const materialLow =
    sheets * sheetCost +
    doors * doorRange.min +
    hinges * HARDWARE.blum_hinge_plate +
    drawerHardwareCost(inputs, "low") +
    handleCost +
    edgingCost(inputs) +
    inputs.endPanels * sheetCost * 0.5 +
    inputs.plinthMetres * 8 +
    inputs.corniceMetres * 6;

  const materialHigh =
    sheets * sheetCost * 1.05 + // 5% waste
    doors * doorRange.max +
    hinges * HARDWARE.blum_hinge_plate +
    drawerHardwareCost(inputs, "high") +
    handleCost +
    edgingCost(inputs) * 1.1 +
    inputs.endPanels * sheetCost * 0.6 +
    inputs.plinthMetres * 10 +
    inputs.corniceMetres * 8;

  // Factory labour (% of material cost)
  const factoryLabourLow = materialLow * LABOUR_STRUCTURE.factory_labour_pct;
  const factoryLabourHigh = materialHigh * LABOUR_STRUCTURE.factory_labour_pct;

  // Management + design
  const managementLow = materialLow * LABOUR_STRUCTURE.management_pct;
  const managementHigh = materialHigh * LABOUR_STRUCTURE.management_pct;
  const designLow = materialLow * LABOUR_STRUCTURE.design_pct;
  const designHigh = materialHigh * LABOUR_STRUCTURE.design_pct;

  // Delivery
  const deliveryLow = materialLow * LABOUR_STRUCTURE.delivery_pct;
  const deliveryHigh = materialHigh * LABOUR_STRUCTURE.delivery_pct;

  // Fitting (only if supply+fit)
  const fittingLow = inputs.supplyMode === "supply_and_fit"
    ? (materialLow + factoryLabourLow) * LABOUR_STRUCTURE.fitting_pct
    : 0;
  const fittingHigh = inputs.supplyMode === "supply_and_fit"
    ? (materialHigh + factoryLabourHigh) * LABOUR_STRUCTURE.fitting_pct
    : 0;

  // Subtotal before margin
  const subtotalLow = materialLow + factoryLabourLow + managementLow + designLow + deliveryLow + fittingLow;
  const subtotalHigh = materialHigh + factoryLabourHigh + managementHigh + designHigh + deliveryHigh + fittingHigh;

  // Margin
  const marginLow = subtotalLow * LABOUR_STRUCTURE.margin_pct;
  const marginHigh = subtotalHigh * LABOUR_STRUCTURE.margin_pct;

  const totalCabinetryLow = Math.round(subtotalLow + marginLow);
  const totalCabinetryHigh = Math.round(subtotalHigh + marginHigh);

  // Worktop (separate optional extra)
  const wtCost = Math.round(worktopCost(inputs));

  // Grand total
  const grandTotalLow = totalCabinetryLow + wtCost + inputs.appliancesAllowance;
  const grandTotalHigh = totalCabinetryHigh + wtCost + inputs.appliancesAllowance;

  // Per-linear-metre (blended — trade output)
  const lm = Math.max(inputs.runLengthMetres, 1);
  const perLmLow = Math.round(totalCabinetryLow / lm);
  const perLmHigh = Math.round(totalCabinetryHigh / lm);

  // Shopping list (quantities only — no raw prices in preview)
  const shoppingListPreview = [
    { item: "Carcass boards (18mm MFC/MDF)", qty: Math.ceil(sheets), unit: "sheets" },
    { item: "Cabinet doors", qty: doors, unit: "doors" },
    { item: "Soft-close hinges", qty: hinges, unit: "hinges" },
    { item: "Drawer runner sets", qty: inputs.drawerPacks, unit: "sets" },
    { item: "Handles", qty: handles, unit: "handles" },
    { item: "Plinth", qty: Math.ceil(inputs.plinthMetres), unit: "metres" },
    ...(inputs.corniceMetres > 0 ? [{ item: "Cornice / pelmet", qty: Math.ceil(inputs.corniceMetres), unit: "metres" }] : []),
    ...(inputs.endPanels > 0 ? [{ item: "End panels", qty: inputs.endPanels, unit: "panels" }] : []),
  ];

  // Full shopping list with indicative price ranges (Pro tier)
  const shoppingListFull = [
    { item: "Carcass boards (18mm MFC/MDF)", qty: Math.ceil(sheets), unit: "sheets", priceRangeLow: Math.round(sheets * sheetCost), priceRangeHigh: Math.round(sheets * sheetCost * 1.05) },
    { item: "Cabinet doors", qty: doors, unit: "doors", priceRangeLow: Math.round(doors * doorRange.min), priceRangeHigh: Math.round(doors * doorRange.max) },
    { item: "Soft-close hinges (Blum)", qty: hinges, unit: "hinges", priceRangeLow: Math.round(hinges * HARDWARE.blum_hinge_plate), priceRangeHigh: Math.round(hinges * HARDWARE.blum_hinge_plate) },
    { item: "Drawer runner sets (Blum Antaro)", qty: inputs.drawerPacks, unit: "sets", priceRangeLow: Math.round(inputs.drawerPacks * HARDWARE.blum_antaro_drawer_low), priceRangeHigh: Math.round(inputs.drawerPacks * HARDWARE.blum_antaro_drawer_high) },
    { item: "Handles", qty: handles, unit: "handles", priceRangeLow: Math.round(handleCost * 0.9), priceRangeHigh: Math.round(handleCost * 1.1) },
    { item: "Plinth", qty: Math.ceil(inputs.plinthMetres), unit: "metres", priceRangeLow: Math.round(inputs.plinthMetres * 8), priceRangeHigh: Math.round(inputs.plinthMetres * 10) },
    ...(inputs.corniceMetres > 0 ? [{ item: "Cornice / pelmet", qty: Math.ceil(inputs.corniceMetres), unit: "metres", priceRangeLow: Math.round(inputs.corniceMetres * 6), priceRangeHigh: Math.round(inputs.corniceMetres * 8) }] : []),
    ...(inputs.endPanels > 0 ? [{ item: "End panels", qty: inputs.endPanels, unit: "panels", priceRangeLow: Math.round(inputs.endPanels * sheetCost * 0.5), priceRangeHigh: Math.round(inputs.endPanels * sheetCost * 0.6) }] : []),
    ...(wtCost > 0 ? [{ item: `Worktop (${inputs.worktopSpec.replace(/_/g, " ")})`, qty: Math.ceil(inputs.worktopRunMetres), unit: "metres", priceRangeLow: Math.round(wtCost * 0.95), priceRangeHigh: Math.round(wtCost * 1.05) }] : []),
    ...(inputs.appliancesAllowance > 0 ? [{ item: "Appliances allowance", qty: 1, unit: "allowance", priceRangeLow: inputs.appliancesAllowance, priceRangeHigh: inputs.appliancesAllowance }] : []),
  ];

  const aiSummary = buildAISummary(inputs, grandTotalLow, grandTotalHigh, perLmLow, perLmHigh);

  return {
    public: {
      estimateRangeLow: grandTotalLow,
      estimateRangeHigh: grandTotalHigh,
      perLinearMetreLow: perLmLow,
      perLinearMetreHigh: perLmHigh,
      totalCabinetryLow,
      totalCabinetryHigh,
      worktopCost: wtCost,
      fittingCost: Math.round((fittingLow + fittingHigh) / 2),
      deliveryCost: Math.round((deliveryLow + deliveryHigh) / 2),
      appliancesAllowance: inputs.appliancesAllowance,
      grandTotalLow,
      grandTotalHigh,
      shoppingListPreview,
      shoppingListFull,
      aiSummary,
      supplyMode: inputs.supplyMode,
      runLengthMetres: inputs.runLengthMetres,
    },
    _private: {
      materialCost: Math.round((materialLow + materialHigh) / 2),
      factoryLabour: Math.round((factoryLabourLow + factoryLabourHigh) / 2),
      fittingLabour: Math.round((fittingLow + fittingHigh) / 2),
      management: Math.round((managementLow + managementHigh) / 2),
      design: Math.round((designLow + designHigh) / 2),
      delivery: Math.round((deliveryLow + deliveryHigh) / 2),
      margin: Math.round((marginLow + marginHigh) / 2),
      subtotal: Math.round((subtotalLow + subtotalHigh) / 2),
      totalIncMargin: Math.round((totalCabinetryLow + totalCabinetryHigh) / 2),
    },
  };
}

function buildAISummary(
  inputs: KitchenInputs,
  totalLow: number,
  totalHigh: number,
  perLmLow: number,
  perLmHigh: number,
): string {
  const doorLabel = inputs.doorRange.replace(/_/g, " ");
  const carcassLabel = inputs.carcassFinish.replace(/_/g, " ");
  const mode = inputs.supplyMode === "supply_and_fit" ? "supply and fit" : "supply only";
  const wtLabel = inputs.worktopSpec === "none" ? "no worktop included" : inputs.worktopSpec.replace(/_/g, " ") + " worktop";

  return (
    `This is a guided estimate for a ${inputs.runLengthMetres.toFixed(1)}m kitchen run ` +
    `with ${carcassLabel} carcasses, ${doorLabel} doors, and ${wtLabel}. ` +
    `Based on the selected specification and unit mix, the estimated range is ` +
    `£${totalLow.toLocaleString()} – £${totalHigh.toLocaleString()} (${mode}). ` +
    `This works out to approximately £${perLmLow.toLocaleString()} – £${perLmHigh.toLocaleString()} per linear metre of cabinetry. ` +
    `Prices are based on real fitted furniture supply costs and are intended as a planning guide. ` +
    `For confirmed pricing, request a formal quote.`
  );
}
