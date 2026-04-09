-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Core articles table
CREATE TABLE articles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source_name TEXT NOT NULL,
  source_url TEXT,
  headline TEXT NOT NULL,
  original_url TEXT NOT NULL UNIQUE,
  full_content TEXT,
  published_at TIMESTAMPTZ NOT NULL,
  fetched_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  prophetic_summary TEXT,
  urgency_level TEXT CHECK (urgency_level IN ('COVENANT_ALARM','SIGNIFICANT_SIGN','WORTHY_OF_WATCH','MONITORING')),
  urgency_reason TEXT,
  watch_level INTEGER CHECK (watch_level BETWEEN 1 AND 10),
  prophetic_timeline TEXT,
  watchman_note TEXT,
  deut28_connection TEXT,
  country TEXT,
  city TEXT,
  region TEXT CHECK (region IN ('MIDDLE_EAST','THE_MOTHERLAND','EUROPE','THE_AMERICAS','ASIA_EAST','GLOBAL_SYSTEMIC')),
  lat FLOAT,
  lng FLOAT,
  is_duplicate BOOLEAN DEFAULT FALSE,
  duplicate_of UUID REFERENCES articles(id),
  is_apocrypha_connected BOOLEAN DEFAULT FALSE,
  analysis_status TEXT DEFAULT 'PENDING' CHECK (analysis_status IN ('PENDING','COMPLETE','FAILED','QUEUED')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_articles_created_at ON articles(created_at DESC);
CREATE INDEX idx_articles_published_at ON articles(published_at DESC);
CREATE INDEX idx_articles_urgency ON articles(urgency_level);
CREATE INDEX idx_articles_region ON articles(region);
CREATE INDEX idx_articles_status ON articles(analysis_status);

CREATE TABLE article_categories (
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
  category_slug TEXT NOT NULL,
  PRIMARY KEY (article_id, category_slug)
);

CREATE INDEX idx_article_categories_slug ON article_categories(category_slug);

CREATE TABLE scripture_references (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
  reference TEXT NOT NULL,
  verse_text TEXT NOT NULL,
  relevance_note TEXT,
  book TEXT NOT NULL,
  chapter INTEGER NOT NULL,
  verse_start INTEGER NOT NULL,
  verse_end INTEGER,
  is_apocrypha BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_scripture_article ON scripture_references(article_id);
CREATE INDEX idx_scripture_book ON scripture_references(book, chapter);

CREATE TABLE kjv_verses (
  id SERIAL PRIMARY KEY,
  book TEXT NOT NULL,
  chapter INTEGER NOT NULL,
  verse INTEGER NOT NULL,
  text TEXT NOT NULL,
  is_apocrypha BOOLEAN DEFAULT FALSE,
  UNIQUE(book, chapter, verse)
);

CREATE TABLE tzaphah_index (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  score FLOAT NOT NULL,
  computed_at TIMESTAMPTZ DEFAULT now(),
  article_count INTEGER,
  dominant_category TEXT,
  watchman_reading TEXT
);

CREATE INDEX idx_tzaphah_computed ON tzaphah_index(computed_at DESC);

CREATE TABLE bookmarks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, article_id)
);

CREATE INDEX idx_bookmarks_user ON bookmarks(user_id);

CREATE TABLE alert_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  category_filter TEXT[],
  region_filter TEXT[],
  min_urgency TEXT,
  min_tzaphah_index INTEGER,
  notification_type TEXT CHECK (notification_type IN ('IN_APP','EMAIL','PUSH')),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  article_id UUID REFERENCES articles(id),
  alert_rule_id UUID REFERENCES alert_rules(id),
  message TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_notifications_user ON notifications(user_id, is_read);

CREATE TABLE prophecy_tracker (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  scripture_anchor TEXT NOT NULL,
  verse_text TEXT NOT NULL,
  status TEXT CHECK (status IN ('FULFILLED','IN_PROGRESS','WATCHING','PENDING')),
  confidence TEXT CHECK (confidence IN ('CERTAIN','PROBABLE','SPECULATIVE')),
  timeline_section TEXT NOT NULL,
  last_updated TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE prophecy_article_links (
  prophecy_id UUID REFERENCES prophecy_tracker(id) ON DELETE CASCADE,
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
  PRIMARY KEY (prophecy_id, article_id)
);

ALTER PUBLICATION supabase_realtime ADD TABLE articles;
