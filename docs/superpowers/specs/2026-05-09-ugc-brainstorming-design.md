# UGC Soft-Selling Brainstorming Tool - Design Specification

**Date:** 2026-05-09  
**Author:** AI Assistant  
**Status:** Ready for Implementation

---

## 1. Overview

### 1.1 Purpose

Tool untuk content creator Indonesia yang ingin membuat konten UGC soft-selling - skit/drama yang terlihat seperti pure entertainment tapi sebenarnya mempromosikan produk secara halus dan natural.

### 1.2 Target User

Content creator individu yang membuat konten untuk TikTok, Instagram Reels, dan YouTube Shorts.

### 1.3 Core Value Proposition

- **Input:** Informasi produk yang ingin dipromosikan
- **Output:** Ide skit kreatif yang menyembunyikan promosi dalam konten entertainment
- **Bonus:** AI suggest trending topics yang bisa dipadukan dengan produk untuk meningkatkan virality

### 1.4 Example Use Cases

1. **AI Meeting Tool:** Skit dimana seseorang membaca jawaban AI tapi malah kebaca intro-nya "begini jawaban dari pertanyaan..." - kesalahan lucu yang reveal toolnya
2. **ElevenLabs Voice Cloning:** Drama dimana teman kaget kenapa si A bisa lancar bahasa Inggris di videonya, padahal aslinya buruk - reveal pakai voice cloning
3. **AI Video Generator:** Parody adegan drama Korea nembak artis terkenal - reveal videonya AI generated

---

## 2. Architecture

### 2.1 Tech Stack

**Frontend:**
- React 18 + Vite
- Tailwind CSS
- React Beautiful DnD (Kanban drag-drop)

**Backend:**
- Vercel Serverless Functions (Node.js)
- Vercel Cron (scheduled jobs)

**Database:**
- Supabase (PostgreSQL)
- Supabase Storage (file uploads, future)

**AI:**
- Anthropic Claude API (claude-3-5-sonnet-20241022)

**Trend Scraping:**
- Google Trends: `google-trends-api` (unofficial)
- Reddit: Reddit API (gratis)
- YouTube: YouTube Data API v3 (gratis dengan quota)

**Hosting:**
- Vercel (frontend + serverless functions) - Free tier
- Supabase (database + storage) - Free tier (500MB DB, 1GB storage)

### 2.2 Deployment Strategy

**Free Tier Limits:**
- Vercel: Unlimited frontend hosting, 100GB-hours functions/month
- Supabase: 500MB database, 1GB storage, 2GB bandwidth
- Claude API: Pay-per-use (estimated $5-10/month untuk moderate usage)

**Scaling Plan:**
- Start with free tiers
- Monitor usage via Vercel Analytics & Supabase Dashboard
- Upgrade when hitting limits (unlikely untuk single user MVP)

---

## 3. Database Schema

### 3.1 Tables

```sql
-- Users (optional untuk MVP, bisa pakai Supabase Auth)
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
  
  -- Content info
  title TEXT NOT NULL,
  concept TEXT NOT NULL,
  
  -- Product info
  product_name TEXT NOT NULL,
  product_category TEXT NOT NULL,
  product_features TEXT NOT NULL,
  
  -- AI recommendations
  ai_recommended_platform TEXT, -- TikTok, Instagram, YouTube
  ai_recommended_tone TEXT, -- comedy, drama, relatable, absurd
  ai_recommended_duration TEXT, -- 15s, 30s, 60s
  ai_reasoning TEXT,
  
  -- Workflow
  status TEXT NOT NULL DEFAULT 'ideas', -- ideas, script_ready, in_production, published
  position INTEGER NOT NULL DEFAULT 0,
  tags TEXT[],
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trending Topics
CREATE TABLE trending_topics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source TEXT NOT NULL, -- google_trends, reddit, youtube
  title TEXT NOT NULL,
  description TEXT,
  url TEXT,
  category TEXT,
  country TEXT DEFAULT 'ID',
  score INTEGER DEFAULT 0,
  fetched_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '7 days'
);

-- Trend Suggestions (AI matching produk dengan trend)
CREATE TABLE trend_suggestions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content_idea_id UUID REFERENCES content_ideas(id) ON DELETE CASCADE,
  trending_topic_id UUID REFERENCES trending_topics(id) ON DELETE CASCADE,
  relevance_score FLOAT, -- 0-1
  ai_reasoning TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI Generation History (tracking & debugging)
CREATE TABLE ai_generations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  prompt_type TEXT NOT NULL, -- skit_ideation, trend_analysis
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
```

