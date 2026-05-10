import axios from 'axios';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const SYSTEM_PROMPT = `Kamu adalah seorang kreator konten UGC yang ahli dalam membuat konten soft-selling melalui hiburan.

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

IMPORTANT: Kamu HARUS mengembalikan response dalam format JSON murni tanpa markdown formatting. Tidak boleh ada text lain selain JSON.

Format JSON yang WAJIB diikuti (tanpa backticks):
{
  "title": "Judul singkat yang catchy",
  "concept": "Deskripsi skit dalam bahasa Indonesia dengan dialog",
  "platform": "TikTok",
  "tone": "comedy",
  "duration": "30s",
  "reasoning": "Kenapa pendekatan ini efektif untuk soft-selling",
  "hookType": "plot-twist"
}

Contoh response yang BENAR (tanpa backticks):
{"title":"Teman Kaget Suara Asing","concept":"Scene di kedai kopi...","platform":"TikTok","tone":"comedy","duration":"30s","reasoning":"因为...","hookType":"plot-twist"}`;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { productName, productCategory, productFeatures } = req.body;

    // Validate input
    if (!productName || !productCategory || !productFeatures) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Fetch relevant trends
    const { data: trends } = await supabase
      .from('trending_topics')
      .select('*')
      .gte('expires_at', new Date().toISOString())
      .order('score', { ascending: false })
      .limit(5);

    // Build prompt with trends
    const relatedTrends = trends?.length > 0
      ? trends.map(t => `- ${t.title} (${t.source})`).join('\n')
      : 'Tidak ada trending topics terbaru';

    const prompt = SYSTEM_PROMPT
      .replace('{productName}', productName)
      .replace('{productCategory}', productCategory)
      .replace('{productFeatures}', productFeatures)
      .replace('{relatedTrends}', relatedTrends);

    // Call OpenCode Zen API
    const opencodeResponse = await axios.post(
      'https://opencode.ai/zen/v1/chat/completions',
      {
        model: 'minimax-m2.5-free',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 2048,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    const responseText = opencodeResponse.data.choices?.[0]?.message?.content || '';

    // Parse JSON from response
    let ideaData;
    try {
      // Try to extract JSON from response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        ideaData = JSON.parse(jsonMatch[0]);
      } else {
        // If no JSON found, return error with response for debugging
        console.error('No JSON in response:', responseText.substring(0, 500));
        return res.status(500).json({ error: 'AI response format invalid', debug: responseText.substring(0, 200) });
      }
    } catch (parseError) {
      console.error('Parse error:', parseError, 'Response:', responseText.substring(0, 500));
      return res.status(500).json({ error: 'Failed to parse AI response', debug: responseText.substring(0, 200) });
    }

    // Save to database
    const { data: savedIdea, error: dbError } = await supabase
      .from('content_ideas')
      .insert({
        title: ideaData.title,
        concept: ideaData.concept,
        product_name: productName,
        product_category: productCategory,
        product_features: productFeatures,
        ai_recommended_platform: ideaData.platform,
        ai_recommended_tone: ideaData.tone,
        ai_recommended_duration: ideaData.duration,
        ai_reasoning: ideaData.reasoning,
        status: 'ideas',
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      return res.status(500).json({ error: 'Failed to save idea' });
    }

    res.status(200).json({
      idea: {
        id: savedIdea.id,
        title: savedIdea.title,
        concept: savedIdea.concept,
        aiRecommendedPlatform: savedIdea.ai_recommended_platform,
        aiRecommendedTone: savedIdea.ai_recommended_tone,
        aiRecommendedDuration: savedIdea.ai_recommended_duration,
        aiReasoning: savedIdea.ai_reasoning,
        relatedTrends: trends?.map(t => ({
          title: t.title,
          relevanceScore: t.score / 100,
          reasoning: 'Trending topic yang relevan'
        })) || []
      }
    });
  } catch (error) {
    console.error('Generation error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate idea' });
  }
}
