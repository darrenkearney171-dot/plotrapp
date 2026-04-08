import { and, desc, eq, like, or, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  affiliateClicks,
  fittedEstimates,
  guestLeads,
  quoteRequests,
  waitlistEmails,
  tradeApplications,
  InsertProject,
  InsertRoomAnalysis,
  InsertUser,
  materialsLists,
  projects,
  projectVisualisations,
  reviews,
  roomAnalyses,
  suppliers,
  tradespeople,
  users,
  type InsertGuestLead,
  type InsertMaterialsList,
  type InsertSupplier,
  type InsertTradesperson,
  type InsertTradeApplication,
  type InsertProjectVisualisation,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ─── Users ────────────────────────────────────────────────────────────────────

export async function upsertUser(user: InsertUser): Promise<{ isNew: boolean }> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return { isNew: false };
  // Check if user already exists before upserting
  const existing = await db.select({ id: users.id }).from(users).where(eq(users.openId, user.openId)).limit(1);
  const isNew = existing.length === 0;

  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};

  const textFields = ["name", "email", "loginMethod"] as const;
  for (const field of textFields) {
    const value = user[field];
    if (value === undefined) continue;
    const normalized = value ?? null;
    values[field] = normalized;
    updateSet[field] = normalized;
  }
  if (user.lastSignedIn !== undefined) {
    values.lastSignedIn = user.lastSignedIn;
    updateSet.lastSignedIn = user.lastSignedIn;
  }
  if (user.role !== undefined) {
    values.role = user.role;
    updateSet.role = user.role;
  } else if (user.openId === ENV.ownerOpenId) {
    values.role = "admin";
    updateSet.role = "admin";
  }
  if (!values.lastSignedIn) values.lastSignedIn = new Date();
  if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();

  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
  return { isNew };
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

export async function updateUserSubscription(
  userId: number,
  tier: "free" | "pro" | "trade",
  expiresAt?: Date
) {
  const db = await getDb();
  if (!db) return;
  await db
    .update(users)
    .set({ subscriptionTier: tier, subscriptionExpiresAt: expiresAt ?? null })
    .where(eq(users.id, userId));
}

export async function getAllUsers(limit = 100, offset = 0) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(users).orderBy(desc(users.createdAt)).limit(limit).offset(offset);
}

// ─── Projects ─────────────────────────────────────────────────────────────────

export async function createProject(data: InsertProject) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const [result] = await db.insert(projects).values(data);
  return result.insertId as number;
}

export async function getProjectsByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(projects).where(eq(projects.userId, userId)).orderBy(desc(projects.createdAt));
}

export async function getProjectById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(projects).where(eq(projects.id, id)).limit(1);
  return result[0];
}

export async function updateProject(id: number, data: Partial<InsertProject>) {
  const db = await getDb();
  if (!db) return;
  await db.update(projects).set(data).where(eq(projects.id, id));
}

export async function deleteProject(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(projects).where(eq(projects.id, id));
}

// ─── Room Analyses ────────────────────────────────────────────────────────────

export async function createRoomAnalysis(data: InsertRoomAnalysis) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const [result] = await db.insert(roomAnalyses).values(data);
  return result.insertId as number;
}

export async function getRoomAnalysesByProject(projectId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(roomAnalyses).where(eq(roomAnalyses.projectId, projectId)).orderBy(desc(roomAnalyses.createdAt));
}

export async function getRoomAnalysisById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(roomAnalyses).where(eq(roomAnalyses.id, id)).limit(1);
  return result[0];
}

export async function updateRoomAnalysis(id: number, data: Partial<InsertRoomAnalysis>) {
  const db = await getDb();
  if (!db) return;
  await db.update(roomAnalyses).set(data).where(eq(roomAnalyses.id, id));
}

// ─── Materials Lists ──────────────────────────────────────────────────────────

export async function createMaterialsList(data: InsertMaterialsList) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const [result] = await db.insert(materialsLists).values(data);
  return result.insertId as number;
}

export async function getMaterialsListsByProject(projectId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(materialsLists).where(eq(materialsLists.projectId, projectId)).orderBy(desc(materialsLists.createdAt));
}

export async function getMaterialsListById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(materialsLists).where(eq(materialsLists.id, id)).limit(1);
  return result[0];
}

export async function updateMaterialsList(id: number, data: Partial<InsertMaterialsList>) {
  const db = await getDb();
  if (!db) return;
  await db.update(materialsLists).set(data).where(eq(materialsLists.id, id));
}

// ─── Suppliers ────────────────────────────────────────────────────────────────

