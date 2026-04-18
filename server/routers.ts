import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { invokeLLM } from "./_core/llm";
import { generateImage } from "./_core/imageGeneration";
import { notifyOwner } from "./_core/notification";
import { sendOwnerEmail, sendUserConfirmationEmail, sendEstimateFollowUpEmail, sendTradeApplicationConfirmationEmail, sendAbandonedEstimateEmail } from "./email";
import { fittedRouter } from "./routers/fitted";
import { storagePut } from "./storage";
import {
  createProject,
  createRoomAnalysis,
  createMaterialsList,
  createSupplier,
  createTradesperson,
  createReview,
  deleteProject,
  deleteSupplier,
  getAdminStats,
  getAllUsers,
  getMaterialsListsByProject,
  getMaterialsListById,
  getProjectById,
  getProjectsByUser,
  getReviewsByTradesperson,
  getRoomAnalysesByProject,
  getRoomAnalysisById,
  getSupplierById,
  getSuppliers,
  getTradespersonById,
  getTradespeople,
  trackAffiliateClick,
  updateMaterialsList,
  updateProject,
  updateRoomAnalysis,
  updateSupplier,
  updateTradesperson,
  updateUserSubscription,
  createGuestLead,
  getGuestLeadById,
  joinWaitlist,
  getWaitlistEmails,
  getEmailList,
  createTradeApplication,
  getTradeApplications,
  createVisualisation,
  getVisualisationsByUser,
  deleteVisualisation,
  getUserVisualisationStatus,
  FREE_VISUALISATION_LIMIT,
  getAdminFunnelStats,
  getAdminLeads,
  getAdminFittedEstimates,
  getAdminQuoteRequests,
  updateQuoteRequestStatus,
  getAdminRecentActivity,
  createIntroductionRequest,
  getAdminIntroductionRequests,
  createProjectTemplate,
  getProjectTemplatesByUser,
  deleteProjectTemplate,
} from "./db";

// Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂ Helpers Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂ

function requireOwnership(resourceUserId: number, ctxUserId: number) {
  if (resourceUserId !== ctxUserId) {
    throw new TRPCError({ code: "FORBIDDEN", message: "Access denied" });
  }
}

function adminProcedure() {
  return protectedProcedure.use(({ ctx, next }) => {
    if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
    return next({ ctx });
  });
}

// Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂ App Router Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂ

export const appRouter = router({
  system: systemRouter,
  fitted: fittedRouter,

  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂ Projects Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂ
  projects: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return getProjectsByUser(ctx.user.id);
    }),

    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        const project = await getProjectById(input.id);
        if (!project) throw new TRPCError({ code: "NOT_FOUND" });
        requireOwnership(project.userId, ctx.user.id);
        return project;
      }),

    create: protectedProcedure
      .input(z.object({
        title: z.string().min(1).max(255),
        description: z.string().optional(),
        propertyAddress: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const id = await createProject({ ...input, userId: ctx.user.id });
        return { id };
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().min(1).max(255).optional(),
        description: z.string().optional(),
        propertyAddress: z.string().optional(),
        status: z.enum(["planning", "in_progress", "completed"]).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { id, ...data } = input;
        const project = await getProjectById(id);
        if (!project) throw new TRPCError({ code: "NOT_FOUND" });
        requireOwnership(project.userId, ctx.user.id);
        await updateProject(id, data);
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const project = await getProjectById(input.id);
        if (!project) throw new TRPCError({ code: "NOT_FOUND" });
        requireOwnership(project.userId, ctx.user.id);
        await deleteProject(input.id);
        return { success: true };
      }),
  }),

  // Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂ Room Analysis Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂ
  analysis: router({
    listByProject: protectedProcedure
      .input(z.object({ projectId: z.number() }))
      .query(async ({ ctx, input }) => {
        const project = await getProjectById(input.projectId);
        if (!project) throw new TRPCError({ code: "NOT_FOUND" });
        requireOwnership(project.userId, ctx.user.id);
        return getRoomAnalysesByProject(input.projectId);
      }),

    getUploadUrl: protectedProcedure
      .input(z.object({
        projectId: z.number(),
        fileName: z.string(),
        contentType: z.string(),
        roomName: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const project = await getProjectById(input.projectId);
        if (!project) throw new TRPCError({ code: "NOT_FOUND" });
        requireOwnership(project.userId, ctx.user.id);

        // Check subscription tier for analysis limit
        const analyses = await getRoomAnalysesByProject(input.projectId);
        const tier = (ctx.user as any).subscriptionTier ?? "free";
        if (tier === "free" && analyses.length >= 2) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Free plan limited to 2 room analyses per project. Upgrade to Pro or Trade for unlimited analyses.",
          });
        }

        const key = `analyses/${ctx.user.id}/${input.projectId}/${Date.now()}-${input.fileName}`;
        return { key, contentType: input.contentType };
      }),

    analyzeRoom: protectedProcedure
      .input(z.object({
        projectId: z.number(),
        photoKey: z.string(),
        photoUrl: z.string().url().optional(),
        roomName: z.string().optional(),
        manualDimensions: z.object({
          width: z.number().optional(),
          length: z.number().optional(),
          height: z.number().optional(),
        }).optional(),
        stylePrompt: z.string().optional(),
        referenceImageUrls: z.array(z.string().url()).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const project = await getProjectById(input.projectId);
        if (!project) throw new TRPCError({ code: "NOT_FOUND" });
        requireOwnership(project.userId, ctx.user.id);

        // Create analysis record in processing state
        const analysisId = await createRoomAnalysis({
          projectId: input.projectId,
          userId: ctx.user.id,
          roomName: input.roomName ?? "Room",
          photoUrl: input.photoUrl ?? null,
          photoKey: input.photoKey,
          status: "processing",
          stylePrompt: input.stylePrompt ?? null,
          referenceImageUrls: input.referenceImageUrls ?? null,
        });

        try {
          // Call AI vision model to analyse the room photo
          // Build dimension context from manual inputs if provided
          const dimCtx = input.manualDimensions
            ? `\n\nThe user has provided manual measurements: ${[
                input.manualDimensions.width ? `Width: ${input.manualDimensions.width}m` : null,
                input.manualDimensions.length ? `Length: ${input.manualDimensions.length}m` : null,
                input.manualDimensions.height ? `Height: ${input.manualDimensions.height}m` : null,
              ].filter(Boolean).join(", ")}. Use these as the authoritative dimensions and calculate area/perimeter from them.`
            : "";
          const styleCtx = input.stylePrompt
            ? `\n\nDesired style / renovation description from the homeowner: "${input.stylePrompt}". Factor this into your recommended work and style recommendations.`
            : "";
          const refCtx = input.referenceImageUrls?.length
            ? `\n\n${input.referenceImageUrls.length} reference image(s) have been provided showing the desired style. Analyse them alongside the room photo to align recommendations with the homeowner's vision.`
            : "";
          // Build content array: room photo first, then reference images, then text
          const userContent: any[] = [
            { type: "image_url", image_url: { url: input.photoUrl, detail: "high" } },
            ...(input.referenceImageUrls ?? []).map((url) => ({
              type: "image_url",
              image_url: { url, detail: "low" },
            })),
            {
              type: "text",
              text: `Please analyse this room and provide renovation planning. Room name: ${input.roomName ?? "Unknown"}${dimCtx}${styleCtx}${refCtx}`,
            },
          ];
          const aiResponse = await invokeLLM({
            messages: [
              {
                role: "system",
                content: `You are an expert renovation estimator and interior designer. Analyse the provided room photo(s) and extract:
1. Dimensions (width, length, height in metres, floor area in mÃÂ², wall perimeter in m) â use manual measurements if provided, otherwise estimate from the photo
2. Room type and current condition
3. Identified features (windows, doors, radiators, built-ins, etc.)
4. Renovation scope and recommendations tailored to the homeowner's stated style preferences and any reference images
5. Style recommendations: specific finishes, colours, materials that match the desired look
Respond ONLY with valid JSON matching this exact schema:
{
  "dimensions": { "width": number, "length": number, "height": number, "area": number, "perimeter": number },
  "renovationScope": {
    "roomType": string,
    "condition": "poor" | "fair" | "good",
    "identifiedFeatures": string[],
    "recommendedWork": string[]
  },
  "styleRecommendations": {
    "palette": string,
    "finishes": string[],
    "keyMaterials": string[],
    "designNotes": string
  },
  "aiSummary": string
}`,
              },
              {
                role: "user",
                content: userContent,
              },
            ],
            response_format: {
              type: "json_schema",
              json_schema: {
                name: "room_analysis",
                strict: true,
                schema: {
                  type: "object",
                  properties: {
                    dimensions: {
                      type: "object",
                      properties: {
                        width: { type: "number" },
                        length: { type: "number" },
                        height: { type: "number" },
                        area: { type: "number" },
                        perimeter: { type: "number" },
                      },
                      required: ["width", "length", "height", "area", "perimeter"],
                      additionalProperties: false,
                    },
                    renovationScope: {
                      type: "object",
                      properties: {
                        roomType: { type: "string" },
                        condition: { type: "string" },
                        identifiedFeatures: { type: "array", items: { type: "string" } },
                        recommendedWork: { type: "array", items: { type: "string" } },
                      },
                      required: ["roomType", "condition", "identifiedFeatures", "recommendedWork"],
                      additionalProperties: false,
                    },
                    styleRecommendations: {
                      type: "object",
                      properties: {
                        palette: { type: "string" },
                        finishes: { type: "array", items: { type: "string" } },
                        keyMaterials: { type: "array", items: { type: "string" } },
                        designNotes: { type: "string" },
                      },
                      required: ["palette", "finishes", "keyMaterials", "designNotes"],
                      additionalProperties: false,
                    },
                    aiSummary: { type: "string" },
                  },
                  required: ["dimensions", "renovationScope", "styleRecommendations", "aiSummary"],
                  additionalProperties: false,
                },
              },
            },
          });

          const content = aiResponse.choices?.[0]?.message?.content;
          const parsed = typeof content === "string" ? JSON.parse(content) : content;

          await updateRoomAnalysis(analysisId, {
            status: "completed",
            dimensions: parsed.dimensions,
            renovationScope: parsed.renovationScope,
            styleRecommendations: parsed.styleRecommendations,
            aiSummary: parsed.aiSummary,
          });

          return { analysisId, ...parsed };
        } catch (err) {
          await updateRoomAnalysis(analysisId, { status: "failed" });
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "AI analysis failed. Please try again." });
        }
      }),

    generateRender: protectedProcedure
      .input(z.object({ analysisId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const analysis = await getRoomAnalysisById(input.analysisId);
        if (!analysis) throw new TRPCError({ code: "NOT_FOUND" });
        requireOwnership(analysis.userId, ctx.user.id);
        if (analysis.status !== "completed") throw new TRPCError({ code: "BAD_REQUEST", message: "Analysis must be complete before generating a render" });

        // Build a rich, detailed prompt from all available analysis data
        const dims = analysis.dimensions as any;
        const scope = analysis.renovationScope as any;
        const style = analysis.styleRecommendations as any;

        const dimStr = dims
          ? `The room is ${dims.width?.toFixed(1)}m wide, ${dims.length?.toFixed(1)}m long, and ${dims.height?.toFixed(1)}m high (floor area ${dims.area?.toFixed(1)}mÃÂ²).`
          : "";

        const scopeStr = scope
          ? `Room type: ${scope.roomType}. Condition: ${scope.condition}. Features: ${scope.identifiedFeatures?.join(", ") ?? "none"}.`
          : "";

        const styleStr = style
          ? `Colour palette: ${style.palette ?? "neutral"}. Finishes: ${style.finishes?.join(", ") ?? ""}.  Key materials: ${style.keyMaterials?.join(", ") ?? ""}. Design notes: ${style.designNotes ?? ""}.`
          : "";

        const userStyleStr = analysis.stylePrompt
          ? `The homeowner wants: ${analysis.stylePrompt}`
          : "";

        const renderPrompt = [
          `Photorealistic architectural interior render of a fully renovated ${scope?.roomType ?? analysis.roomName}.`,
          dimStr,
          scopeStr,
          styleStr,
          userStyleStr,
          "Professional interior photography style, soft natural lighting, ultra-high detail, 8K resolution, wide-angle lens perspective showing the full room. The renovation is complete and pristine â no construction materials visible.",
        ].filter(Boolean).join(" ");

        // Mark as generating
        await updateRoomAnalysis(input.analysisId, { renderStatus: "generating", renderPrompt });

        try {
          // Use room photo + reference images as visual context for the render
          const refUrls = (analysis.referenceImageUrls as string[] | null) ?? [];
          const originalImages = [
            ...(analysis.photoUrl ? [{ url: analysis.photoUrl, mimeType: "image/jpeg" }] : []),
            ...refUrls.map(url => ({ url, mimeType: "image/jpeg" })),
          ];

          const { url } = await generateImage({ prompt: renderPrompt, originalImages });

          if (!url) throw new Error("No image URL returned");

          await updateRoomAnalysis(input.analysisId, { renderStatus: "completed", renderUrl: url });
          return { renderUrl: url, renderPrompt };
        } catch (err: any) {
          await updateRoomAnalysis(input.analysisId, { renderStatus: "failed" });
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: err.message ?? "Render generation failed" });
        }
      }),
    generateMaterials: protectedProcedure
      .input(z.object({ analysisId: z.number(), projectId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const analysis = await getRoomAnalysisById(input.analysisId);
        if (!analysis) throw new TRPCError({ code: "NOT_FOUND" });
        requireOwnership(analysis.userId, ctx.user.id);
        if (analysis.status !== "completed") throw new TRPCError({ code: "BAD_REQUEST", message: "Analysis not yet complete" });

        const aiResponse = await invokeLLM({
          messages: [
            {
              role: "system",
              content: `You are an expert renovation materials estimator with deep knowledge of UK trade pricing. 
Generate a detailed, itemised materials list based on the room analysis data provided.
Include realistic UK trade prices (ex-VAT). 

Respond ONLY with valid JSON:
{
  "items": [
    {
      "category": string,
      "name": string,
      "description": string,
      "quantity": number,
      "unit": string,
      "tradePrice": number,
      "retailPrice": number,
      "supplier": string
    }
  ],
  "totalTradePrice": number,
  "totalRetailPrice": number,
  "notes": string
}`,
            },
            {
              role: "user",
              content: `Generate a materials list for this room:
Room: ${analysis.roomName}
Dimensions: ${JSON.stringify(analysis.dimensions)}
Renovation Scope: ${JSON.stringify(analysis.renovationScope)}
AI Summary: ${analysis.aiSummary}`,
            },
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "materials_list",
              strict: true,
              schema: {
                type: "object",
                properties: {
                  items: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        category: { type: "string" },
                        name: { type: "string" },
                        description: { type: "string" },
                        quantity: { type: "number" },
                        unit: { type: "string" },
                        tradePrice: { type: "number" },
                        retailPrice: { type: "number" },
                        supplier: { type: "string" },
                      },
                      required: ["category", "name", "description", "quantity", "unit", "tradePrice", "retailPrice", "supplier"],
                      additionalProperties: false,
                    },
                  },
                  totalTradePrice: { type: "number" },
                  totalRetailPrice: { type: "number" },
                  notes: { type: "string" },
                },
                required: ["items", "totalTradePrice", "totalRetailPrice", "notes"],
                additionalProperties: false,
              },
            },
          },
        });

        const content = aiResponse.choices?.[0]?.message?.content;
        const parsed = typeof content === "string" ? JSON.parse(content) : content;

        const listId = await createMaterialsList({
          projectId: input.projectId,
          roomAnalysisId: input.analysisId,
          userId: ctx.user.id,
          title: `Materials for ${analysis.roomName}`,
          items: parsed.items,
          totalTradePrice: parsed.totalTradePrice,
          totalRetailPrice: parsed.totalRetailPrice,
        });

        return { listId, ...parsed };
      }),
  }),

  // Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂ Materials Lists Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂ
  materials: router({
    listByProject: protectedProcedure
      .input(z.object({ projectId: z.number() }))
      .query(async ({ ctx, input }) => {
        const project = await getProjectById(input.projectId);
        if (!project) throw new TRPCError({ code: "NOT_FOUND" });
        requireOwnership(project.userId, ctx.user.id);
        return getMaterialsListsByProject(input.projectId);
      }),

    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        const list = await getMaterialsListById(input.id);
        if (!list) throw new TRPCError({ code: "NOT_FOUND" });
        requireOwnership(list.userId, ctx.user.id);
        return list;
      }),
  }),

  // Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂ Suppliers Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂ
  suppliers: router({
    list: publicProcedure
      .input(z.object({
        category: z.string().optional(),
        region: z.string().optional(),
        isNational: z.boolean().optional(),
      }).optional())
      .query(async ({ input }) => {
        return getSuppliers(input);
      }),

    get: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const supplier = await getSupplierById(input.id);
        if (!supplier) throw new TRPCError({ code: "NOT_FOUND" });
        return supplier;
      }),

    trackClick: publicProcedure
      .input(z.object({
        supplierId: z.number(),
        projectId: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await trackAffiliateClick(input.supplierId, ctx.user?.id, input.projectId);
        return { success: true };
      }),
  }),

  // Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂ Tradespeople Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂ
  tradespeople: router({
    list: publicProcedure
      .input(z.object({
        trade: z.string().optional(),
        region: z.string().optional(),
        isVerified: z.boolean().optional(),
      }).optional())
      .query(async ({ input }) => {
        return getTradespeople(input);
      }),

    get: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const person = await getTradespersonById(input.id);
        if (!person) throw new TRPCError({ code: "NOT_FOUND" });
        const personReviews = await getReviewsByTradesperson(input.id);
        return { ...person, reviews: personReviews };
      }),

    submitReview: protectedProcedure
      .input(z.object({
        tradespersonId: z.number(),
        rating: z.number().int().min(1).max(5),
        comment: z.string().max(1000).optional(),
        projectId: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await createReview({ ...input, userId: ctx.user.id });
        return { success: true };
      }),

    requestIntroduction: publicProcedure
      .input(z.object({
        tradespersonId: z.number(),
        requesterName: z.string().min(2).max(256),
        requesterEmail: z.string().email(),
        requesterPhone: z.string().max(64).optional(),
        projectDescription: z.string().max(2000).optional(),
      }))
      .mutation(async ({ input }) => {
        const tradesperson = await getTradespersonById(input.tradespersonId);
        if (!tradesperson) throw new TRPCError({ code: "NOT_FOUND", message: "Tradesperson not found" });

        const introId = await createIntroductionRequest({
          tradespersonId: input.tradespersonId,
          requesterName: input.requesterName,
          requesterEmail: input.requesterEmail,
          requesterPhone: input.requesterPhone ?? null,
          projectDescription: input.projectDescription ?? null,
        });

        // Notify owner about the introduction request
        const title = `New introduction request â ${tradesperson.name} (${tradesperson.trade})`;
        const content = [
          `Requester: ${input.requesterName}`,
          `Email: ${input.requesterEmail}`,
          `Phone: ${input.requesterPhone ?? "not provided"}`,
          `Tradesperson: ${tradesperson.name} (${tradesperson.trade?.replace(/_/g, " ")})`,
          `Project: ${input.projectDescription ?? "not described"}`,
        ].join("\n");
        notifyOwner({ title, content }).catch(() => {});
        sendOwnerEmail(title, content).catch(() => {});

        return { introId, success: true };
      }),
  }),

  // Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂ Subscriptions Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂ
  subscriptions: router({
    getCurrent: protectedProcedure.query(async ({ ctx }) => {
      return {
        tier: (ctx.user as any).subscriptionTier ?? "free",
        expiresAt: (ctx.user as any).subscriptionExpiresAt ?? null,
        plans: [
          {
            id: "free",
            name: "Free",
            price: 0,
            currency: "GBP",
            features: ["2 room analyses per project", "Basic materials list", "Supplier directory access", "Tradesperson directory access"],
          },
          {
            id: "pro",
            name: "Pro",
            price: 9.99,
            currency: "GBP",
            features: ["Unlimited room analyses", "Full AI materials estimation with trade pricing", "Priority supplier access", "Save & export materials lists", "Unlimited projects"],
          },
          {
            id: "trade",
            name: "Trade",
            price: 24.99,
            currency: "GBP",
            features: ["Everything in Pro", "Trade account pricing", "Bulk materials ordering", "Client project management", "Verified tradesperson badge", "Lead generation access"],
          },
        ],
      };
    }),

    createCheckoutSession: protectedProcedure
      .input(z.object({ tier: z.enum(["pro", "trade"]), origin: z.string() }))
      .mutation(async ({ ctx, input }) => {
        const Stripe = (await import("stripe")).default;
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", { apiVersion: "2025-03-31.basil" });

        const priceId = input.tier === "pro"
          ? process.env.STRIPE_PRO_PRICE_ID
          : process.env.STRIPE_TRADE_PRICE_ID;

        if (!priceId) {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: `Stripe price ID for ${input.tier} is not configured. Please set STRIPE_${input.tier.toUpperCase()}_PRICE_ID.` });
        }

        const session = await stripe.checkout.sessions.create({
          mode: "subscription",
          payment_method_types: ["card"],
          customer_email: ctx.user.email ?? undefined,
          allow_promotion_codes: true,
          line_items: [{ price: priceId, quantity: 1 }],
          client_reference_id: ctx.user.id.toString(),
          metadata: {
            user_id: ctx.user.id.toString(),
            customer_email: ctx.user.email ?? "",
            customer_name: ctx.user.name ?? "",
          },
          success_url: `${input.origin}/dashboard?upgrade=success`,
          cancel_url: `${input.origin}/pricing?upgrade=cancelled`,
        });

        return { checkoutUrl: session.url };
      }),

    createBillingPortal: protectedProcedure
      .input(z.object({ origin: z.string() }))
      .mutation(async ({ ctx, input }) => {
        const Stripe = (await import("stripe")).default;
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", { apiVersion: "2025-03-31.basil" });

        const customerId = (ctx.user as any).stripeCustomerId as string | null;
        if (!customerId) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "No Stripe customer found. Please subscribe first." });
        }

        const session = await stripe.billingPortal.sessions.create({
          customer: customerId,
          return_url: `${input.origin}/dashboard`,
        });

        return { portalUrl: session.url };
      }),
  }),

  // Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂ Admin Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂ
  admin: router({
    stats: adminProcedure()
      .query(async () => {
        return getAdminStats();
      }),
    emailList: protectedProcedure
      .use(({ ctx, next }) => {
        if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
        return next({ ctx });
      })
      .query(async () => {
        return getEmailList();
      }),

    listUsers: adminProcedure()
      .input(z.object({ limit: z.number().optional(), offset: z.number().optional() }))
      .query(async ({ input }) => {
        return getAllUsers(input.limit, input.offset);
      }),

    listSuppliers: adminProcedure()
      .query(async () => {
        return getSuppliers();
      }),

    createSupplier: adminProcedure()
      .input(z.object({
        name: z.string().min(1),
        description: z.string().optional(),
        category: z.enum(["timber_merchants", "builders_merchants", "paint_decorating", "roofing_insulation", "flooring", "kitchen_bathroom", "electrical_plumbing", "windows_doors", "general"]),
        region: z.string().optional(),
        isNational: z.boolean().optional(),
        websiteUrl: z.string().url().optional(),
        affiliateUrl: z.string().url().optional(),
        commissionRate: z.number().min(0).max(1).optional(),
        phone: z.string().optional(),
        email: z.string().email().optional(),
        address: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const id = await createSupplier(input as any);
        return { id };
      }),

    updateSupplier: adminProcedure()
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        description: z.string().optional(),
        isActive: z.boolean().optional(),
        commissionRate: z.number().optional(),
        websiteUrl: z.string().optional(),
        affiliateUrl: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await updateSupplier(id, data);
        return { success: true };
      }),

    deleteSupplier: adminProcedure()
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await deleteSupplier(input.id);
        return { success: true };
      }),

    listTradespeople: adminProcedure()
      .query(async () => {
        return getTradespeople();
      }),

    createTradesperson: adminProcedure()
      .input(z.object({
        name: z.string().min(1),
        trade: z.enum(["joiner_carpenter", "plumber", "electrician", "plasterer", "painter_decorator", "roofer", "tiler", "builder_general", "kitchen_fitter", "bathroom_fitter", "landscaper", "other"]),
        bio: z.string().optional(),
        region: z.string().min(1),
        phone: z.string().optional(),
        email: z.string().email().optional(),
        websiteUrl: z.string().url().optional(),
        yearsExperience: z.number().optional(),
        qualifications: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const id = await createTradesperson(input as any);
        return { id };
      }),

    verifyTradesperson: adminProcedure()
      .input(z.object({ id: z.number(), isVerified: z.boolean() }))
      .mutation(async ({ input }) => {
        await updateTradesperson(input.id, { isVerified: input.isVerified });
        return { success: true };
      }),

    toggleTradespersonActive: adminProcedure()
      .input(z.object({ id: z.number(), isActive: z.boolean() }))
      .mutation(async ({ input }) => {
        await updateTradesperson(input.id, { isActive: input.isActive });
        return { success: true };
      }),

    // Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂ Funnel & Lead Visibility Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂ
    funnelStats: adminProcedure()
      .query(async () => {
        return getAdminFunnelStats();
      }),

    listLeads: adminProcedure()
      .input(z.object({ limit: z.number().optional() }).optional())
      .query(async ({ input }) => {
        return getAdminLeads(input?.limit);
      }),

    listFittedEstimates: adminProcedure()
      .input(z.object({ limit: z.number().optional() }).optional())
      .query(async ({ input }) => {
        return getAdminFittedEstimates(input?.limit);
      }),

    listQuoteRequests: adminProcedure()
      .input(z.object({ limit: z.number().optional() }).optional())
      .query(async ({ input }) => {
        return getAdminQuoteRequests(input?.limit);
      }),

    updateQuoteStatus: adminProcedure()
      .input(z.object({ id: z.number(), status: z.enum(["new", "contacted", "quoted", "won", "lost"]) }))
      .mutation(async ({ input }) => {
        return updateQuoteRequestStatus(input.id, input.status);
      }),

    recentActivity: adminProcedure()
      .input(z.object({ limit: z.number().optional() }).optional())
      .query(async ({ input }) => {
        return getAdminRecentActivity(input?.limit);
      }),
  }),

  // Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂ Guest Estimate (no auth required) Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂÃ¢ÂÂ
  guest: router({
    // Step 1: Start a guest estimate â upload photo, dimensions, answers, style
    // Returns a leadId used to poll/retrieve the result
    startEstimate: publicProcedure
      .input(z.object({
        email: z.string().email(),
        firstName: z.string().optional(),
        userType: z.enum(["homeowner", "tradesperson"]).default("homeowner"),
        projectType: z.string().min(1),
        photoUrl: z.string().url(),
        dimensions: z.object({
          width: z.number().optional(),
          length: z.number().optional(),
          height: z.number().optional(),
        }).optional(),
        stylePrompt: z.string().optional(),
        guidedAnswers: z.record(z.string(), z.string()).optional(),
      }))
      .mutation(async ({ input }) => {
        // Create the lead record first
        const leadId = await createGuestLead({
          email: input.email,
          firstName: input.firstName ?? null,
          userType: input.userType,
          projectType: input.projectType,
          photoUrl: input.photoUrl,
          dimensions: input.dimensions ?? null,
          stylePrompt: input.stylePrompt ?? null,
          guidedAnswers: input.guidedAnswers ?? null,
        });

        // Build AI prompt context
        const dimCtx = input.dimensions
          ? `\n\nUser-provided measurements: ${[
              input.dimensions.width ? `Width: ${input.dimensions.width}m` : null,
              input.dimensions.length ? `Length: ${input.dimensions.length}m` : null,
              input.dimensions.height ? `Height: ${input.dimensions.height}m` : null,
            ].filter(Boolean).join(", ")}. Use these as authoritative dimensions.`
          : "";
        const styleCtx = input.stylePrompt
          ? `\n\nDesired style: "${input.stylePrompt}". Factor this into your recommendations.`
          : "";
        const tradeCtx = input.userType === "tradesperson"
          ? "\n\nThis estimate is being prepared by a tradesperson. Include labour time estimates and material quantities suitable for a professional quote."
          : "";
        const answersCtx = input.guidedAnswers && Object.keys(input.guidedAnswers).length > 0
          ? `\n\nAdditional context from guided questions: ${Object.entries(input.guidedAnswers).map(([k, v]) => `${k}: ${v}`).join("; ")}.`
          : "";

        const textPrompt = `Analyse this ${input.projectType} renovation project.${dimCtx}${styleCtx}${tradeCtx}${answersCtx}`;
        const userContent: any[] = input.photoUrl
          ? [
              { type: "image_url", image_url: { url: input.photoUrl, detail: "high" } },
              { type: "text", text: textPrompt },
            ]
          : [{ type: "text", text: textPrompt + "\n\nNo photo was provided. Base your estimate on the project type, measurements, style description, and guided answers provided." }];

        const aiResponse = await invokeLLM({
          messages: [
            {
              role: "system",
              content: `You are an expert renovation estimator for the UK and Ireland market. Analyse the provided information (and room photo if available) and provide a renovation estimate. Respond ONLY with valid JSON matching this exact schema:
{
  "roomType": string,
  "estimatedArea": number,
  "condition": "poor" | "fair" | "good",
  "recommendedWork": string[],
  "costRangeLow": number,
  "costRangeHigh": number,
  "keyMaterials": string[],
  "timeEstimate": string,
  "aiSummary": string
}
All costs in GBP (Â£). Be realistic and conservative. costRangeLow and costRangeHigh are integers.`,
            },
            { role: "user", content: userContent },
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "guest_estimate",
              strict: true,
              schema: {
                type: "object",
                properties: {
                  roomType: { type: "string" },
                  estimatedArea: { type: "number" },
                  condition: { type: "string", enum: ["poor", "fair", "good"] },
                  recommendedWork: { type: "array", items: { type: "string" } },
                  costRangeLow: { type: "integer" },
                  costRangeHigh: { type: "integer" },
                  keyMaterials: { type: "array", items: { type: "string" } },
                  timeEstimate: { type: "string" },
                  aiSummary: { type: "string" },
                },
                required: ["roomType", "estimatedArea", "condition", "recommendedWork", "costRangeLow", "costRangeHigh", "keyMaterials", "timeEstimate", "aiSummary"],
                additionalProperties: false,
              },
            },
          },
        });

        let result: any = null;
        try {
          const raw = aiResponse?.choices?.[0]?.message?.content;
          result = typeof raw === "string" ? JSON.parse(raw) : raw;
        } catch {
          result = { aiSummary: "Analysis complete. Upgrade to view full breakdown.", costRangeLow: 0, costRangeHigh: 0 };
        }

        // Persist the result to the lead record
        await (await import("./db")).updateGuestLead(leadId, {
          analysisResult: result,
          costRangeLow: result?.costRangeLow ?? null,
          costRangeHigh: result?.costRangeHigh ?? null,
        });

        // Send estimate follow-up email with return link
        sendEstimateFollowUpEmail(input.email, input.firstName ?? null, "renovation", leadId).catch(() => {});

        return { leadId, result };
      }),

    // Get a guest lead result by ID (for result page)
    getResult: publicProcedure
      .input(z.object({ leadId: z.number() }))
      .query(async ({ input }) => {
        const lead = await getGuestLeadById(input.leadId);
        if (!lead) throw new TRPCError({ code: "NOT_FOUND" });
        return lead;
      }),

    // Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂ New Build Estimate (no photo required, multi-room)
    startNewBuildEstimate: publicProcedure
      .input(z.object({
        email: z.string().email(),
        firstName: z.string().optional(),
        userType: z.enum(["homeowner", "tradesperson"]).default("homeowner"),
        finishLevel: z.enum(["standard", "mid", "premium"]).default("mid"),
        stylePrompt: z.string().optional(),
        rooms: z.array(z.object({
          type: z.string(),
          label: z.string(),
          width: z.number().optional(),
          length: z.number().optional(),
          height: z.number().optional(),
          photoUrl: z.string().url().optional(),
        })).min(1),
      }))
      .mutation(async ({ input }) => {
        const roomDescriptions = input.rooms.map((r, i) =>
          `Room ${i + 1}: ${r.label} (${r.type})` +
          (r.width && r.length ? ` â ${r.width}m Ã ${r.length}m` : "") +
          (r.height ? ` Ã ${r.height}m high` : "")
        ).join("\n");
        const finishDesc = { standard: "standard/budget", mid: "mid-range", premium: "premium/high-spec" }[input.finishLevel];
        const tradeCtx = input.userType === "tradesperson"
          ? " This estimate is being prepared by a tradesperson â include labour time and material quantities suitable for a professional quote."
          : "";
        const aiResponse = await invokeLLM({
          messages: [
            {
              role: "system",
              content: `You are an expert new-build cost estimator and interior designer for the UK and Ireland market. The user is building a new house and needs a full fit-out estimate for each room. Respond ONLY with valid JSON matching this exact schema:\n{\n  "totalCostLow": number,\n  "totalCostHigh": number,\n  "timeEstimate": string,\n  "aiSummary": string,\n  "designSummary": string,\n  "rooms": [\n    {\n      "type": string,\n      "label": string,\n      "costLow": number,\n      "costHigh": number,\n      "keyMaterials": string[],\n      "recommendedWork": string[]\n    }\n  ]\n}\nAll costs in GBP (Â£). Be realistic and conservative. Use ${finishDesc} finish level throughout. The designSummary should be 2-3 sentences of practical interior design recommendations suited to the finish level and room mix â suggest colour palettes, flooring choices, and key style decisions.${tradeCtx}`,
            },
            {
              role: "user",
              content: `New build fit-out estimate for the following rooms at ${finishDesc} finish level:\n\n${roomDescriptions}\n\nProvide a realistic itemised estimate for each room and a grand total.`,
            },
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "new_build_estimate",
              strict: true,
              schema: {
                type: "object",
                properties: {
                  totalCostLow: { type: "integer" },
                  totalCostHigh: { type: "integer" },
                  timeEstimate: { type: "string" },
                  aiSummary: { type: "string" },
                  designSummary: { type: "string" },
                  rooms: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        type: { type: "string" },
                        label: { type: "string" },
                        costLow: { type: "integer" },
                        costHigh: { type: "integer" },
                        keyMaterials: { type: "array", items: { type: "string" } },
                        recommendedWork: { type: "array", items: { type: "string" } },
                      },
                      required: ["type", "label", "costLow", "costHigh", "keyMaterials", "recommendedWork"],
                      additionalProperties: false,
                    },
                  },
                },
                required: ["totalCostLow", "totalCostHigh", "timeEstimate", "aiSummary", "designSummary", "rooms"],
                additionalProperties: false,
              },
            },
          },
        });
        let result: any = null;
        try {
          const raw = aiResponse?.choices?.[0]?.message?.content;
          result = typeof raw === "string" ? JSON.parse(raw) : raw;
        } catch {
          result = { aiSummary: "Estimate complete.", totalCostLow: 0, totalCostHigh: 0, rooms: [] };
        }
        const leadId = await createGuestLead({
          email: input.email,
          firstName: input.firstName ?? null,
          userType: input.userType,
          projectType: "new_build",
          photoUrl: null,
          dimensions: null,
          stylePrompt: `Finish level: ${input.finishLevel}`,
          guidedAnswers: null,
          estimateType: "new_build",
          rooms: input.rooms,
        });
        await (await import("./db")).updateGuestLead(leadId, {
          analysisResult: result,
          costRangeLow: result?.totalCostLow ?? null,
          costRangeHigh: result?.totalCostHigh ?? null,
        });

        // Send estimate follow-up email with return link
        sendEstimateFollowUpEmail(input.email, input.firstName ?? null, "new_build", leadId).catch(() => {});

        return { leadId, result };
      }),

    // Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂ Scan House Plans (AI extracts rooms + dimensions from 1-5 uploaded plan images/PDFs)
    scanHousePlan: publicProcedure
      .input(z.object({
        // Accept either a single plan (legacy) or an array of plans
        planUrl: z.string().url().optional(),
        mimeType: z.string().optional(),
        plans: z.array(z.object({
          url: z.string().url(),
          mimeType: z.string(),
          name: z.string().optional(),
        })).optional(),
      }))
      .mutation(async ({ input }) => {
        // Normalise to array
        const planList = input.plans && input.plans.length > 0
          ? input.plans
          : input.planUrl
            ? [{ url: input.planUrl, mimeType: input.mimeType ?? "image/jpeg", name: "plan" }]
            : [];

        if (planList.length === 0) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "No plans provided" });
        }

        const systemPrompt = "You are an expert architectural plan reader for the UK and Ireland market. The user has uploaded one or more house plan pages (floor plans or architectural drawings). Your job is to identify every room visible across all pages and estimate its dimensions in metres. Respond ONLY with valid JSON: { rooms: [{ type, label, width, length, height, confidence }], planNotes }. Room type must be one of: kitchen, bathroom, en_suite, living_room, master_bedroom, bedroom, hallway, utility, dining_room, home_office, garage, other. If dimensions are not clearly visible, use null and set confidence to low. planNotes should describe what you can see across all pages.";

        // Build content array: text instruction + one media item per plan
        const userContent: any[] = [
          { type: "text", text: `Please scan ${planList.length > 1 ? `these ${planList.length} house plan pages` : "this house plan"} and extract all rooms with their dimensions. Merge rooms across pages â do not duplicate rooms that appear on multiple pages.` },
          ...planList.map((p) =>
            p.mimeType === "application/pdf"
              ? { type: "file_url", file_url: { url: p.url, mime_type: "application/pdf" } }
              : { type: "image_url", image_url: { url: p.url, detail: "high" } }
          ),
        ];

        const aiResponse = await invokeLLM({
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userContent },
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "house_plan_scan",
              strict: true,
              schema: {
                type: "object",
                properties: {
                  rooms: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        type: { type: "string" },
                        label: { type: "string" },
                        width: { type: ["number", "null"] },
                        length: { type: ["number", "null"] },
                        height: { type: ["number", "null"] },
                        confidence: { type: "string" },
                      },
                      required: ["type", "label", "width", "length", "height", "confidence"],
                      additionalProperties: false,
                    },
                  },
                  planNotes: { type: "string" },
                },
                required: ["rooms", "planNotes"],
                additionalProperties: false,
              },
            },
          },
        });

        let scanResult: { rooms: any[]; planNotes: string } = { rooms: [], planNotes: "" };
        try {
          const raw = aiResponse?.choices?.[0]?.message?.content;
          scanResult = typeof raw === "string" ? JSON.parse(raw) : raw;
        } catch {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to parse plan scan result" });
        }

        return scanResult;
      }),

    // Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂ Generate AI Room Photo (renders a room based on style prompt)
    //    Report abandoned estimate (sends recovery email if email was provided)
    reportAbandon: publicProcedure
      .input(z.object({
        email: z.string().email().optional(),
        firstName: z.string().optional(),
        estimateType: z.enum(["renovation", "new_build"]),
        stepReached: z.number().int().min(1).max(7),
      }))
      .mutation(async ({ input }) => {
        if (input.email && input.stepReached >= 2) {
          sendAbandonedEstimateEmail(
            input.email,
            input.firstName || null,
            input.estimateType,
            input.stepReached
          ).catch(() => {});
        }
        return { ok: true };
      }),


    generateRoomPhoto: publicProcedure
      .input(z.object({
        roomLabel: z.string(),
        roomType: z.string(),
        stylePrompt: z.string(),
        finishLevel: z.enum(["standard", "mid", "premium"]).optional(),
        width: z.number().optional(),
        length: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const finishDesc = input.finishLevel === "premium"
          ? "premium, high-spec, designer finishes"
          : input.finishLevel === "standard"
          ? "standard builder-grade, practical finishes"
          : "mid-range, good quality finishes";

        const sizeHint = input.width && input.length
          ? ` The room is approximately ${input.width}m wide by ${input.length}m long.`
          : "";

        const prompt = `Photorealistic interior render of a ${input.roomLabel} in a newly built Irish home. ${finishDesc}.${sizeHint} Style: ${input.stylePrompt}. Bright, natural lighting. Show the finished room as if photographed by an interior designer. No people, no text overlays.`;

        const { url } = await generateImage({ prompt });
        return { imageUrl: url, prompt };
      }),

  }),

  // Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂ Trade Applications
  trade: router({
    submitApplication: publicProcedure
      .input(z.object({
        fullName: z.string().min(2),
        trade: z.string().min(2),
        town: z.string().min(2),
        phone: z.string().min(7),
        email: z.string().email(),
      }))
      .mutation(async ({ input }) => {
        await createTradeApplication(input);
        // Send confirmation email to the applicant
        sendTradeApplicationConfirmationEmail(input.email, input.fullName, input.trade).catch(() => {});
        return { success: true };
      }),
    list: protectedProcedure
      .use(({ ctx, next }) => {
        if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
        return next({ ctx });
      })
      .query(async () => {
        return getTradeApplications();
      }),
  }),

  // Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂ Project Templates (Trade tier)
  templates: router({
    list: protectedProcedure
      .query(async ({ ctx }) => {
        if (ctx.user.subscriptionTier !== "trade") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Trade tier required" });
        }
        return getProjectTemplatesByUser(ctx.user.id);
      }),
    save: protectedProcedure
      .input(z.object({
        name: z.string().min(1).max(256),
        category: z.string().min(1).max(64),
        description: z.string().max(1000).optional(),
        templateData: z.string(), // JSON string of saved wizard state
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.subscriptionTier !== "trade") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Trade tier required" });
        }
        const id = await createProjectTemplate({
          userId: ctx.user.id,
          name: input.name,
          category: input.category,
          description: input.description ?? null,
          templateData: input.templateData,
        });
        return { id };
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.subscriptionTier !== "trade") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Trade tier required" });
        }
        await deleteProjectTemplate(input.id, ctx.user.id);
        return { success: true };
      }),
  }),

  // Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂ Project Visualisations
  visualisation: router({
    // Get current user's allowance status
    status: protectedProcedure.query(async ({ ctx }) => {
      const status = await getUserVisualisationStatus(ctx.user.id);
      const remaining = status.tier === "free" ? Math.max(0, FREE_VISUALISATION_LIMIT - status.freeUsed) : null;
      return {
        tier: status.tier,
        freeUsed: status.freeUsed,
        freeLimit: FREE_VISUALISATION_LIMIT,
        remaining, // null = unlimited (pro/trade)
        canGenerate: status.tier !== "free" || status.freeUsed < FREE_VISUALISATION_LIMIT,
      };
    }),
    // Generate a new visualisation
    generate: protectedProcedure
      .input(z.object({
        roomType: z.string(),
        projectType: z.string().optional(),
        dimensions: z.object({ width: z.number().optional(), length: z.number().optional(), height: z.number().optional() }).optional(),
        finishes: z.string().optional(),
        stylePrompt: z.string().optional(),
        materials: z.array(z.string()).optional(),
        leadId: z.number().optional(),
        photoUrl: z.string().url().optional(), // customer's uploaded room photo
      }))
      .mutation(async ({ ctx, input }) => {
        // Check allowance
        const status = await getUserVisualisationStatus(ctx.user.id);
        if (status.tier === "free" && status.freeUsed >= FREE_VISUALISATION_LIMIT) {
          throw new TRPCError({ code: "FORBIDDEN", message: "FREE_LIMIT_REACHED" });
        }
        // Resolve photo URL â prefer explicit input, fall back to the lead's photo
        let resolvedPhotoUrl: string | null = input.photoUrl ?? null;
        if (!resolvedPhotoUrl && input.leadId) {
          const lead = await getGuestLeadById(input.leadId);
          resolvedPhotoUrl = lead?.photoUrl ?? null;
        }
        // Build AI prompt â instruct the model to renovate the actual room in the photo
        const dimStr = input.dimensions
          ? `The room is approximately ${[input.dimensions.width && `${input.dimensions.width}m wide`, input.dimensions.length && `${input.dimensions.length}m long`, input.dimensions.height && `${input.dimensions.height}m high`].filter(Boolean).join(", ")}.`
          : "";
        const materialsStr = input.materials?.length ? `Key materials include: ${input.materials.join(", ")}.` : "";
        const baseInstruction = resolvedPhotoUrl
          ? `Renovate this exact ${input.roomType.replace("_", " ")} â keep the same layout, walls, windows, and proportions but apply the following updates to produce a photorealistic result of the finished renovation:`
          : `A photorealistic interior render of a fully renovated ${input.roomType.replace("_", " ")} in a modern Irish home.`;
        const prompt = [
          baseInstruction,
          dimStr,
          input.finishes ? `Finishes: ${input.finishes}.` : "",
          materialsStr,
          input.stylePrompt ? `Style: ${input.stylePrompt}.` : "",
          "Show the finished renovation. High quality, professional interior photography, bright natural lighting, clean and finished.",
        ].filter(Boolean).join(" ");
        // Generate image â pass the room photo as the base image when available so the AI edits the actual room
        const originalImages = resolvedPhotoUrl
          ? [{ url: resolvedPhotoUrl, mimeType: "image/jpeg" as const }]
          : undefined;
        const { url: imageUrl } = await generateImage({ prompt, originalImages });
        if (!imageUrl) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Image generation failed" });
        // Save to DB
        const id = await createVisualisation({
          userId: ctx.user.id,
          leadId: input.leadId ?? null,
          imageUrl,
          roomType: input.roomType ?? undefined,
          projectType: input.projectType ?? undefined,
          promptUsed: prompt ?? undefined,
          sourcePhotoUrl: resolvedPhotoUrl ?? undefined,
        });
        return { id, imageUrl, prompt };
      }),
    // List all visualisations for current user
    list: protectedProcedure.query(async ({ ctx }) => {
      return getVisualisationsByUser(ctx.user.id);
    }),
    // Delete a visualisation (owner only)
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await deleteVisualisation(input.id, ctx.user.id);
        return { success: true };
      }),
  }),
  // Ã¢ÂÂÃ¢ÂÂÃ¢ÂÂ Waitlist
    //    Stripe Setup (admin-only, one-time use)
  stripeSetup: router({
    createRenovationPass: publicProcedure
      .input(z.object({ adminKey: z.string() }))
      .mutation(async ({ input }) => {
        // Simple admin key check (not a real auth, just a one-time setup guard)
        if (input.adminKey !== process.env.JWT_SECRET) {
          throw new TRPCError({ code: "UNAUTHORIZED" });
        }
        const Stripe = (await import("stripe")).default;
        if (!process.env.STRIPE_SECRET_KEY) {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "No Stripe key" });
        }
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2025-03-31.basil" as any });

        // Create product
        const product = await stripe.products.create({
          name: "Renovation Pass",
          description: "One-time unlock for your full Renolab renovation estimate  detailed costs, materials list, and AI room visualisations.",
        });

        // Create price
        const price = await stripe.prices.create({
          product: product.id,
          unit_amount: 1499,
          currency: "gbp",
        });

        // Create payment link
        const paymentLink = await stripe.paymentLinks.create({
          line_items: [{ price: price.id, quantity: 1 }],
          after_completion: {
            type: "redirect",
            redirect: { url: "https://renolab.co.uk/pricing?purchased=renovation_pass" },
          },
        });

        return {
          productId: product.id,
          priceId: price.id,
          paymentLinkId: paymentLink.id,
          paymentLinkUrl: paymentLink.url,
        };
      }),
  }),
  waitlist: router({
    join: publicProcedure
      .input(z.object({
        email: z.string().email(),
        source: z.string().optional(),
        buttonLabel: z.string().optional(),
        tier: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const source = input.source ?? "homepage";
        const buttonLabel = input.buttonLabel ?? "";
        const tier = input.tier ?? "";
        const result = await joinWaitlist(input.email, source, buttonLabel, tier);

        // Notify owner of new waitlist sign-up
        const joinedAt = new Date().toLocaleString("en-GB", { timeZone: "Europe/London" });
        const title = `New waitlist sign-up: ${input.email}`;
        const content = `Someone has joined the Renolab waitlist.\n\nEmail: ${input.email}\nSource: ${source}\nButton: ${buttonLabel || "(not specified)"}\nTier interest: ${tier || "(not specified)"}\nTime: ${joinedAt}`;
        notifyOwner({ title, content }).catch(() => {});
        sendOwnerEmail(title, content).catch(() => {});

        // Send confirmation email to the person who signed up
        sendUserConfirmationEmail(input.email).catch(() => {});

        return result;
      }),

    count: publicProcedure.query(async () => {
      const { getDb } = await import("./db");
      const { waitlistEmails } = await import("../drizzle/schema");
      const { sql } = await import("drizzle-orm");
      const db = await getDb();
      if (!db) return { count: 0 };
      const [row] = await db.select({ count: sql<number>`count(*)` }).from(waitlistEmails);
      return { count: Number(row?.count ?? 0) };
    }),

    list: protectedProcedure
      .use(({ ctx, next }) => {
        if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
        return next({ ctx });
      })
      .query(async () => {
        return getWaitlistEmails();
      }),
  }),
});

export type AppRouter = typeof appRouter;
