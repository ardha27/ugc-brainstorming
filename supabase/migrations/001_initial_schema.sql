-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (optional for MVP)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Content Ideas (Kanban cards)
CREATE TABLE content_ideas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  concept TEXT NOT NULL,
  product_name TEXT NOT NULL,
  product_category TEXT NOT NULL,
  product_features TEXT NOT NULL,
  ai_recommended_platform TEXT,
  ai_recommended_tone TEXT,
  ai_recommended_duration TEXT,
  ai_reasoning TEXT,
  status TEXT NOT NULL DEFAULT 'ideas',
  position INTEGER NOT NULL DEFAULT 0,
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trending Topics
CREATE TABLE trending_topics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  url TEXT,
  category TEXT,
  country TEXT DEFAULT 'ID',
  score INTEGER DEFAULT 0,
  fetched_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '7 days'
);

-- Trend Suggestions
CREATE TABLE trend_suggestions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content_idea_id UUID REFERENCES content_ideas(id) ON DELETE CASCADE,
  trending_topic_id UUID REFERENCES trending_topics(id) ON DELETE CASCADE,
  relevance_score FLOAT,
  ai_reasoning TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI Generation History
CREATE TABLE ai_generations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  prompt_type TEXT NOT NULL,
  input_data JSONB NOT NULL,
  output_data JSONB NOT NULL,
  model_used TEXT NOT NULL,
  tokens_used INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_content_ideas_user_status ON content_ideas(user_id, status);
CREATE INDEX idx_content_ideas_status_position ON content_ideas(status, position);
CREATE INDEX idx_trending_topics_source_fetched ON trending_topics(source, fetched_at DESC);
CREATE INDEX idx_trending_topics_expires ON trending_topics(expires_at);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to content_ideas
CREATE TRIGGER update_content_ideas_updated_at BEFORE UPDATE ON content_ideas
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