### 3.2 Data Relationships

```
users (1) ──< (many) content_ideas
content_ideas (1) ──< (many) trend_suggestions
trending_topics (1) ──< (many) trend_suggestions
users (1) ──< (many) ai_generations
```

---

## 4. API Endpoints

### 4.1 Content Ideas

**Generate New Skit Idea**
```
POST /api/ideas/generate
Body: {
  productName: string,
  productCategory: string,
  productFeatures: string
}
Response: {
  idea: {
    id: uuid,
    title: string,
    concept: string,
    productName: string,
    aiRecommendedPlatform: string,
    aiRecommendedTone: string,
    aiRecommendedDuration: string,
    aiReasoning: string,
    relatedTrends: [{ trendId, title, relevanceScore, reasoning }]
  }
}
```

**Get All Ideas**
```
GET /api/ideas?status=ideas&userId=xxx
Response: {
  ideas: [{ id, title, productName, status, platform, tags, createdAt }]
}
```

**Get Single Idea**
```
GET /api/ideas/:id
Response: {
  idea: { ...full details... }
}
```

**Update Idea**
```
PATCH /api/ideas/:id
Body: {
  status?: string,
  position?: number,
  title?: string,
  concept?: string,
  tags?: string[]
}
Response: {
  idea: { ...updated idea... }
}
```

**Delete Idea**
```
DELETE /api/ideas/:id
Response: { success: true }
```

### 4.2 Trending Topics

**Get Trends**
```
GET /api/trends?source=google_trends&category=entertainment&limit=20
Response: {
  trends: [{ id, source, title, description, url, category, score, fetchedAt }]
}
```

**Suggest Trends for Product**
```
POST /api/trends/suggest
Body: {
  productName: string,
  productCategory: string
}
Response: {
  suggestions: [{ trend, relevanceScore, reasoning }]
}
```

### 4.3 Cron Jobs

**Fetch Trends (Scheduled)**
```
GET /api/cron/fetch-trends
Scheduled: Every 6 hours via Vercel Cron
Process:
  1. Fetch Google Trends (Indonesia, last 24h)
  2. Fetch Reddit trending (r/indonesia, r/funny, hot posts)
  3. Fetch YouTube trending (ID region, top 20)
  4. Save new trends to database
  5. Update scores for existing trends
  6. Delete trends where expires_at < NOW()
Response: { 
  fetched: { google: 10, reddit: 15, youtube: 20 },
  deleted: 5
}
```

---

## 5. AI Integration

### 5.1 Skit Ideation Prompt

**System Prompt:**
```
Kamu adalah seorang kreator konten UGC yang ahli dalam membuat konten soft-selling melalui hiburan.

Informasi Produk:
- Nama: {productName}
- Kategori: {productCategory}
- Fitur Utama: {productFeatures}

Trending Topics (opsional):
{relatedTrends}

Tugas: Generate SATU ide skit kreatif yang:
1. Terlihat seperti konten hiburan murni (komedi/drama/relatable)
2. Mempromosikan produk secara halus TANPA terlihat seperti iklan
3. Produk harus terasa natural dalam cerita, tidak dipaksakan
4. Harus punya hook/twist yang bikin orang mau share

Format output (JSON):
{
  "title": "Judul singkat yang catchy",
  "concept": "Deskripsi skit 1-2 paragraf dalam bahasa Indonesia",
  "platform": "TikTok/Instagram/YouTube",
  "tone": "comedy/drama/relatable/absurd",
  "duration": "15s/30s/60s",
  "reasoning": "Kenapa pendekatan ini efektif untuk soft-selling",
  "hookType": "plot-twist/misunderstanding/before-after/reaction"
}

Contoh soft-selling yang bagus:
- AI meeting tool: Orang baca jawaban AI tapi malah kebaca intro-nya "begini jawaban dari pertanyaan..." (kesalahan lucu yang reveal toolnya)
- Voice cloning: Teman kaget kok bisa lancar bahasa Inggris, ternyata pakai voice cloning (drama + reveal produk)
- Video generator: Parody adegan drama Korea nembak artis, reveal videonya AI generated (komedi + showcase produk)

Buat konten yang terasa autentik dan natural untuk audience Indonesia. Gunakan referensi budaya pop Indonesia kalau relevan. Jangan buat yang terasa seperti iklan.
```

