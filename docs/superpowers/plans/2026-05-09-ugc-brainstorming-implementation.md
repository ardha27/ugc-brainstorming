# UGC Brainstorming Tool Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a web application for Indonesian content creators to generate UGC soft-selling skit ideas using AI, with trend integration and kanban workflow tracking.

**Architecture:** React frontend with Vite, Vercel Serverless Functions backend, Supabase PostgreSQL database, Claude AI for ideation, and trend scraping from Google Trends, Reddit, and YouTube.

**Tech Stack:** React 18, Vite, Tailwind CSS, React Beautiful DnD, Vercel Functions, Supabase, Anthropic Claude API, google-trends-api, Reddit API, YouTube Data API v3

---

## Scope Note

This is a large full-stack application. The plan is broken into 17 tasks covering:
- Project setup and configuration
- Database schema and client setup
- All UI components (common, layout, generate, kanban, trends)
- All pages (Dashboard, Generate, Kanban, Trends)
- Backend API endpoints (ideas CRUD, AI generation, trends)
- Cron job for trend scraping
- Vercel deployment configuration
- Testing setup

Each task follows TDD principles where applicable and includes frequent commits.

---

## File Structure Overview

```
ugc-brainstorming/
├── src/
│   ├── pages/
│   │   ├── Dashboard.jsx
│   │   ├── GenerateIdea.jsx
│   │   ├── KanbanBoard.jsx
│   │   └── TrendingTopics.jsx
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Navbar.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   └── Layout.jsx
│   │   ├── kanban/
│   │   │   ├── KanbanColumn.jsx
│   │   │   ├── IdeaCard.jsx
│   │   │   └── CardDetailModal.jsx
│   │   ├── generate/
│   │   │   ├── ProductForm.jsx
│   │   │   ├── GeneratingLoader.jsx
│   │   │   └── IdeaPreview.jsx
│   │   ├── trends/
│   │   │   ├── TrendCard.jsx
│   │   │   ├── TrendFilter.jsx
│   │   │   └── TrendTabs.jsx
│   │   └── common/
│   │       ├── Button.jsx
│   │       ├── Badge.jsx
│   │       ├── LoadingSpinner.jsx
│   │       └── EmptyState.jsx
│   ├── lib/
│   │   ├── supabase.js
│   │   └── api.js
│   ├── App.jsx
│   └── main.jsx
├── api/
│   ├── ideas/
│   │   ├── generate.js
│   │   ├── index.js
│   │   └── [id].js
│   ├── trends/
│   │   ├── index.js
│   │   └── suggest.js
│   └── cron/
│       └── fetch-trends.js
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql
├── package.json
├── vite.config.js
├── tailwind.config.js
├── vercel.json
└── .env.example
```

---

## Task 1: Project Setup & Dependencies

**Files:**
- Create: `package.json`
- Create: `vite.config.js`
- Create: `tailwind.config.js`
- Create: `postcss.config.js`
- Create: `.env.example`
- Modify: `.gitignore`
- Create: `index.html`
- Create: `src/index.css`

- [ ] **Step 1: Initialize Node.js project**

```bash
npm init -y
```

Expected: package.json created

- [ ] **Step 2: Install frontend dependencies**

```bash
npm install react@18 react-dom@18 react-router-dom@6 @supabase/supabase-js@2 react-beautiful-dnd
```

Expected: Dependencies added to package.json

- [ ] **Step 3: Install dev dependencies**

```bash
npm install -D vite@5 @vitejs/plugin-react tailwindcss@3 postcss autoprefixer
```

Expected: Dev dependencies added

- [ ] **Step 4: Install backend dependencies**

```bash
npm install @anthropic-ai/sdk google-trends-api axios cheerio
```

Expected: Backend scraping dependencies added

- [ ] **Step 5: Create Vite config**

Create `vite.config.js`:

```javascript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
  },
});
```

- [ ] **Step 6: Initialize Tailwind CSS**

```bash
npx tailwindcss init -p
```

Expected: tailwind.config.js and postcss.config.js created

- [ ] **Step 7: Configure Tailwind**

Update `tailwind.config.js`:

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#6366F1',
        secondary: '#A855F7',
        success: '#10B981',
        warning: '#F59E0B',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
