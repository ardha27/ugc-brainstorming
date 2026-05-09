import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic();

const SYSTEM_PROMPT = `Analisis trending topics ini dan sarankan mana yang bisa diintegrasikan secara natural dengan produk ini untuk konten UGC soft-selling.

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
]`;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { productName, productCategory, productFeatures } = req.body;

    if (!productName || !productCategory) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Build prompt
    const prompt = SYSTEM_PROMPT
      .replace('{productName}', productName)
      .replace('{productCategory}', productCategory)
      .replace('{productFeatures}', productFeatures || 'Tidak ada fitur spesifik')
      .replace('{trendsList}', 'Tidak ada trending topics terbaru. Berikan saran umum untuk konten soft-selling.');

    // Call Claude API
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }]
    });

    const responseText = message.content[0].text;

    // Parse JSON
    let suggestions;
    try {
      const jsonMatch = responseText.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        suggestions = JSON.parse(jsonMatch[0]);
      } else {
        suggestions = [];
      }
    } catch (parseError) {
      suggestions = [];
    }

    res.status(200).json({ suggestions });
  } catch (error) {
    console.error('Suggest error:', error);
    res.status(500).json({ error: error.message || 'Failed to suggest trends' });
  }
}