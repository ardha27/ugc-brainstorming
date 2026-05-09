import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { source, category, limit = 20 } = req.query;

    let query = supabase
      .from('trending_topics')
      .select('*')
      .gte('expires_at', new Date().toISOString())
      .order('fetched_at', { ascending: false });

    if (source) {
      query = query.eq('source', source);
    }

    if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query.limit(parseInt(limit));

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.status(200).json({ trends: data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}