export async function getSuppliers(filters?: { category?: string; region?: string; isNational?: boolean }) {
  const db = await getDb();
  if (!db) return [];
  const conditions = [eq(suppliers.isActive, true)];
  if (filters?.category) conditions.push(eq(suppliers.category, filters.category as any));
  if (filters?.region) conditions.push(or(eq(suppliers.region, filters.region), eq(suppliers.isNational, true))!);
  if (filters?.isNational !== undefined) conditions.push(eq(suppliers.isNational, filters.isNational));
  return db.select().from(suppliers).where(and(...conditions)).orderBy(suppliers.name);
}

export async function getSupplierById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(suppliers).where(eq(suppliers.id, id)).limit(1);
  return result[0];
}

export async function createSupplier(data: InsertSupplier) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const [result] = await db.insert(suppliers).values(data);
  return result.insertId as number;
}

export async function updateSupplier(id: number, data: Partial<InsertSupplier>) {
  const db = await getDb();
  if (!db) return;
  await db.update(suppliers).set(data).where(eq(suppliers.id, id));
}

export async function deleteSupplier(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(suppliers).set({ isActive: false }).where(eq(suppliers.id, id));
}

export async function trackAffiliateClick(supplierId: number, userId?: number, projectId?: number) {
  const db = await getDb();
  if (!db) return;
  await db.insert(affiliateClicks).values({ supplierId, userId: userId ?? null, projectId: projectId ?? null });
}

// ─── Tradespeople ─────────────────────────────────────────────────────────────

export async function getTradespeople(filters?: { trade?: string; region?: string; isVerified?: boolean }) {
  const db = await getDb();
  if (!db) return [];
  const conditions = [eq(tradespeople.isActive, true)];
  if (filters?.trade) conditions.push(eq(tradespeople.trade, filters.trade as any));
  if (filters?.region) conditions.push(like(tradespeople.region, `%${filters.region}%`));
  if (filters?.isVerified !== undefined) conditions.push(eq(tradespeople.isVerified, filters.isVerified));
  return db.select().from(tradespeople).where(and(...conditions)).orderBy(desc(tradespeople.averageRating));
}

export async function getTradespersonById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(tradespeople).where(eq(tradespeople.id, id)).limit(1);
  return result[0];
}

export async function createTradesperson(data: InsertTradesperson) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const [result] = await db.insert(tradespeople).values(data);
  return result.insertId as number;
}

export async function updateTradesperson(id: number, data: Partial<InsertTradesperson>) {
  const db = await getDb();
  if (!db) return;
  await db.update(tradespeople).set(data).where(eq(tradespeople.id, id));
}

export async function getReviewsByTradesperson(tradespersonId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(reviews).where(eq(reviews.tradespersonId, tradespersonId)).orderBy(desc(reviews.createdAt));
}

export async function createReview(data: { tradespersonId: number; userId: number; projectId?: number; rating: number; comment?: string }) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.insert(reviews).values(data);
  // Recalculate average rating using SQL aggregates (no full table scan)
  const [stats] = await db
    .select({
      avg: sql<number>`AVG(${reviews.rating})`,
      count: sql<number>`COUNT(*)`,
    })
    .from(reviews)
    .where(eq(reviews.tradespersonId, data.tradespersonId));
  await db.update(tradespeople).set({
    averageRating: Number(stats?.avg ?? 0),
    reviewCount: Number(stats?.count ?? 0),
  }).where(eq(tradespeople.id, data.tradespersonId));
}

// ─── Guest Leads ─────────────────────────────────────────────────────────────

export async function createGuestLead(data: Omit<InsertGuestLead, "id" | "createdAt" | "convertedToUser" | "analysisResult" | "costRangeLow" | "costRangeHigh">) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const [result] = await db.insert(guestLeads).values(data as InsertGuestLead);
  return result.insertId as number;
}

export async function updateGuestLead(id: number, data: Partial<InsertGuestLead>) {
  const db = await getDb();
  if (!db) return;
  await db.update(guestLeads).set(data).where(eq(guestLeads.id, id));
}

export async function getGuestLeadById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(guestLeads).where(eq(guestLeads.id, id)).limit(1);
  return result[0];
}

export async function getAllGuestLeads(limit = 100) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(guestLeads).orderBy(desc(guestLeads.createdAt)).limit(limit);
}

// ─── Waitlist ────────────────────────────────────────────────────────────────

export async function joinWaitlist(
  email: string,
  source: string = "homepage",
  buttonLabel: string = "",
  tier: string = ""
) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  // Upsert — silently succeed if email already exists (update source/tier on re-submit)
  await db
    .insert(waitlistEmails)
    .values({ email: email.toLowerCase().trim(), source, buttonLabel, tier })
    .onDuplicateKeyUpdate({ set: { source, buttonLabel, tier } });
  return { success: true };
}

