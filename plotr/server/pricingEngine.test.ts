import { describe, it, expect } from "vitest";
import { calculateKitchenEstimate } from "./pricingEngine";

const BASE_INPUTS = {
  runLengthMetres: 4,
  baseUnits600: 4,
  baseUnits500: 0,
  baseUnits1000: 1,
  wallUnits600: 3,
  wallUnits500: 0,
  wallUnits1000: 1,
  tallUnits600: 1,
  tallUnits500: 0,
  drawerPacks: 2,
  carcassFinish: "white_mfc" as const,
  doorRange: "shaker_painted" as const,
  handleRange: "standard" as const,
  worktopSpec: "square_edge_25mm_600" as const,
  worktopRunMetres: 4,
  endPanels: 2,
  fillers: 2,
  plinthMetres: 4,
  corniceMetres: 0,
  splashbackSqm: 0,
  appliancesAllowance: 0,
  supplyMode: "supply_and_fit" as const,
};

describe("calculateKitchenEstimate", () => {
  it("returns a positive estimate range", () => {
    const result = calculateKitchenEstimate(BASE_INPUTS);
    expect(result.public.grandTotalLow).toBeGreaterThan(0);
    expect(result.public.grandTotalHigh).toBeGreaterThanOrEqual(result.public.grandTotalLow);
  });

  it("per-LM figure is positive and reasonable for 4m run", () => {
    const result = calculateKitchenEstimate(BASE_INPUTS);
    expect(result.public.perLinearMetreLow).toBeGreaterThan(500);
    expect(result.public.perLinearMetreHigh).toBeLessThan(10000);
  });

  it("supply_only has lower total than supply_and_fit", () => {
    const supplyOnly = calculateKitchenEstimate({ ...BASE_INPUTS, supplyMode: "supply_only" });
    const supplyFit = calculateKitchenEstimate({ ...BASE_INPUTS, supplyMode: "supply_and_fit" });
    expect(supplyOnly.public.grandTotalLow).toBeLessThan(supplyFit.public.grandTotalLow);
  });

  it("premium door range costs more than slab_mfc", () => {
    const slab = calculateKitchenEstimate({ ...BASE_INPUTS, doorRange: "slab_mfc" });
    const premium = calculateKitchenEstimate({ ...BASE_INPUTS, doorRange: "premium_lacquered" });
    expect(premium.public.grandTotalLow).toBeGreaterThan(slab.public.grandTotalLow);
  });

  it("private layers are never zero", () => {
    const result = calculateKitchenEstimate(BASE_INPUTS);
    expect(result._private.materialCost).toBeGreaterThan(0);
    expect(result._private.margin).toBeGreaterThan(0);
  });

  it("shopping list preview has no prices", () => {
    const result = calculateKitchenEstimate(BASE_INPUTS);
    for (const item of result.public.shoppingListPreview) {
      expect(item).not.toHaveProperty("price");
      expect(item).not.toHaveProperty("priceRangeLow");
    }
  });
});
