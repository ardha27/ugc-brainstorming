import { createClient } from '@supabase/supabase-js';
import axios from 'axios';
import * as cheerio from 'cheerio';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fetchGoogleTrends() {
  try {
    // Use unofficial Google Trends API
    const googleTrends = await axios.get('https://trends.google.com/webapi/items', {
      params: {
        hl: 'id-ID',
        tz: 'Asia/Jakarta',
        cat: 'b',
        fi: '0',
        fs: '0',
        ge: 'ID',
        im: '1',
        ni: '1',
        q: '',
        sort: '0'
      }
    });

    const trends = [];

    // If API works, parse it
    if (googleTrends.data?.default?.trendingSearchesDays) {
      for (const day of googleTrends.data.default.trendingSearchesDays) {
        for (const trend of day.trendingSearches || []) {
          trends.push({
            source: 'google_trends',
            title: trend.title?.query || '',
            description: trend.articles?.[0]?.snippet || '',
            url: trend.articles?.[0]?.url || null,
            category: trend.categories?.[0] || null,
            country: 'ID',
            score: parseInt(trend.formattedTraffic?.replace(/[^0-9]/g, '')) || 0,
            fetched_at: new Date().toISOString(),
            expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
          });
        }
      }
    }

    return trends;
  } catch (error) {
    console.error('Google Trends fetch error:', error.message);
    return [];
  }
}

async function fetchRedditTrends() {
  try {
    // Use Reddit's official JSON endpoints (no auth required for public data)
    const subreddits = ['indonesia', 'indonesiadaily', 'raryosan', 'comedy'];
    const trends = [];

    for (const sub of subreddits) {
      const response = await axios.get(`https://www.reddit.com/r/${sub}/hot.json`, {
        params: { limit: 10 },
        headers: { 'User-Agent': 'UGC-Brainstorming/1.0' }
      });

      for (const post of response.data?.data?.children || []) {
        const data = post.data;
        trends.push({
          source: 'reddit',
          title: data.title,
          description: data.selftext?.substring(0, 200) || `r/${sub} - ${data.score} upvotes`,
          url: `https://reddit.com${data.permalink}`,
          category: sub,
          country: 'ID',
          score: data.score || 0,
          fetched_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        });
      }
    }

    // Sort by score and take top 20
    return trends.sort((a, b) => b.score - a.score).slice(0, 20);
  } catch (error) {
    console.error('Reddit fetch error:', error.message);
    return [];
  }
}

async function fetchYouTubeTrends() {
  try {
    if (!process.env.YOUTUBE_API_KEY) {
      console.log('YouTube API key not configured - skipping');
      return [];
    }

    const response = await axios.get('https://www.googleapis.com/youtube/v3/videos', {
      params: {
        part: 'snippet',
        chart: 'mostPopular',
        regionCode: 'ID',
        maxResults: 20,
        key: process.env.YOUTUBE_API_KEY
      }
    });

    const trends = [];

    for (const video of response.data.items || []) {
      trends.push({
        source: 'youtube',
        title: video.snippet.title,
        description: video.snippet.description?.substring(0, 200) || '',
        url: `https://youtube.com/watch?v=${video.id}`,
        category: video.snippet.categoryId || 'entertainment',
        country: 'ID',
        score: 100, // Placeholder score
        fetched_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      });
    }

    return trends;
  } catch (error) {
    console.error('YouTube fetch error:', error.message);
    return [];
  }
}

async function saveTrends(trends, source) {
  let saved = 0;
  let updated = 0;

  for (const trend of trends) {
    // Check if trend already exists
    const { data: existing } = await supabase
      .from('trending_topics')
      .select('id')
      .eq('title', trend.title)
      .eq('source', source)
      .single();

    if (existing) {
      // Update existing trend
      await supabase
        .from('trending_topics')
        .update({
          score: trend.score,
          fetched_at: trend.fetched_at,
          expires_at: trend.expires_at
        })
        .eq('id', existing.id);
      updated++;
    } else {
      // Insert new trend
      await supabase
        .from('trending_topics')
        .insert(trend);
      saved++;
    }
  }

  return { saved, updated };
}

async function cleanupExpiredTrends() {
  const { count } = await supabase
    .from('trending_topics')
    .delete()
    .lt('expires_at', new Date().toISOString())
    .select('id', { count: 'exact' });

  return count || 0;
}

export default async function handler(req, res) {
  // Only allow cron or authenticated requests
  if (req.headers['x-cron-secret'] !== process.env.CRON_SECRET && req.method !== 'GET') {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    console.log('Starting trend fetch...');

    // Fetch from all sources
    const [googleTrends, redditTrends, youtubeTrends] = await Promise.all([
      fetchGoogleTrends(),
      fetchRedditTrends(),
      fetchYouTubeTrends()
    ]);

    // Save trends
    const results = {
      google: await saveTrends(googleTrends, 'google_trends'),
      reddit: await saveTrends(redditTrends, 'reddit'),
      youtube: await saveTrends(youtubeTrends, 'youtube'),
      deleted: await cleanupExpiredTrends()
    };

    console.log('Trend fetch complete:', results);

    res.status(200).json({
      success: true,
      fetched: {
        google: googleTrends.length,
        reddit: redditTrends.length,
        youtube: youtubeTrends.length
      },
      saved: results,
      deleted: results.deleted
    });
  } catch (error) {
    console.error('Trend fetch error:', error);
    res.status(500).json({ error: error.message });
  }
}