export async function getWaitlistEmails(limit = 1000) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(waitlistEmails).orderBy(desc(waitlistEmails.createdAt)).limit(limit);
}

// ─── Trade Applications

export async function createTradeApplication(data: InsertTradeApplication) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const [result] = await db.insert(tradeApplications).values(data);
  return result.insertId as number;
}

export async function getTradeApplications(limit = 200) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(tradeApplications).orderBy(desc(tradeApplications.createdAt)).limit(limit);
}

// ─── Project Visualisations ──────────────────────────────────────────────────


export const FREE_VISUALISATION_LIMIT = 3;

export async function getUserVisualisationStatus(userId: number) {
  const db = await getDb();
  if (!db) return { freeUsed: 0, tier: "free" as const };
  const [u] = await db.select({ freeVisualisationsUsed: users.freeVisualisationsUsed, subscriptionTier: users.subscriptionTier }).from(users).where(eq(users.id, userId)).limit(1);
  return {
    freeUsed: Number(u?.freeVisualisationsUsed ?? 0),
    tier: (u?.subscriptionTier ?? "free") as "free" | "pro" | "trade",
  };
}

export async function createVisualisation(data: InsertProjectVisualisation & { sourcePhotoUrl?: string | null }) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const [result] = await db.insert(projectVisualisations).values(data as InsertProjectVisualisation);
  // Increment free counter only for free users
  const [u] = await db.select({ tier: users.subscriptionTier }).from(users).where(eq(users.id, data.userId)).limit(1);
  if ((u?.tier ?? "free") === "free") {
    await db.update(users).set({ freeVisualisationsUsed: sql`freeVisualisationsUsed + 1` }).where(eq(users.id, data.userId));
  }
  return result.insertId as number;
}

export async function getVisualisationsByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(projectVisualisations).where(eq(projectVisualisations.userId, userId)).orderBy(desc(projectVisualisations.createdAt));
}

export async function deleteVisualisation(id: number, userId: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(projectVisualisations).where(and(eq(projectVisualisations.id, id), eq(projectVisualisations.userId, userId)));
}

// ─── Unified Email List────────────────────────────────────────────────────

export async function getEmailList(maxPerSource = 5000) {
  const db = await getDb();
  if (!db) return [];

  // Waitlist sign-ups (capped to prevent OOM)
  const waitlist = await db
    .select({ email: waitlistEmails.email, source: waitlistEmails.source, createdAt: waitlistEmails.createdAt })
    .from(waitlistEmails)
    .orderBy(desc(waitlistEmails.createdAt))
    .limit(maxPerSource);

  // Registered users with an email
  const registeredUsers = await db
    .select({ email: users.email, name: users.name, createdAt: users.lastSignedIn })
    .from(users)
    .where(sql`${users.email} IS NOT NULL AND ${users.email} != ''`)
    .limit(maxPerSource);

  // Trade applicants
  const tradeApplicants = await db
    .select({ email: tradeApplications.email, name: tradeApplications.fullName, trade: tradeApplications.trade, createdAt: tradeApplications.createdAt })
    .from(tradeApplications)
    .orderBy(desc(tradeApplications.createdAt))
    .limit(maxPerSource);

  type EmailEntry = {
    email: string;
    name: string | null;
    source: string;
    trade: string | null;
    joinedAt: Date | null;
  };

  const emailMap = new Map<string, EmailEntry>();

  // Add waitlist entries first
  for (const w of waitlist) {
    const key = w.email.toLowerCase();
    if (!emailMap.has(key)) {
      emailMap.set(key, { email: w.email, name: null, source: `Waitlist (${w.source})`, trade: null, joinedAt: w.createdAt });
    }
  }

  // Merge registered users (may overlap with waitlist)
  for (const u of registeredUsers) {
    if (!u.email) continue;
    const key = u.email.toLowerCase();
    if (emailMap.has(key)) {
      // Enrich existing entry with name and mark as registered
      const existing = emailMap.get(key)!;
      existing.name = existing.name ?? u.name ?? null;
      existing.source = existing.source.includes("Registered") ? existing.source : `${existing.source}, Registered`;
    } else {
      emailMap.set(key, { email: u.email, name: u.name ?? null, source: "Registered", trade: null, joinedAt: u.createdAt ?? null });
    }
  }

  // Merge trade applicants
  for (const t of tradeApplicants) {
    const key = t.email.toLowerCase();
    if (emailMap.has(key)) {
      const existing = emailMap.get(key)!;
      existing.name = existing.name ?? t.name ?? null;
      existing.trade = t.trade ?? null;
      existing.source = existing.source.includes("Trade") ? existing.source : `${existing.source}, Trade Applicant`;
    } else {
      emailMap.set(key, { email: t.email, name: t.name ?? null, source: "Trade Applicant", trade: t.trade ?? null, joinedAt: t.createdAt });
    }
  }

  return Array.from(emailMap.values()).sort((a, b) => {
    const aTime = a.joinedAt?.getTime() ?? 0;
    const bTime = b.joinedAt?.getTime() ?? 0;
    return bTime - aTime;
  });
}

