import { z } from "zod";

export const ScriptureReferenceSchema = z.object({
  reference: z.string(),
  verseText: z.string(),
  relevanceNote: z.string(),
  book: z.string(),
  chapter: z.number(),
  verseStart: z.number(),
  verseEnd: z.number().nullable(),
  isApocrypha: z.boolean(),
});

const enumPreprocess = (val: unknown) =>
  typeof val === "string" ? val.trim().toUpperCase().replace(/['"]/g, "") : val;

export const PropheticAnalysisSchema = z.object({
  propheticSummary: z.string(),
  categories: z.array(z.string()),
  urgencyLevel: z.preprocess(
    enumPreprocess,
    z.enum(["COVENANT_ALARM", "SIGNIFICANT_SIGN", "WORTHY_OF_WATCH", "MONITORING"]),
  ),
  urgencyReason: z.string(),
  scriptureReferences: z.array(ScriptureReferenceSchema),
  apocryphaReferences: z.array(ScriptureReferenceSchema).optional().nullable(),
  geolocation: z.object({
    country: z.string(),
    city: z.string().nullable(),
    region: z.preprocess(
      enumPreprocess,
      z.enum([
        "MIDDLE_EAST",
        "THE_MOTHERLAND",
        "EUROPE",
        "THE_AMERICAS",
        "ASIA_EAST",
        "GLOBAL_SYSTEMIC",
      ]),
    ),
    lat: z.number().nullable(),
    lng: z.number().nullable(),
  }),
  propheticTimelinePlacement: z.preprocess(
    enumPreprocess,
    z.enum([
      "SIGNS_OF_THE_TIMES",
      "LATTER_DAYS_NOW",
      "ISRAELS_RESTORATION",
      "BEAST_SYSTEM_RISING",
      "THE_SCATTERING_CONTINUES",
      "NATIONS_IN_COMMOTION",
      "UNKNOWN",
    ]),
  ),
  watchLevel: z.number().min(1).max(10),
  deuteronomy28Connection: z.string().nullable(),
  isApocryphaConnected: z.boolean(),
  watchmanNote: z.string(),
  suggestedTrackerIds: z.array(z.string()).optional(),
});

export type PropheticAnalysis = z.infer<typeof PropheticAnalysisSchema>;
export type ScriptureReference = z.infer<typeof ScriptureReferenceSchema>;
