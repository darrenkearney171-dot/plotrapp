/**
 * Fitted Furniture Router â Renolab
 *
 * Procedures:
 *   fitted.calculateKitchen  â runs private pricing engine, returns plan-gated output
 *   fitted.requestQuote      â saves formal quote request, notifies owner
 *   fitted.getEstimate       â fetch a saved estimate by id (for result page)
 *   fitted.listQuotes        â admin: list all quote requests
 */

import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { calculateKitchenEstimate } from "../pricingEngine";
import type { KitchenInputs } from "../pricingEngine";
import { notifyOwner } from "../_core/notification";
import { sendOwnerEmail, sendQuoteConfirmationEmail } from "../email";
import { getDb, joinWaitlist } from "../db";
import { fittedEstimates, quoteRequests } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

// âââ Input schemas ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ

const kitchenInputSchema = z.object({
  // User context
  userType: z.enum(["homeowner", "trade"]),
  guestEmail: z.string().email().optional(),

  // Kitchen dimensions
  runLengthMetres: z.number().min(0.5).max(30),

  // Unit counts
  baseUnits600: z.number().int().min(0).max(50),
  baseUnits500: z.number().int().min(0).max(50),
  baseUnits1000: z.number().int().min(0).max(50),
  wallUnits600: z.number().int().min(0).max(50),
  wallUnits500: z.number().int().min(0).max(50),
  wallUnits1000: z.number().int().min(0).max(50),
  tallUnits600: z.number().int().min(0).max(20),
  tallUnits500: z.number().int().min(0).max(20),
  drawerPacks: z.number().int().min(0).max(20),

  // Spec
  carcassFinish: z.enum(["white_mfc", "premium_egger", "feelwood"]),
  doorRange: z.enum(["slab_mfc", "shaker_painted", "handleless_j_pull", "premium_lacquered"]),
  handleRange: z.enum(["standard", "premium", "none"]),
  worktopSpec: z.enum(["postform_38mm_600", "square_edge_25mm_600", "bullnose_38mm_900", "square_edge_25mm_900", "quartz", "none"]),
  worktopRunMetres: z.number().min(0).max(30),

  // Extras
  endPanels: z.number().int().min(0).max(10),
  fillers: z.number().int().min(0).max(20),
  plinthMetres: z.number().min(0).max(30),
  corniceMetres: z.number().min(0).max(30),
  splashbackSqm: z.number().min(0).max(20),
  appliancesAllowance: z.number().min(0).max(50000),

  // Supply mode
  supplyMode: z.enum(["supply_only", "supply_and_fit"]),
});

const quoteRequestSchema = z.object({
  fittedEstimateId: z.number().int().optional(),
  name: z.string().min(2).max(256),
  email: z.string().email(),
  phone: z.string().max(64).optional(),
  userType: z.enum(["homeowner", "trade"]),
  category: z.enum(["kitchen", "bedroom", "bathroom", "home_office", "utility", "other"]),
  supplyMode: z.enum(["supply_only", "supply_and_fit"]),
  projectSummary: z.string().max(2000).optional(),
  estimateRangeLow: z.number().min(0).optional(),
  estimateRangeHigh: z.number().min(0).optional(),
  dimensionsSummary: z.string().max(500).optional(),
  specSummary: z.string().max(500).optional(),
  photoUrls: z.string().max(2000).optional(),
  notes: z.string().max(2000).optional(),
});

// âââ Router âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ

