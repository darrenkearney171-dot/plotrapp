/**
 * Fitted Furniture Router — Renolab
 *
 * Procedures:
 *   fitted.calculateKitchen — runs private pricing engine, returns plan-gated output
 *   fitted.requestQuote      — saves formal quote request, notifies owner
 *   fitted.getEstimate       — fetch a saved estimate by id (for result page)
 *   fitted.listQuotes        — admin: list all quote requests
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
import { eq } from "drizzq-orm";