export async function getAdminStats() {
  const db = await getDb();
  if (!db) return null;
  const [userCount] = await db.select({ count: sql<number>`count(*)` }).from(users);
  const [projectCount] = await db.select({ count: sql<number>`count(*)` }).from(projects);
  const [supplierCount] = await db.select({ count: sql<number>`count(*)` }).from(suppliers).where(eq(suppliers.isActive, true));
  const [tradespersonCount] = await db.select({ count: sql<number>`count(*)` }).from(tradespeople).where(eq(tradespeople.isActive, true));
  const [analysisCount] = await db.select({ count: sql<number>`count(*)` }).from(roomAnalyses);
  const [clickCount] = await db.select({ count: sql<number>`count(*)` }).from(affiliateClicks);
  const tierCounts = await db.select({ tier: users.subscriptionTier, count: sql<number>`count(*)` }).from(users).groupBy(users.subscriptionTier);
  return {
    users: Number(userCount?.count ?? 0),
    projects: Number(projectCount?.count ?? 0),
    suppliers: Number(supplierCount?.count ?? 0),
    tradespeople: Number(tradespersonCount?.count ?? 0),
    analyses: Number(analysisCount?.count ?? 0),
    affiliateClicks: Number(clickCount?.count ?? 0),
    tierCounts,
  };
}

// ─── Admin: Funnel Stats ────────────────────────────────────────────────────

export async function getAdminFunnelStats() {
  const db = await getDb();
  if (!db) return null;

  const [waitlistCount] = await db.select({ count: sql<number>`count(*)` }).from(waitlistEmails);
  const [leadCount] = await db.select({ count: sql<number>`count(*)` }).from(guestLeads);
  const [fittedCount] = await db.select({ count: sql<number>`count(*)` }).from(fittedEstimates);
  const [quoteCount] = await db.select({ count: sql<number>`count(*)` }).from(quoteRequests);
  const [userCount] = await db.select({ count: sql<number>`count(*)` }).from(users);
  const [tradeAppCount] = await db.select({ count: sql<number>`count(*)` }).from(tradeApplications);
  const [convertedCount] = await db.select({ count: sql<number>`count(*)` }).from(guestLeads).where(eq(guestLeads.convertedToUser, true));

  // Leads by type
  const leadsByType = await db
    .select({ estimateType: guestLeads.estimateType, count: sql<number>`count(*)` })
    .from(guestLeads)
    .groupBy(guestLeads.estimateType);

  // Quote requests by status
  const quotesByStatus = await db
    .select({ status: quoteRequests.status, count: sql<number>`count(*)` })
    .from(quoteRequests)
    .groupBy(quoteRequests.status);

  // Last 7 days counts
  const sevenDaysAgo = sql`DATE_SUB(NOW(), INTERVAL 7 DAY)`;
  const [recentWaitlist] = await db.select({ count: sql<number>`count(*)` }).from(waitlistEmails).where(sql`${waitlistEmails.createdAt} >= ${sevenDaysAgo}`);
  const [recentLeads] = await db.select({ count: sql<number>`count(*)` }).from(guestLeads).where(sql`${guestLeads.createdAt} >= ${sevenDaysAgo}`);
  const [recentUsers] = await db.select({ count: sql<number>`count(*)` }).from(users).where(sql`${users.createdAt} >= ${sevenDaysAgo}`);
  const [recentQuotes] = await db.select({ count: sql<number>`count(*)` }).from(quoteRequests).where(sql`${quoteRequests.createdAt} >= ${sevenDaysAgo}`);

  return {
    waitlist: Number(waitlistCount?.count ?? 0),
    leads: Number(leadCount?.count ?? 0),
    fittedEstimates: Number(fittedCount?.count ?? 0),
    quoteRequests: Number(quoteCount?.count ?? 0),
    registeredUsers: Number(userCount?.count ?? 0),
    tradeApplications: Number(tradeAppCount?.count ?? 0),
    convertedLeads: Number(convertedCount?.count ?? 0),
    leadsByType,
    quotesByStatus,
    last7Days: {
      waitlist: Number(recentWaitlist?.count ?? 0),
      leads: Number(recentLeads?.count ?? 0),
      users: Number(recentUsers?.count ?? 0),
      quotes: Number(recentQuotes?.count ?? 0),
    },
  };
}

