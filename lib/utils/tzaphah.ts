import { COLORS } from "@/lib/constants/colors";
import type { UrgencyLevel } from "@/lib/types/article";

const urgencyWeight: Record<UrgencyLevel, number> = {
  COVENANT_ALARM: 4,
  SIGNIFICANT_SIGN: 3,
  WORTHY_OF_WATCH: 2,
  MONITORING: 1,
};

export interface TzaphahInputArticle {
  urgency_level: UrgencyLevel | null;
  watch_level: number | null;
}

export function computeTzaphahScore(articles: TzaphahInputArticle[]): number {
  if (articles.length === 0) return 0;
  let sum = 0;
  for (const a of articles) {
    const u = a.urgency_level ? urgencyWeight[a.urgency_level] : 0.5;
    const w = a.watch_level != null ? a.watch_level / 10 : 0.5;
    sum += u * (0.5 + w * 0.5);
  }
  const raw = (sum / articles.length) * 25;
  return Math.min(100, Math.round(raw * 10) / 10);
}

export function urgencyToColor(level: UrgencyLevel | null | undefined): string {
  if (!level) return COLORS.urgency.MONITORING;
  return COLORS.urgency[level];
}

/** Dot / border color when urgency not set yet or pipeline state. */
export function resolveArticleUrgencyColor(
  urgency: UrgencyLevel | null | undefined,
  analysisStatus: string | null | undefined,
): string {
  if (urgency) return urgencyToColor(urgency);
  const s = analysisStatus ?? "";
  if (s === "QUEUED" || s === "PENDING") return COLORS.accent.primary;
  if (s === "FAILED") return COLORS.accent.crimson;
  return COLORS.urgency.MONITORING;
}
