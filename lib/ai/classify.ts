import {
  PropheticAnalysisSchema,
  type PropheticAnalysis,
} from "@/lib/ai/types";
import { HEBREW_ISRAELITE_SYSTEM_PROMPT } from "@/lib/ai/prompts";
import { getOpenAI } from "@/lib/ai/openai";

export async function classifyArticle(
  headline: string,
  content: string,
): Promise<PropheticAnalysis> {
  const openai = getOpenAI();
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: HEBREW_ISRAELITE_SYSTEM_PROMPT },
      {
        role: "user",
        content: `Analyze this article and return a JSON object matching the PropheticAnalysis schema:

Headline: ${headline}

Content: ${content.slice(0, 8000)}

Return ONLY valid JSON, no additional text.`,
      },
    ],
    response_format: { type: "json_object" },
    temperature: 0.7,
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
          "You are a prophetic relevance filter. Respond only with YES or NO.",
      },
      {
        role: "user",
        content: `Does this article have ANY relevance to biblical prophecy from a Hebrew Israelite framework?\n\nHeadline: ${headline}\n\nSnippet: ${snippet}\n\nRespond with only YES or NO.`,
      },
    ],
    temperature: 0.3,
  });

  const answer = response.choices[0]?.message?.content?.trim().toUpperCase();
  return answer === "YES";
}
