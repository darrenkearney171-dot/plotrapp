import { and, desc, eq, like, or, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  affiliateClicks,
  fittedEstimates,
  guestLeads,
  introductionRequests,
  projectTemplates,
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
  type InsertIntroductionRequest,
  type InsertProjectTemplate,
  type InsertMaterialsList,
  type InsertSupplier,
  type InsertTradesperson,
  type InsertTradeApplication,
  type InsertProjectVisualisation,
  type InsertRoomAnalysis,
  type InsertQuoteRequest,
  type InsertAffiliateClick,
  type InsertAffiliateReferral
} from './schema';

/* ***************** DB CONNTECTED RRSA PRIVATE REP*********** See file space for Constants */
