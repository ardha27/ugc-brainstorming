import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  const { id } = req.query;

  try {
    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from('content_ideas')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        return res.status(404).json({ error: 'Idea not found' });
      }

      res.status(200).json({ idea: data });
    } else if (req.method === 'PATCH') {
      const { status, position, title, concept, tags } = req.body;

      const updates = {};
      if (status) updates.status = status;
      if (position !== undefined) updates.position = position;
      if (title) updates.title = title;
      if (concept) updates.concept = concept;
      if (tags) updates.tags = tags;

      const { data, error } = await supabase
        .from('content_ideas')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return res.status(500).json({ error: error.message });
      }

      res.status(200).json({ idea: data });
    } else if (req.method === 'DELETE') {
      const { error } = await supabase
        .from('content_ideas')
        .delete()
        .eq('id', id);

      if (error) {
        return res.status(500).json({ error: error.message });
      }

      res.status(200).json({ success: true });
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}