export const fittedRouter = router({
  /**
   * Calculate a kitchen estimate.
   * Returns plan-gated output:
   *   - free / guest: range + short preview list + AI summary
   *   - pro: full shopping list with indicative price ranges
   *   - trade: blended per-LM figure + total cabinetry + optional extras (no line-by-line)
   */
  calculateKitchen: publicProcedure
    .input(kitchenInputSchema)
    .mutation(async ({ input, ctx }) => {
      const engineInputs: KitchenInputs = {
        runLengthMetres: input.runLengthMetres,
        baseUnits600: input.baseUnits600,
        baseUnits500: input.baseUnits500,
        baseUnits1000: input.baseUnits1000,
        wallUnits600: input.wallUnits600,
        wallUnits500: input.wallUnits500,
        wallUnits1000: input.wallUnits1000,
        tallUnits600: input.tallUnits600,
        tallUnits500: input.tallUnits500,
        drawerPacks: input.drawerPacks,
        carcassFinish: input.carcassFinish,
        doorRange: input.doorRange,
        handleRange: input.handleRange,
        worktopSpec: input.worktopSpec,
        worktopRunMetres: input.worktopRunMetres,
        endPanels: input.endPanels,
        fillers: input.fillers,
        plinthMetres: input.plinthMetres,
        corniceMetres: input.corniceMetres,
        splashbackSqm: input.splashbackSqm,
        appliancesAllowance: input.appliancesAllowance,
        supplyMode: input.supplyMode,
      };

      // Run private engine â _private layer never leaves this function
      const result = calculateKitchenEstimate(engineInputs);
      const pub = result.public;

      // Determine subscription tier
      const tier = (ctx as any)?.user?.subscriptionTier ?? "free";
      const isTrade = input.userType === "trade" && (tier === "trade");
      const isPro = tier === "pro" || tier === "trade";

      // Capture guest email into waitlist/leads table (fire-and-forget, never block the estimate)
      if (input.guestEmail) {
        joinWaitlist(
          input.guestEmail,
          "kitchen_estimator",
          `Kitchen Estimator â ${input.userType} â ${input.supplyMode.replace(/_/g, " ")}`,
          input.userType === "trade" ? "trade" : ""
        ).catch(() => {}); // silently swallow errors
      } else if ((ctx as any)?.user?.email) {
        // Logged-in user â capture their email too if not already in waitlist
        joinWaitlist(
          (ctx as any).user.email,
          "kitchen_estimator",
          `Kitchen Estimator â ${input.userType} â ${input.supplyMode.replace(/_/g, " ")}`,
          input.userType === "trade" ? "trade" : ""
        ).catch(() => {});
      }

      // Save to DB
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      const [saved] = await db.insert(fittedEstimates).values({
        userId: (ctx as any)?.user?.id ?? null,
        guestEmail: input.guestEmail ?? null,
        userType: input.userType,
        category: "kitchen",
        supplyMode: input.supplyMode,
        inputsJson: JSON.stringify(engineInputs), // private â never returned to client
        estimateRangeLow: pub.estimateRangeLow,
        estimateRangeHigh: pub.estimateRangeHigh,
        grandTotalLow: pub.grandTotalLow,
        grandTotalHigh: pub.grandTotalHigh,
        perLinearMetreLow: pub.perLinearMetreLow,
        perLinearMetreHigh: pub.perLinearMetreHigh,
        runLengthMetres: Math.round(pub.runLengthMetres),
        aiSummary: pub.aiSummary,
      });

      const estimateId = (saved as any).insertId as number;

      // ââ Build plan-gated response ââââââââââââââââââââââââââââââââââââââââââ
      // FREE / GUEST
      if (!isPro) {
        return {
          estimateId,
          tier: "free" as const,
          estimateRangeLow: pub.estimateRangeLow,
          estimateRangeHigh: pub.estimateRangeHigh,
          grandTotalLow: pub.grandTotalLow,
          grandTotalHigh: pub.grandTotalHigh,
          aiSummary: pub.aiSummary,
          supplyMode: pub.supplyMode,
          runLengthMetres: pub.runLengthMetres,
          // Preview: item names + quantities only, no prices
          shoppingListPreview: pub.shoppingListPreview,
          // Extras status
          worktopIncluded: pub.worktopCost > 0,
          fittingIncluded: pub.supplyMode === "supply_and_fit",
          deliveryIncluded: true,
          appliancesAllowance: pub.appliancesAllowance,
        };
      }

      // TRADE
      if (isTrade) {
        return {
          estimateId,
          tier: "trade" as const,
          // Blended per-LM â the key trade output
          perLinearMetreLow: pub.perLinearMetreLow,
          perLinearMetreHigh: pub.perLinearMetreHigh,
          totalCabinetryLow: pub.totalCabinetryLow,
          totalCabinetryHigh: pub.totalCabinetryHigh,
          grandTotalLow: pub.grandTotalLow,
          grandTotalHigh: pub.grandTotalHigh,
          runLengthMetres: pub.runLengthMetres,
          // Optional extras separated out â no line-by-line cabinetry breakdown
          worktopCost: pub.worktopCost,
          fittingCost: pub.fittingCost,
          deliveryCost: pub.deliveryCost,
          appliancesAllowance: pub.appliancesAllowance,
          worktopIncluded: pub.worktopCost > 0,
          fittingIncluded: pub.supplyMode === "supply_and_fit",
          supplyMode: pub.supplyMode,
          aiSummary: pub.aiSummary,
        };
      }

      // PRO
      return {
        estimateId,
        tier: "pro" as const,
        estimateRangeLow: pub.estimateRangeLow,
        estimateRangeHigh: pub.estimateRangeHigh,
        grandTotalLow: pub.grandTotalLow,
        grandTotalHigh: pub.grandTotalHigh,
        worktopCost: pub.worktopCost,
        fittingCost: pub.fittingCost,
        deliveryCost: pub.deliveryCost,
        appliancesAllowance: pub.appliancesAllowance,
        worktopIncluded: pub.worktopCost > 0,
        fittingIncluded: pub.supplyMode === "supply_and_fit",
        supplyMode: pub.supplyMode,
        runLengthMetres: pub.runLengthMetres,
        aiSummary: pub.aiSummary,
        // Full shopping list with indicative price ranges
        shoppingListFull: pub.shoppingListFull,
      };
    }),

  /**
   * Fetch a saved estimate by id (for result page reload / sharing)
   * Returns only the public-safe fields stored in DB.
   */
  getEstimate: publicProcedure
    .input(z.object({ id: z.number().int() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      const [estimate] = await db
        .select({
          id: fittedEstimates.id,
          userType: fittedEstimates.userType,
          category: fittedEstimates.category,
          supplyMode: fittedEstimates.supplyMode,
          estimateRangeLow: fittedEstimates.estimateRangeLow,
          estimateRangeHigh: fittedEstimates.estimateRangeHigh,
          grandTotalLow: fittedEstimates.grandTotalLow,
          grandTotalHigh: fittedEstimates.grandTotalHigh,
          perLinearMetreLow: fittedEstimates.perLinearMetreLow,
          perLinearMetreHigh: fittedEstimates.perLinearMetreHigh,
          runLengthMetres: fittedEstimates.runLengthMetres,
          aiSummary: fittedEstimates.aiSummary,
          createdAt: fittedEstimates.createdAt,
          // inputsJson is intentionally excluded â private
        })
        .from(fittedEstimates)
        .where(eq(fittedEstimates.id, input.id))
        .limit(1);

      if (!estimate) throw new TRPCError({ code: "NOT_FOUND" });
      return estimate;
    }),

  /**
   * Submit a formal quote request.
   * Notifies owner via Manus notification + email.
   */
  requestQuote: publicProcedure
    .input(quoteRequestSchema)
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      const [saved] = await db.insert(quoteRequests).values({
        fittedEstimateId: input.fittedEstimateId ?? null,
        userId: (ctx as any)?.user?.id ?? null,
        name: input.name,
        email: input.email,
        phone: input.phone ?? null,
        userType: input.userType,
        category: input.category,
        supplyMode: input.supplyMode,
        projectSummary: input.projectSummary ?? null,
        estimateRangeLow: input.estimateRangeLow ?? null,
        estimateRangeHigh: input.estimateRangeHigh ?? null,
        dimensionsSummary: input.dimensionsSummary ?? null,
        specSummary: input.specSummary ?? null,
        photoUrls: input.photoUrls ?? null,
        notes: input.notes ?? null,
        status: "new",
      });

      const quoteId = (saved as any).insertId as number;

      // Notify owner
      const title = `New formal quote request â ${input.category} (${input.userType})`;
      const content = [
        `Name: ${input.name}`,
        `Email: ${input.email}`,
        `Phone: ${input.phone ?? "not provided"}`,
        `User type: ${input.userType}`,
        `Category: ${input.category}`,
        `Supply mode: ${input.supplyMode}`,
        `Estimate range: Â£${input.estimateRangeLow?.toLocaleString() ?? "?"} â Â£${input.estimateRangeHigh?.toLocaleString() ?? "?"}`,
        `Dimensions: ${input.dimensionsSummary ?? "not provided"}`,
        `Spec: ${input.specSummary ?? "not provided"}`,
        `Notes: ${input.notes ?? "none"}`,
      ].join("\n");

      notifyOwner({ title, content }).catch(() => {});
      sendOwnerEmail(title, content).catch(() => {});

      // Send confirmation email to the person who requested the quote
      const estimateRange = input.estimateRangeLow != null && input.estimateRangeHigh != null
        ? `Â£${input.estimateRangeLow.toLocaleString()} â Â£${input.estimateRangeHigh.toLocaleString()}`
        : undefined;
      sendQuoteConfirmationEmail(input.email, input.name, input.category, estimateRange).catch(() => {});

      return { quoteId, success: true };
    }),

  /**
   * Admin: list all quote requests
   */
  listQuotes: protectedProcedure
    .use(({ ctx, next }) => {
      if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
      return next({ ctx });
    })
    .query(async () => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      return db
        .select()
        .from(quoteRequests)
        .orderBy(quoteRequests.createdAt);
    }),
});