// ─── Admin: Guest Leads List ────────────────────────────────────────────────

export async function getAdminLeads(limit = 100) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select({
      id: guestLeads.id,
      email: guestLeads.email,
      firstName: guestLeads.firstName,
      userType: guestLeads.userType,
      projectType: guestLeads.projectType,
      estimateType: guestLeads.estimateType,
      costRangeLow: guestLeads.costRangeLow,
      costRangeHigh: guestLeads.costRangeHigh,
      convertedToUser: guestLeads.convertedToUser,
      createdAt: guestLeads.createdAt,
    })
    .from(guestLeads)
    .orderBy(desc(guestLeads.createdAt))
    .limit(limit);
}

// ─── Admin: Fitted Estimates List ───────────────────────────────────────────

export async function getAdminFittedEstimates(limit = 100) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select({
      id: fittedEstimates.id,
      userId: fittedEstimates.userId,
      guestEmail: fittedEstimates.guestEmail,
      userType: fittedEstimates.userType,
      category: fittedEstimates.category,
      supplyMode: fittedEstimates.supplyMode,
      estimateRangeLow: fittedEstimates.estimateRangeLow,
      estimateRangeHigh: fittedEstimates.estimateRangeHigh,
      grandTotalLow: fittedEstimates.grandTotalLow,
      grandTotalHigh: fittedEstimates.grandTotalHigh,
      createdAt: fittedEstimates.createdAt,
    })
    .from(fittedEstimates)
    .orderBy(desc(fittedEstimates.createdAt))
    .limit(limit);
}

// ─── Admin: Quote Requests List ─────────────────────────────────────────────

export async function getAdminQuoteRequests(limit = 100) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(quoteRequests)
    .orderBy(desc(quoteRequests.createdAt))
    .limit(limit);
}

// ─── Admin: Update Quote Request Status ─────────────────────────────────────

export async function updateQuoteRequestStatus(id: number, status: string) {
  const db = await getDb();
  if (!db) return null;
  await db.update(quoteRequests).set({ status }).where(eq(quoteRequests.id, id));
  return { id, status };
}

// ─── Admin: Recent Activity ─────────────────────────────────────────────────

export async function getAdminRecentActivity(limit = 30) {
  const db = await getDb();
  if (!db) return [];

  // Pull recent items from each table and merge them into a timeline
  const [recentLeads, recentWaitlist, recentUsers, recentTradeApps, recentQuotes, recentFitted] = await Promise.all([
    db.select({ id: guestLeads.id, email: guestLeads.email, type: sql<string>`'lead'`, detail: guestLeads.estimateType, createdAt: guestLeads.createdAt }).from(guestLeads).orderBy(desc(guestLeads.createdAt)).limit(limit),
    db.select({ id: waitlistEmails.id, email: waitlistEmails.email, type: sql<string>`'waitlist'`, detail: waitlistEmails.source, createdAt: waitlistEmails.createdAt }).from(waitlistEmails).orderBy(desc(waitlistEmails.createdAt)).limit(limit),
    db.select({ id: users.id, email: users.email, type: sql<string>`'signup'`, detail: users.subscriptionTier, createdAt: users.createdAt }).from(users).orderBy(desc(users.createdAt)).limit(limit),
    db.select({ id: tradeApplications.id, email: tradeApplications.email, type: sql<string>`'trade_app'`, detail: tradeApplications.trade, createdAt: tradeApplications.createdAt }).from(tradeApplications).orderBy(desc(tradeApplications.createdAt)).limit(limit),
    db.select({ id: quoteRequests.id, email: quoteRequests.email, type: sql<string>`'quote'`, detail: quoteRequests.category, createdAt: quoteRequests.createdAt }).from(quoteRequests).orderBy(desc(quoteRequests.createdAt)).limit(limit),
    db.select({ id: fittedEstimates.id, email: fittedEstimates.guestEmail, type: sql<string>`'fitted'`, detail: fittedEstimates.category, createdAt: fittedEstimates.createdAt }).from(fittedEstimates).orderBy(desc(fittedEstimates.createdAt)).limit(limit),
  ]);

  const all = [...recentLeads, ...recentWaitlist, ...recentUsers, ...recentTradeApps, ...recentQuotes, ...recentFitted];
  all.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return all.slice(0, limit);
}