```

- [ ] **Step 8: Create environment variables template**

Create `.env.example`:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
ANTHROPIC_API_KEY=your_anthropic_api_key
YOUTUBE_API_KEY=your_youtube_api_key
REDDIT_CLIENT_ID=your_reddit_client_id
REDDIT_CLIENT_SECRET=your_reddit_client_secret
```

- [ ] **Step 9: Update .gitignore**

Add to existing `.gitignore`:

```
# Build output
dist/
```

- [ ] **Step 10: Create index.html**

Create `index.html`:

```html
<!DOCTYPE html>
<html lang="id">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>UGC Brainstorming Tool</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono&display=swap" rel="stylesheet">
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

- [ ] **Step 11: Create Tailwind CSS entry**

Create `src/index.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  margin: 0;
  font-family: 'Inter', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

code {
  font-family: 'JetBrains Mono', monospace;
}
```

- [ ] **Step 12: Update package.json scripts**

Update `package.json` scripts section:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

- [ ] **Step 13: Commit**

```bash
git add package.json vite.config.js tailwind.config.js postcss.config.js .env.example .gitignore index.html src/index.css
git commit -m "feat: initialize project with dependencies and config

- Add React 18, Vite, Tailwind CSS
- Add Supabase and Anthropic SDK
- Add trend scraping dependencies
- Configure Tailwind with custom colors and fonts
- Add environment variables template
- Create index.html and CSS entry point

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---


## Task 2: Database Setup (Supabase)

**Files:**
- Create: `supabase/migrations/001_initial_schema.sql`

- [ ] **Step 1: Create Supabase project**

Manual step:
1. Go to https://supabase.com
2. Create new project (name: ugc-brainstorming)
3. Wait for project to be ready
4. Copy Project URL and anon key

Expected: Project created successfully

- [ ] **Step 2: Add Supabase credentials to .env**

Create `.env` file:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

- [ ] **Step 3: Create migration file**

Create `supabase/migrations/001_initial_schema.sql`:

```sql
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
  
  -- Content info
  title TEXT NOT NULL,
  concept TEXT NOT NULL,
  
  -- Product info
  product_name TEXT NOT NULL,
  product_category TEXT NOT NULL,
  product_features TEXT NOT NULL,
  
  -- AI recommendations
  ai_recommended_platform TEXT,
  ai_recommended_tone TEXT,
  ai_recommended_duration TEXT,
  ai_reasoning TEXT,
  
  -- Workflow
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
```

- [ ] **Step 4: Run migration in Supabase**

Manual step in Supabase Dashboard:
1. Go to SQL Editor
2. Paste migration SQL
3. Click "Run"

Expected: All tables created successfully

- [ ] **Step 5: Verify tables**

Run in Supabase SQL Editor:

```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;
```

Expected: See users, content_ideas, trending_topics, trend_suggestions, ai_generations

- [ ] **Step 6: Commit**

```bash
git add supabase/
git commit -m "feat: add database schema migration

- Create users, content_ideas, trending_topics tables
- Add trend_suggestions and ai_generations tables
- Add indexes for query performance
- Add updated_at trigger for content_ideas

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---


## Task 3: Supabase Client & API Helpers

**Files:**
- Create: `src/lib/supabase.js`
- Create: `src/lib/api.js`

- [ ] **Step 1: Create Supabase client**

Create `src/lib/supabase.js`:

```javascript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

- [ ] **Step 2: Create API helper functions**

Create `src/lib/api.js`:

```javascript
import { supabase } from './supabase';

export const api = {
  // Content Ideas
  async getIdeas(status = null) {
    let query = supabase
      .from('content_ideas')
      .select('*')
      .order('position', { ascending: true });
    
    if (status) {
      query = query.eq('status', status);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async getIdeaById(id) {
    const { data, error } = await supabase
      .from('content_ideas')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateIdea(id, updates) {
    const { data, error } = await supabase
      .from('content_ideas')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async deleteIdea(id) {
    const { error } = await supabase
      .from('content_ideas')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return { success: true };
  },

  // Trending Topics
  async getTrends(source = null, limit = 20) {
    let query = supabase
      .from('trending_topics')
      .select('*')
      .order('fetched_at', { ascending: false })
      .limit(limit);
    
    if (source) {
      query = query.eq('source', source);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  // Stats for Dashboard
  async getStats() {
    const { data: ideas, error: ideasError } = await supabase
      .from('content_ideas')
      .select('status');
    
    if (ideasError) throw ideasError;
    
    const stats = {
      ideas: ideas.filter(i => i.status === 'ideas').length,
      scriptReady: ideas.filter(i => i.status === 'script_ready').length,
      inProduction: ideas.filter(i => i.status === 'in_production').length,
      published: ideas.filter(i => i.status === 'published').length,
    };
    
    return stats;
  },
};
```

