import type { CategorySlug } from "@/lib/constants/categories";

export type UrgencyLevel =
  | "COVENANT_ALARM"
  | "SIGNIFICANT_SIGN"
  | "WORTHY_OF_WATCH"
  | "MONITORING";

export type AnalysisStatus = "PENDING" | "COMPLETE" | "FAILED" | "QUEUED";

export type Region =
  | "MIDDLE_EAST"
  | "THE_MOTHERLAND"
  | "EUROPE"
  | "THE_AMERICAS"
  | "ASIA_EAST"
  | "GLOBAL_SYSTEMIC";

export interface ScriptureRefRow {
  id: string;
  reference: string;
  verse_text: string;
  relevance_note: string | null;
  book: string;
  chapter: number;
  verse_start: number;
  verse_end: number | null;
  is_apocrypha: boolean;
}

export interface ArticleRow {
  id: string;
  source_name: string;
  source_url: string | null;
  headline: string;
  original_url: string;
  full_content: string | null;
  published_at: string;
  fetched_at: string;
  prophetic_summary: string | null;
  urgency_level: UrgencyLevel | null;
  urgency_reason: string | null;
  watch_level: number | null;
  prophetic_timeline: string | null;
  watchman_note: string | null;
  deut28_connection: string | null;
  country: string | null;
  city: string | null;
  region: Region | null;
  lat: number | null;
  lng: number | null;
  is_duplicate: boolean;
  duplicate_of: string | null;
  is_apocrypha_connected: boolean;
  analysis_status: AnalysisStatus;
  created_at: string;
  updated_at: string;
}

export interface ArticleWithRelations extends ArticleRow {
  categories: CategorySlug[];
  scripture_references: ScriptureRefRow[];
  urgency_color?: string;
}
