import {
  PropheticAnalysisSchema,
  type PropheticAnalysis,
} from "@/lib/ai/types";
import {
  HEBREW_ISRAELITE_SYSTEM_PROMPT,
  RELEVANCE_FILTER_PROMPT,
  CLASSIFY_CATEGORY_SLUG_RULE,
} from "@/lib/ai/prompts";
import { getOpenAI } from "@/lib/ai/openai";

export async function classifyArticle(
  headline: string,
  content: string,
): Promise<PropheticAnalysis> {
  const openai = getOpenAI();
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini", // Switched from gpt-4o for speed, cost, and timeout safety
    messages: [
      {
        role: "system",
        content: `${HEBREW_ISRAELITE_SYSTEM_PROMPT}\n\n${CLASSIFY_CATEGORY_SLUG_RULE}

CRITICAL: You must use EXACTLY these keys in your JSON response (camelCase):
- propheticSummary
- categories
- urgencyLevel (Must be: COVENANT_ALARM, SIGNIFICANT_SIGN, WORTHY_OF_WATCH, or MONITORING)
- urgencyReason
- scriptureReferences (Array of objects with: reference, verseText, relevanceNote, book, chapter, verseStart, verseEnd, isApocrypha)
- apocryphaReferences (Same structure as scriptureReferences)
- geolocation (Object with: country, city, region, lat, lng)
- propheticTimelinePlacement (Must be: SIGNS_OF_THE_TIMES, LATTER_DAYS_NOW, ISRAELS_RESTORATION, BEAST_SYSTEM_RISING, THE_SCATTERING_CONTINUES, or NATIONS_IN_COMMOTION)
- watchLevel (Number 1-10)
- deuteronomy28Connection
- isApocryphaConnected (Boolean)
- watchmanNote`,
      },
      {
        role: "user",
        content: `Analyze this article through the Hebrew Israelite prophetic lens.
        
Headline: ${headline}
Content: ${content.slice(0, 8000)}

Return ONLY the JSON object.`,
      },
    ],
    response_format: { type: "json_object" },
    temperature: 0.3, // Much lower for stability
  });

  const rawJson = response.choices[0]?.message?.content;
  if (!rawJson) throw new Error("No response from OpenAI");

  const parsed = JSON.parse(rawJson) as unknown;
  return PropheticAnalysisSchema.parse(parsed);
}

export async function isRelevant(
  headline: string,
  snippet: string,
): Promise<boolean> {
  const openai = getOpenAI();
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          "You are a prophetic relevance filter. Respond with only YES or NO.",
      },
      {
        role: "user",
        content: `${RELEVANCE_FILTER_PROMPT}\n\nHeadline: ${headline}\n\nSnippet: ${snippet.slice(0, 2000)}`,
      },
    ],
    temperature: 0.25,
  });

  const raw = response.choices[0]?.message?.content ?? "";
  return /^\s*YES\b/i.test(raw);
}
