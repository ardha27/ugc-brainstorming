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
