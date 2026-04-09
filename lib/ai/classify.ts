import {
  PropheticAnalysisSchema,
  type PropheticAnalysis,
} from "@/lib/ai/types";
import {
  HEBREW_ISRAELITE_SYSTEM_PROMPT,
  RELEVANCE_FILTER_PROMPT,
  RELEVANCE_FILTER_PROMPT_STRICT,
  CLASSIFY_CATEGORY_SLUG_RULE,
} from "@/lib/ai/prompts";
import { getOpenAI } from "@/lib/ai/openai";

export async function classifyArticle(
  headline: string,
  content: string,
  trackerContext?: { id: string; title: string }[],
): Promise<PropheticAnalysis> {
  const openai = getOpenAI();

  const trackerPrompt = trackerContext?.length
    ? `\n\nAVAILABLE TRACKER ITEMS (Suggest matching IDs in suggestedTrackerIds if the story directly links to one of these prophetic milestones):
${trackerContext.map((t) => `- ${t.id}: ${t.title}`).join("\n")}`
    : "";

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini", // Switched from gpt-4o for speed, cost, and timeout safety
    messages: [
      {
        role: "system",
        content: `${HEBREW_ISRAELITE_SYSTEM_PROMPT}\n\n${CLASSIFY_CATEGORY_SLUG_RULE}${trackerPrompt}

CRITICAL: You must use EXACTLY these keys in your JSON response (camelCase):
- propheticSummary
- categories
- urgencyLevel (Choose one: COVENANT_ALARM, SIGNIFICANT_SIGN, WORTHY_OF_WATCH, MONITORING)
- urgencyReason
- scriptureReferences (Array of objects with: reference, verseText, relevanceNote, book, chapter, verseStart, verseEnd, isApocrypha)
- apocryphaReferences (Same structure as scriptureReferences)
- geolocation (Object with: country, city, region, lat, lng)
  * region MUST be exactly one of: MIDDLE_EAST, THE_MOTHERLAND, EUROPE, THE_AMERICAS, ASIA_EAST, GLOBAL_SYSTEMIC
- propheticTimelinePlacement (Choose one: SIGNS_OF_THE_TIMES, LATTER_DAYS_NOW, ISRAELS_RESTORATION, BEAST_SYSTEM_RISING, THE_SCATTERING_CONTINUES, NATIONS_IN_COMMOTION, UNKNOWN)
- watchLevel (Number 1-10)
- deuteronomy28Connection
- isApocryphaConnected (Boolean)
- watchmanNote
- suggestedTrackerIds (Array of UUID strings from the provided list, if relevant)`,
      },
      {
        role: "user",
        content: `Analyze this article through the Hebrew Israelite prophetic lens.
        
Headline: ${headline}
Content: ${content.slice(0, 4000)}

Return ONLY the JSON object.`,
      },
    ],
    response_format: { type: "json_object" },
    temperature: 0.1, // Even lower for extreme stability
  });

  const rawJson = response.choices[0]?.message?.content;
  if (!rawJson) throw new Error("No response from OpenAI");

  const parsed = JSON.parse(rawJson) as unknown;
  return PropheticAnalysisSchema.parse(parsed);
}

function relevanceFromModelText(raw: string): boolean {
  const t = raw.trim();
  if (!t) return false;
  const first = t.split(/\r?\n/).find((l) => l.trim().length > 0) ?? t;
  const line = first.trim();
  if (/^\s*NO\b/i.test(line)) return false;
  if (/^\s*YES\b/i.test(line)) return true;
  if (/\bNO\b/i.test(line) && !/\bYES\b/i.test(line)) return false;
  if (/\bYES\b/i.test(line)) return true;
  return false;
}

export async function isRelevant(
  headline: string,
  snippet: string,
  options?: { strict?: boolean },
): Promise<boolean> {
  const openai = getOpenAI();
  const userPrompt = options?.strict
    ? RELEVANCE_FILTER_PROMPT_STRICT
    : RELEVANCE_FILTER_PROMPT;

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
        content: `${userPrompt}\n\nHeadline: ${headline}\n\nSnippet: ${snippet.slice(0, 2000)}`,
      },
    ],
    temperature: 0.15,
  });

  const raw = response.choices[0]?.message?.content ?? "";
  return relevanceFromModelText(raw);
}