**API Call:**
```javascript
const response = await anthropic.messages.create({
  model: 'claude-3-5-sonnet-20241022',
  max_tokens: 1024,
  messages: [{
    role: 'user',
    content: systemPrompt
  }]
});
```

### 5.2 Trend Matching Prompt

**System Prompt:**
```
Analisis trending topics ini dan sarankan mana yang bisa diintegrasikan secara natural dengan produk ini untuk konten UGC soft-selling.

Produk: {productName} - {productCategory}
Fitur: {productFeatures}

Trending Topics:
{trendsList}

Untuk setiap trend yang relevan, berikan:
- Relevance score (0-1)
- Alasan singkat kenapa cocok
- Sudut pandang yang disarankan untuk integrasi

Output dalam format JSON array. Gunakan bahasa Indonesia untuk reasoning.

Format:
[
  {
    "trendId": "uuid",
    "relevanceScore": 0.85,
    "reasoning": "Alasan kenapa trend ini cocok...",
    "suggestedAngle": "Cara mengintegrasikan trend ke skit..."
  }
]
```

### 5.3 Error Handling

**Timeout (>30s):**
- Show error: "AI generation timeout, silakan coba lagi"
- Allow retry button

**Invalid JSON Response:**
- Try to parse with fallback regex
- If fails: regenerate automatically (max 2 retries)
- If still fails: show error dengan option manual input

**Rate Limit:**
- Queue request dengan exponential backoff
- Show message: "Banyak request, coba lagi dalam {X} menit"

**Poor Quality Output:**
- Validate output: concept length > 50 chars, has required fields
- If invalid: automatic regenerate (max 2 retries)

---

## 6. User Flow

### 6.1 Main Journey

**Step 1: Dashboard**
```
┌─────────────────────────────────────────┐
│  UGC Brainstorming Tool                 │
├─────────────────────────────────────────┤
│  Stats:                                 │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐  │
│  │ 12   │ │  3   │ │  5   │ │  4   │  │
│  │Ideas │ │Script│ │Prod. │ │Pub.  │  │
│  └──────┘ └──────┘ └──────┘ └──────┘  │
│                                         │
│  [Generate New Skit Idea] (Big CTA)    │
│                                         │
│  Trending Topics (Preview):             │
│  🔥 Drama Korea baru viral              │
│  🔥 AI tools trending di Twitter        │
│  🔥 Meme template baru                  │
│  [View All Trends →]                    │
└─────────────────────────────────────────┘
```

**Step 2: Generate Idea Form**
```
User fills:
- Product Name (text input)
- Product Category (dropdown)
- Key Features (textarea, 2-3 bullet points)

Click "Generate Idea" →
  Show loading (15-30s) →
  AI generates idea →
  Show preview
```

**Step 3: Idea Preview**
```
Display:
- Title
- Concept (1-2 paragraf)
- Recommended Platform (badge)
- Recommended Tone (badge)
- Duration (badge)
- Why This Works (AI reasoning)
- Related Trends (if any)

Actions:
- [Regenerate] → back to Step 2 with same input
- [Save to Kanban] → save & redirect to kanban
- [Discard] → delete & back to dashboard
```

**Step 4: Kanban Board**
```
4 columns: Ideas → Script Ready → In Production → Published

Each card shows:
- Title
- Product name (badge)
- Platform icon
- Tags

Drag & drop to move between columns
Click card → open detail modal
```

### 6.2 Trending Topics Flow

```
User clicks "View All Trends" →
  Show trends page with tabs:
  - Google Trends
  - Reddit
  - YouTube

Filter by category (entertainment, tech, lifestyle, dll)

Each trend card:
- Title & description
- Source & timestamp
- [Use This Trend] button →
  Open generate form with trend pre-selected
```

---

## 7. Component Structure

### 7.1 Pages

```
src/pages/
├── Dashboard.jsx          // Landing dengan stats & CTA
├── GenerateIdea.jsx       // Form input + AI generation
├── KanbanBoard.jsx        // Main kanban board
├── TrendingTopics.jsx     // Browse trends
└── IdeaDetail.jsx         // Detail modal
```

### 7.2 Components