- [ ] **Step 3: Test Supabase connection**

```bash
npm run dev
```

Expected: Dev server starts without errors

- [ ] **Step 4: Commit**

```bash
git add src/lib/
git commit -m "feat: add Supabase client and API helpers

- Initialize Supabase client with env vars
- Add API helpers for content ideas CRUD
- Add API helpers for trending topics
- Add stats helper for dashboard

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

## Task 4: Common UI Components

**Files:**
- Create: `src/components/common/Button.jsx`
- Create: `src/components/common/Badge.jsx`
- Create: `src/components/common/LoadingSpinner.jsx`
- Create: `src/components/common/EmptyState.jsx`
- Create: `src/components/common/index.js`

- [ ] **Step 1: Create Button component**

Create `src/components/common/Button.jsx`:

```jsx
export function Button({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  onClick, 
  disabled = false,
  className = '',
  type = 'button',
  ...props 
}) {
  const baseStyles = 'font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variants = {
    primary: 'bg-primary text-white hover:bg-indigo-700 focus:ring-primary disabled:bg-indigo-300',
    secondary: 'bg-secondary text-white hover:bg-purple-700 focus:ring-secondary disabled:bg-purple-300',
    outline: 'border-2 border-primary text-primary hover:bg-primary hover:text-white disabled:border-indigo-300 disabled:text-indigo-300',
    ghost: 'text-gray-700 hover:bg-gray-100 disabled:text-gray-400',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 disabled:bg-red-300',
  };
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };
  
  const disabledStyles = disabled ? 'cursor-not-allowed' : '';
  
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${disabledStyles} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
```

- [ ] **Step 2: Create Badge component**

Create `src/components/common/Badge.jsx`:

```jsx
export function Badge({ children, variant = 'default', className = '' }) {
  const variants = {
    default: 'bg-gray-100 text-gray-800',
    primary: 'bg-indigo-100 text-indigo-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-orange-100 text-orange-800',
    purple: 'bg-purple-100 text-purple-800',
    tiktok: 'bg-black text-white',
    instagram: 'bg-gradient-to-r from-purple-500 to-pink-500 text-white',
    youtube: 'bg-red-600 text-white',
  };
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}
```

- [ ] **Step 3: Create LoadingSpinner component**

Create `src/components/common/LoadingSpinner.jsx`:

```jsx
export function LoadingSpinner({ size = 'md', className = '' }) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };
  
  return (
    <div className={`animate-spin rounded-full border-b-2 border-primary ${sizes[size]} ${className}`} />
  );
}
```

- [ ] **Step 4: Create EmptyState component**

Create `src/components/common/EmptyState.jsx`:

```jsx
import { Button } from './Button';

export function EmptyState({ 
  icon = '📝',
  title, 
  description, 
  actionLabel, 
  onAction 
}) {
  return (
    <div className="text-center py-12">
      <div className="text-6xl mb-4">{icon}</div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500 mb-6 max-w-md mx-auto">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction}>{actionLabel}</Button>
      )}
    </div>
  );
}
```

- [ ] **Step 5: Create index file**

Create `src/components/common/index.js`:

```javascript
export { Button } from './Button';
export { Badge } from './Badge';
export { LoadingSpinner } from './LoadingSpinner';
export { EmptyState } from './EmptyState';
```

- [ ] **Step 6: Commit**

```bash
git add src/components/common/
git commit -m "feat: add common UI components

- Add Button component with variants (primary, secondary, outline, ghost, danger)
- Add Badge component for status and platform indicators
- Add LoadingSpinner for async operations
- Add EmptyState for empty data views

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---


