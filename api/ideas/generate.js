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

Buat konten yang terasa autentik dan natural untuk audience Indonesia. Gunakan referensi budaya pop Indonesia kalau relevan. Jangan buat yang terasa seperti iklan.`;

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
        max_tokens: 1024,
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
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        ideaData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Parse error:', parseError, 'Response:', responseText);
      return res.status(500).json({ error: 'Failed to parse AI response' });
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