```
src/components/
├── layout/
│   ├── Navbar.jsx
│   └── Sidebar.jsx
│
├── kanban/
│   ├── KanbanColumn.jsx
│   ├── IdeaCard.jsx
│   └── CardDetailModal.jsx
│
├── generate/
│   ├── ProductForm.jsx
│   ├── GeneratingLoader.jsx
│   └── IdeaPreview.jsx
│
├── trends/
│   ├── TrendCard.jsx
│   ├── TrendFilter.jsx
│   └── TrendTabs.jsx
│
└── common/
    ├── Button.jsx
    ├── Badge.jsx
    ├── LoadingSpinner.jsx
    └── EmptyState.jsx
```

---

## 8. UI/UX Design

### 8.1 Design System

**Color Palette:**
- Primary: Indigo (#6366F1) - CTA & highlights
- Secondary: Purple (#A855F7) - AI features
- Success: Green (#10B981) - published status
- Warning: Orange (#F59E0B) - in production
- Neutral: Gray scale (#1F2937 to #F9FAFB)

**Typography:**
- Headings: Inter Bold
- Body: Inter Regular
- Code/Tags: JetBrains Mono

**Spacing:**
- Tailwind default (4px base)
- Card padding: p-4 atau p-6
- Section gaps: gap-6 atau gap-8

### 8.2 Responsive Design

**Desktop (>1024px):**
- Full kanban: 4 kolom side-by-side
- Sidebar navigation

**Tablet (768-1024px):**
- Kanban: 2 kolom per row
- Collapsible sidebar

**Mobile (<768px):**
- Kanban: Single column, swipeable tabs
- Bottom navigation

### 8.3 Key Interactions

**Kanban Drag & Drop:**
- Smooth animation (200ms)
- Visual feedback (shadow, opacity)
- Optimistic UI update
- Rollback on error

**AI Generation:**
- Progress indicator dengan estimated time
- Animated dots atau spinner
- Cancel button (abort request)

**Empty States:**
- Friendly illustration
- Clear CTA
- Example/tutorial link

---

## 9. Data Flow

### 9.1 Generate Skit Idea

```
1. User submit ProductForm
   ↓
2. Frontend POST /api/ideas/generate
   ↓
3. Backend:
   a. Query trending_topics (last 7 days, ORDER BY score DESC LIMIT 10)
   b. Build AI prompt dengan product info + trends
   c. Call Claude API
   d. Parse JSON response
   e. Save to content_ideas (status: 'ideas')
   f. If trends relevant: save to trend_suggestions
   ↓
4. Frontend receive generated idea
   ↓
5. Show IdeaPreview
   ↓
6. User action:
   - Regenerate: repeat from step 2
   - Save: redirect to kanban (already saved)
   - Discard: DELETE /api/ideas/:id
```

### 9.2 Kanban Drag & Drop

```
1. User drag card from column A to column B
   ↓
2. React Beautiful DnD trigger onDragEnd
   ↓
3. Frontend:
   a. Optimistic update (immediate UI change)
   b. PATCH /api/ideas/:id { status, position }
   ↓
4. Backend:
   a. Update content_ideas SET status, position, updated_at
   b. Return updated idea
   ↓
5. Frontend:
   a. If success: keep optimistic update
   b. If error: rollback UI, show error toast
```

### 9.3 Trend Scraping (Background)

```
Vercel Cron (every 6 hours)
   ↓
GET /api/cron/fetch-trends
   ↓
1. Fetch Google Trends:
   - Use google-trends-api
   - Region: ID (Indonesia)
   - Period: last 24h
   - Parse results
   ↓
2. Fetch Reddit:
   - Subreddits: r/indonesia, r/funny, r/videos
   - Sort: hot
   - Limit: 20 per subreddit
   - Parse posts
   ↓
3. Fetch YouTube:
   - YouTube Data API v3
   - Region: ID
   - Chart: mostPopular
   - Limit: 20
   - Parse videos
   ↓
4. For each trend:
   - Check if exists: SELECT WHERE title = ? AND source = ?
   - If new: INSERT INTO trending_topics
   - If exists: UPDATE score, fetched_at
   ↓
5. Cleanup:
   - DELETE FROM trending_topics WHERE expires_at < NOW()
   ↓
6. Return summary: { fetched: {...}, deleted: N }
```

---

## 10. Error Handling

### 10.1 AI Generation Errors

**Timeout (>30s):**
- Error message: "AI generation timeout, silakan coba lagi"
- Retry button
- Log to ai_generations dengan status: 'timeout'

**Invalid JSON:**
- Try fallback parsing (regex extract)
- If fails: auto-regenerate (max 2 retries)
- If still fails: show error, allow manual retry

**Rate Limit:**
- Queue request dengan exponential backoff
- Show: "Banyak request, coba lagi dalam {X} menit"
- Log to ai_generations dengan status: 'rate_limited'

**Poor Quality:**
- Validate: concept.length > 50, has required fields
- If invalid: auto-regenerate (max 2 retries)
- Log to ai_generations untuk debugging

### 10.2 Trend Scraping Errors

**API Quota Exceeded:**
- Skip that source
- Continue with other sources
- Log warning

**Network Errors:**
- Retry dengan exponential backoff (max 3 attempts)
- If all fail: skip this cycle
- Alert admin via email/Slack (future)

**No New Trends:**
- Keep existing trends
- Log info message
- Continue normal operation

**Scraping Blocked:**
- Fallback to cached data
- Log error
- Alert admin

### 10.3 User Experience Errors

**Empty Kanban:**
- Show onboarding message
- CTA: "Generate Your First Idea"
- Link to tutorial/example

**No Trending Topics:**
- Show: "Trends updating soon..."
- Manual refresh button
- Show last update timestamp

**Slow AI Generation:**
- Progress indicator
- Estimated time: "15-30 detik"
- Cancel button

**Drag & Drop Conflicts:**
- Optimistic UI update
- Rollback on API error
- Show error toast

### 10.4 Data Validation

**Product Form:**
- Product name: 2-100 chars, required
- Product category: must be from dropdown
- Product features: 10-500 chars, required

**Prevent Duplicates:**
- Check similar title + product name before save
- If similar exists: ask user "Ide serupa sudah ada, tetap simpan?"

---

## 11. Performance Optimization

### 11.1 Frontend

**Code Splitting:**
- React.lazy() untuk pages
- Dynamic imports untuk heavy components

**Virtualization:**
- react-window untuk kanban jika >50 cards per column

**Debouncing:**
- Search/filter inputs: 300ms debounce

**Caching:**
- Cache AI generations di localStorage (prevent accidental regenerate)
- Cache trending topics di memory (5 min TTL)

### 11.2 Backend

**Database Indexes:**
```sql
CREATE INDEX idx_content_ideas_user_status ON content_ideas(user_id, status);
CREATE INDEX idx_content_ideas_status_position ON content_ideas(status, position);
CREATE INDEX idx_trending_topics_source_fetched ON trending_topics(source, fetched_at DESC);
CREATE INDEX idx_trending_topics_expires ON trending_topics(expires_at);
```

**Query Optimization:**
- Use SELECT specific columns, not SELECT *
- Limit results dengan LIMIT clause
- Use prepared statements

**Caching:**
- Cache trending topics di memory (5 min TTL)
- Use Vercel Edge Caching untuk static assets

**Batch Operations:**
- Batch INSERT untuk trend scraping
- Use transactions untuk multi-step operations

### 11.3 AI Optimization

**Model Selection:**
- Use Claude Sonnet (balance speed & quality)
- Avoid Opus (slower, more expensive)

**Prompt Caching:**
- Implement prompt caching untuk system prompt
- Cache TTL: 5 minutes

**Response Streaming:**
- Future enhancement: stream AI responses
- Show partial results as they arrive

---

## 12. Security Considerations

### 12.1 API Security

**Authentication:**
- Use Supabase Auth (JWT tokens)
- Verify token pada setiap API call
- Rate limiting per user

**Input Validation:**
- Sanitize user inputs
- Validate data types & lengths
- Prevent SQL injection (use parameterized queries)

**API Keys:**
- Store di environment variables
- Never expose di frontend
- Rotate keys regularly

### 12.2 Data Privacy

**User Data:**
- Minimal data collection
- Clear privacy policy
- GDPR compliance (future)

**AI Generations:**
- Don't log sensitive product info
- Anonymize data untuk analytics

---

## 13. Testing Strategy

### 13.1 Unit Tests

**Frontend:**
- Component rendering tests (Jest + React Testing Library)
- Form validation tests
- Utility function tests

**Backend:**
- API endpoint tests (Jest + Supertest)
- Database query tests
- AI prompt parsing tests

### 13.2 Integration Tests

**E2E Flow:**
- Generate idea flow (Playwright)
- Kanban drag & drop
- Trend browsing

**API Integration:**
- Test with real Supabase instance
- Mock Claude API responses

### 13.3 Manual Testing

**User Acceptance:**
- Test all user flows
- Check responsive design
- Verify AI output quality

**Performance:**
- Load testing (Artillery)
- Monitor API response times
- Check database query performance

---

## 14. Deployment Plan

### 14.1 Environment Setup

**Development:**
- Local Supabase instance (Docker)
- Mock Claude API responses
- Vercel dev server

**Staging:**
- Vercel preview deployment
- Supabase staging project
- Real Claude API (limited quota)

**Production:**
- Vercel production deployment
- Supabase production project
- Real Claude API (full quota)

### 14.2 CI/CD Pipeline

**GitHub Actions:**
```yaml
on: [push, pull_request]
jobs:
  test:
    - Run unit tests
    - Run integration tests
    - Check code coverage
  
  deploy:
    - Deploy to Vercel (auto for main branch)
    - Run smoke tests
    - Notify team
```

### 14.3 Monitoring

**Vercel Analytics:**
- Page views
- API response times
- Error rates

**Supabase Dashboard:**
- Database size
- Query performance
- Connection pool usage

**Custom Logging:**
- AI generation success/failure rates
- Trend scraping status
- User activity metrics

---

## 15. Future Enhancements

### 15.1 Phase 2 Features

**Script Generator:**
- From idea → full script dengan dialog
- Scene breakdown
- Shot list

**Collaboration:**
- Share ideas dengan team
- Comments & feedback
- Version history

**Analytics:**
- Track which ideas perform best
- A/B testing different approaches
- ROI tracking

### 15.2 Phase 3 Features

**Content Library:**
- Database of successful UGC examples
- Filter by product type, platform, tone
- User-submitted examples

**AI Improvements:**
- Multi-variation generation (3-5 ideas at once)
- Style transfer (mimic successful creators)
- Trend prediction (predict next viral topics)

**Integrations:**
- TikTok/IG API untuk auto-post
- Analytics integration (track performance)
- CRM integration (track conversions)

---

## 16. Success Metrics

### 16.1 MVP Success Criteria

**User Engagement:**
- 10+ ideas generated per week
- 50%+ ideas moved to "Script Ready" or beyond
- 5+ published content per month

**AI Quality:**
- 80%+ ideas accepted (not regenerated)
- Average concept length: 100-200 words
- User satisfaction: 4/5 stars

**Technical Performance:**
- API response time: <2s (p95)
- AI generation time: <30s (p95)
- Uptime: >99%

### 16.2 Long-term Metrics

**Growth:**
- Monthly active users
- Ideas generated per user
- Retention rate (30-day)

**Business:**
- Conversion rate (free → paid, future)
- Revenue per user (future)
- Customer acquisition cost

---

## 17. Risks & Mitigations

### 17.1 Technical Risks

**AI Quality Issues:**
- Risk: AI generates poor/irrelevant ideas
- Mitigation: Prompt engineering, quality validation, user feedback loop

**API Quota Limits:**
- Risk: Hit free tier limits
- Mitigation: Monitor usage, implement caching, upgrade plan if needed

**Scraping Failures:**
- Risk: Trend sources block scraping
- Mitigation: Multiple sources, fallback to cached data, manual curation

### 17.2 Business Risks

**Low User Adoption:**
- Risk: Users don't find value
- Mitigation: User interviews, iterate on features, improve onboarding

**Competition:**
- Risk: Similar tools emerge
- Mitigation: Focus on niche (UGC soft-selling), build community, iterate fast

**Cost Overruns:**
- Risk: AI API costs exceed budget
- Mitigation: Monitor usage, implement rate limiting, optimize prompts

---

## 18. Conclusion

This design provides a complete blueprint for building a UGC soft-selling brainstorming tool. The architecture is optimized for free-tier hosting while maintaining scalability for future growth.

**Key Strengths:**
- Clear value proposition for Indonesian content creators
- AI-powered ideation dengan cultural context
- Trend integration untuk increased virality
- Simple workflow (input produk → get ide → track di kanban)
- Free hosting dengan room to scale

**Next Steps:**
1. Review & approve this design
2. Create implementation plan
3. Set up development environment
4. Begin implementation

---

**End of Design Document**