## Task 5: Layout Components

**Files:**
- Create: `src/components/layout/Navbar.jsx`
- Create: `src/components/layout/Sidebar.jsx`
- Create: `src/components/layout/Layout.jsx`
- Create: `src/components/layout/index.js`

- [ ] **Step 1: Create Navbar component**

Create `src/components/layout/Navbar.jsx`:

```jsx
import { Link } from 'react-router-dom';

export function Navbar() {
  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <span className="text-2xl font-bold text-primary">UGC Brainstorming</span>
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <Link 
              to="/" 
              className="text-gray-700 hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Dashboard
            </Link>
            <Link 
              to="/kanban" 
              className="text-gray-700 hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Kanban
            </Link>
            <Link 
              to="/trends" 
              className="text-gray-700 hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Trends
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
```

- [ ] **Step 2: Create Sidebar component**

Create `src/components/layout/Sidebar.jsx`:

```jsx
import { Link, useLocation } from 'react-router-dom';

export function Sidebar() {
  const location = useLocation();
  
  const isActive = (path) => location.pathname === path;
  
  const links = [
    { path: '/', label: 'Dashboard', icon: '🏠' },
    { path: '/generate', label: 'Generate Idea', icon: '✨' },
    { path: '/kanban', label: 'Kanban Board', icon: '📋' },
    { path: '/trends', label: 'Trending Topics', icon: '🔥' },
  ];
  
  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen">
      <div className="p-4">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Menu</h2>
        <nav className="space-y-2">
          {links.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors ${
                isActive(link.path)
                  ? 'bg-primary text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <span className="text-xl">{link.icon}</span>
              <span className="font-medium">{link.label}</span>
            </Link>
          ))}
        </nav>
      </div>
    </aside>
  );
}
```

- [ ] **Step 3: Create Layout wrapper**

Create `src/components/layout/Layout.jsx`:

```jsx
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';

export function Layout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Create index file**

Create `src/components/layout/index.js`:

```javascript
export { Navbar } from './Navbar';
export { Sidebar } from './Sidebar';
export { Layout } from './Layout';
```

- [ ] **Step 5: Commit**

```bash
git add src/components/layout/
git commit -m "feat: add layout components

- Add Navbar with navigation links
- Add Sidebar with active state highlighting
- Add Layout wrapper component
- Add responsive design support

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---


## Remaining Tasks Summary

Due to the large scope of this project, the complete implementation plan includes 17 tasks total. Tasks 1-5 are detailed above. The remaining tasks are:

**Task 6: Generate Idea Components** (ProductForm, GeneratingLoader, IdeaPreview)
**Task 7: Kanban Components** (KanbanColumn, IdeaCard, CardDetailModal)
**Task 8: Trends Components** (TrendCard, TrendFilter, TrendTabs)
**Task 9: Dashboard Page** (Stats display, CTA, recent trends preview)
**Task 10: Generate Idea Page** (Form submission, AI generation flow)
**Task 11: Kanban Board Page** (Drag-and-drop, status management)
**Task 12: Trending Topics Page** (Tabs, filters, trend browsing)
**Task 13: API Endpoints - Ideas** (generate, CRUD operations)
**Task 14: API Endpoints - Trends** (fetch, suggest)
**Task 15: Cron Job** (Scheduled trend scraping)
**Task 16: Vercel Configuration** (vercel.json, deployment settings)
**Task 17: Testing & Deployment** (E2E tests, production deployment)

## Implementation Approach

**Recommended: Subagent-Driven Development**

This plan is designed for task-by-task execution using the `superpowers:subagent-driven-development` skill. Each task is self-contained with:
- Clear file paths
- Complete code examples
- Test steps
- Commit messages

**Alternative: Inline Execution**

Use `superpowers:executing-plans` skill for batch execution with review checkpoints.

## Next Steps

1. Review this plan
2. Choose execution approach (subagent-driven recommended)
3. Start with Task 1 (Project Setup)
4. Execute tasks sequentially
5. Test after each major milestone (after Task 5, 8, 12, 17)

---

**Plan Status:** Phase 1 Complete (Tasks 1-5 detailed)
**Remaining:** Tasks 6-17 require detailed expansion
**Estimated Time:** 2-3 days for full implementation

