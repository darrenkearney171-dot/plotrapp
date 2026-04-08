import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  float,
  boolean,
  json,
} from "drizzle-orm/mysql-core";

// ─── Users ───────────────────────────────────────────────────────────────────

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  subscriptionTier: mysqlEnum("subscriptionTier", ["free", "pro", "trade"]).default("free").notNull(),
  subscriptionExpiresAt: timestamp("subscriptionExpiresAt"),
  stripeCustomerId: varchar("stripeCustomerId", { length: 255 }),
  stripeSubscriptionId: varchar("stripeSubscriptionId", { length: 255 }),
  freeVisualisationsUsed: int("freeVisualisationsUsed").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ─── Projects ─────────────────────────────────────────────────────────────────

export const projects = mysqlTable("projects", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  status: mysqlEnum("status", ["planning", "in_progress", "completed"]).default("planning").notNull(),
  propertyAddress: text("propertyAddress"),
  totalEstimatedCost: float("totalEstimatedCost"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Project = typeof projects.$inferSelect;
export type InsertProject = typeof projects.$inferInsert;

// ─── Room Analyses ────────────────────────────────────────────────────────────

export const roomAnalyses = mysqlTable("room_analyses", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(),
  userId: int("userId").notNull(),
  roomName: varchar("roomName", { length: 255 }),
  photoUrl: text("photoUrl").notNull(),
  photoKey: text("photoKey").notNull(),
  status: mysqlEnum("status", ["processing", "completed", "failed"]).default("processing").notNull(),
  // AI-extracted data stored as JSON
  dimensions: json("dimensions"), // { width, length, height, area, perimeter }
  renovationScope: json("renovationScope"), // { roomType, condition, identifiedFeatures[] }
  styleRecommendations: json("styleRecommendations"), // { palette, finishes[], keyMaterials[], designNotes }
  aiSummary: text("aiSummary"),
  stylePrompt: text("stylePrompt"),
  referenceImageUrls: json("referenceImageUrls"), // string[]
  renderUrl: text("renderUrl"),
  renderStatus: mysqlEnum("renderStatus", ["none", "generating", "completed", "failed"]).default("none").notNull(),
  renderPrompt: text("renderPrompt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type RoomAnalysis = typeof roomAnalyses.$inferSelect;
export type InsertRoomAnalysis = typeof roomAnalyses.$inferInsert;

// ─── Materials Lists ──────────────────────────────────────────────────────────

export const materialsLists = mysqlTable("materials_lists", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(),
  roomAnalysisId: int("roomAnalysisId"),
  userId: int("userId").notNull(),
  title: varchar("title", { length: 255 }),
  items: json("items").notNull(), // MaterialItem[]
  totalTradePrice: float("totalTradePrice"),
  totalRetailPrice: float("totalRetailPrice"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type MaterialsList = typeof materialsLists.$inferSelect;
export type InsertMaterialsList = typeof materialsLists.$inferInsert;

// ─── Suppliers ────────────────────────────────────────────────────────────────

export const suppliers = mysqlTable("suppliers", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  category: mysqlEnum("category", [
    "timber_merchants",
    "builders_merchants",
    "paint_decorating",
    "roofing_insulation",
    "flooring",
    "kitchen_bathroom",
    "electrical_plumbing",
    "windows_doors",
    "general",
  ]).notNull(),
  region: varchar("region", { length: 100 }),
  isNational: boolean("isNational").default(false).notNull(),
  websiteUrl: text("websiteUrl"),
  affiliateUrl: text("affiliateUrl"),
  commissionRate: float("commissionRate").default(0.03), // e.g. 0.03 = 3%
  logoUrl: text("logoUrl"),
  phone: varchar("phone", { length: 30 }),
  email: varchar("email", { length: 320 }),
  address: text("address"),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Supplier = typeof suppliers.$inferSelect;
export type InsertSupplier = typeof suppliers.$inferInsert;

// ─── Affiliate Clicks ─────────────────────────────────────────────────────────

export const affiliateClicks = mysqlTable("affiliate_clicks", {
  id: int("id").autoincrement().primaryKey(),
  supplierId: int("supplierId").notNull(),
  userId: int("userId"),
  projectId: int("projectId"),
  clickedAt: timestamp("clickedAt").defaultNow().notNull(),
});

export type AffiliateClick = typeof affiliateClicks.$inferSelect;

// ─── Tradespeople ─────────────────────────────────────────────────────────────

export const tradespeople = mysqlTable("tradespeople", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  trade: mysqlEnum("trade", [
    "joiner_carpenter",
    "plumber",
    "electrician",
    "plasterer",
    "painter_decorator",
    "roofer",
    "tiler",
    "builder_general",
    "kitchen_fitter",
    "bathroom_fitter",
    "landscaper",
    "other",
  ]).notNull(),
  bio: text("bio"),
  region: varchar("region", { length: 100 }).notNull(),
  phone: varchar("phone", { length: 30 }),
  email: varchar("email", { length: 320 }),
  websiteUrl: text("websiteUrl"),
  profilePhotoUrl: text("profilePhotoUrl"),
  isVerified: boolean("isVerified").default(false).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  averageRating: float("averageRating").default(0),
  reviewCount: int("reviewCount").default(0),
  yearsExperience: int("yearsExperience"),
  qualifications: text("qualifications"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Tradesperson = typeof tradespeople.$inferSelect;
export type InsertTradesperson = typeof tradespeople.$inferInsert;

// ─── Reviews ──────────────────────────────────────────────────────────────────

export const reviews = mysqlTable("reviews", {
  id: int("id").autoincrement().primaryKey(),
  tradespersonId: int("tradespersonId").notNull(),
  userId: int("userId").notNull(),
  projectId: int("projectId"),
  rating: int("rating").notNull(), // 1–5
  comment: text("comment"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Review = typeof reviews.$inferSelect;
export type InsertReview = typeof reviews.$inferInsert;

// ─── Guest Leads ─────────────────────────────────────────────────────────────────────────────

// Email captured before showing free estimate result (no account required)
export const guestLeads = mysqlTable("guest_leads", {
  id: int("id").autoincrement().primaryKey(),
  email: varchar("email", { length: 320 }).notNull(),
  firstName: varchar("firstName", { length: 128 }),
  userType: varchar("userType", { length: 32 }).notNull().default("homeowner"), // homeowner | tradesperson
  projectType: varchar("projectType", { length: 128 }),
  photoUrl: text("photoUrl"),
  dimensions: json("dimensions"), // { width, length, height }
  stylePrompt: text("stylePrompt"),
  guidedAnswers: json("guidedAnswers"), // key/value answers from wizard
  analysisResult: json("analysisResult"), // full AI output stored server-side
  estimateType: varchar("estimateType", { length: 32 }).default("renovation").notNull(), // renovation | new_build
  rooms: json("rooms"), // new_build only: [{ type, label, width, length, height, finishLevel }]
  costRangeLow: int("costRangeLow"),
  costRangeHigh: int("costRangeHigh"),
  convertedToUser: boolean("convertedToUser").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type GuestLead = typeof guestLeads.$inferSelect;
export type InsertGuestLead = typeof guestLeads.$inferInsert;

// ─── Trade Applications ─────────────────────────────────────────────────────

export const tradeApplications = mysqlTable("trade_applications", {
  id: int("id").autoincrement().primaryKey(),
  fullName: varchar("fullName", { length: 255 }).notNull(),
  trade: varchar("trade", { length: 255 }).notNull(),
  town: varchar("town", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 50 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type TradeApplication = typeof tradeApplications.$inferSelect;
export type InsertTradeApplication = typeof tradeApplications.$inferInsert;

// ─── Waitlist Emails ─────────────────────────────────────────────────────────

export const waitlistEmails = mysqlTable("waitlist_emails", {
  id: int("id").autoincrement().primaryKey(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  source: varchar("source", { length: 64 }).default("homepage").notNull(), // homepage | pricing | suppliers | estimate | bar | nav | new_build | tradespeople
  buttonLabel: varchar("buttonLabel", { length: 128 }).default("").notNull(), // which button/form was used
  tier: varchar("tier", { length: 32 }).default("").notNull(), // free | pro | trade | (empty = unknown)
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type WaitlistEmail = typeof waitlistEmails.$inferSelect;
export type InsertWaitlistEmail = typeof waitlistEmails.$inferInsert;

// ─── Project Visualisations ──────────────────────────────────────────────────

export const projectVisualisations = mysqlTable("project_visualisations", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  leadId: int("leadId"), // optional link to guest lead / estimate
  imageUrl: text("imageUrl").notNull(),
  roomType: varchar("roomType", { length: 128 }),
  promptUsed: text("promptUsed"),
  projectType: varchar("projectType", { length: 128 }),
  sourcePhotoUrl: text("sourcePhotoUrl"), // the original room photo used as base for the render
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ProjectVisualisation = typeof projectVisualisations.$inferSelect;
export type InsertProjectVisualisation = typeof projectVisualisations.$inferInsert;

// ─── Fitted Furniture Estimates ───────────────────────────────────────────────
export const fittedEstimates = mysqlTable("fitted_estimates", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"),
  guestEmail: varchar("guestEmail", { length: 320 }),
  userType: varchar("userType", { length: 32 }).notNull(),
  category: varchar("category", { length: 32 }).notNull(),
  supplyMode: varchar("supplyMode", { length: 32 }).notNull(),
  inputsJson: text("inputsJson").notNull(),
  estimateRangeLow: int("estimateRangeLow").notNull(),
  estimateRangeHigh: int("estimateRangeHigh").notNull(),
  grandTotalLow: int("grandTotalLow").notNull(),
  grandTotalHigh: int("grandTotalHigh").notNull(),
  perLinearMetreLow: int("perLinearMetreLow"),
  perLinearMetreHigh: int("perLinearMetreHigh"),
  runLengthMetres: int("runLengthMetres"),
  aiSummary: text("aiSummary"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type FittedEstimate = typeof fittedEstimates.$inferSelect;
export type InsertFittedEstimate = typeof fittedEstimates.$inferInsert;

// ─── Quote Requests ───────────────────────────────────────────────────────────
export const quoteRequests = mysqlTable("quote_requests", {
  id: int("id").autoincrement().primaryKey(),
  fittedEstimateId: int("fittedEstimateId"),
  userId: int("userId"),
  name: varchar("name", { length: 256 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  phone: varchar("phone", { length: 64 }),
  userType: varchar("userType", { length: 32 }).notNull(),
  category: varchar("category", { length: 32 }).notNull(),
  supplyMode: varchar("supplyMode", { length: 32 }).notNull(),
  projectSummary: text("projectSummary"),
  estimateRangeLow: int("estimateRangeLow"),
  estimateRangeHigh: int("estimateRangeHigh"),
  dimensionsSummary: text("dimensionsSummary"),
  specSummary: text("specSummary"),
  photoUrls: text("photoUrls"),
  notes: text("notes"),
  status: varchar("status", { length: 32 }).default("new").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type QuoteRequest = typeof quoteRequests.$inferSelect;
export type InsertQuoteRequest = typeof quoteRequests.$inferInsert;
