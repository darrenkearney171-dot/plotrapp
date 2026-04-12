// This file contains the scanHousePlan procedure to be inserted into routers.ts
// It is a reference file only  not executed directly

/*
    // --- Scan House Plan (AI extracts rooms + dimensions from uploaded plan image/PDF)
    scanHousePlan: publicProcedure
      .input(z.object({
        planUrl: z.string().url(),
        mimeType: z.string().default("image/jpeg"),
      }))
      .mutation(async ({ input }) => {
        const mediaContent: any = input.mimeType === "application/pdf"
          ? { type: "file_url", file_url: { url: input.planUrl, mime_type: "application/pdf" } }
          : { type: "image_url", image_url: { url: input.planUrl, detail: "high" } };

        const aiResponse = await invokeLLM({
          messages: [
            {
              role: "system",
              content: "You are an expert architectural plan reader for the UK and Ireland market. The user has uploaded a house plan. Identify every room and estimate dimensions in metres. Respond ONLY with valid JSON: { rooms: [{ type, label, width, length, height, confidence }], planNotes }. Room type must be one of: kitchen, bathroom, en_suite, living_room, master_bedroom, bedroom, hallway, utility, dining_room, home_office, garage, other. Use null for unknown dimensions.",
            },
            {
              role: "user",
              content: [
                { type: "text", text: "Please scan this house plan and extract all rooms with their dimensions." },
                mediaContent,
              ],
            },
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
*/
