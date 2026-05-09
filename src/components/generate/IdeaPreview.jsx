import { Button, Badge } from '../common';

export function IdeaPreview({ idea, onRegenerate, onSave, onDiscard, isLoading }) {
  const platformIcons = {
    TikTok: '🎬',
    Instagram: '📱',
    YouTube: '🎥',
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-start justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">{idea.title}</h2>
          <Badge variant="purple">AI Generated</Badge>
        </div>

        <div className="prose max-w-none mb-6">
          <p className="text-gray-700 whitespace-pre-line">{idea.concept}</p>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div>
            <p className="text-sm text-gray-500 mb-1">Platform</p>
            <div className="flex items-center space-x-2">
              <span className="text-xl">{platformIcons[idea.aiRecommendedPlatform]}</span>
              <Badge>{idea.aiRecommendedPlatform}</Badge>
            </div>
          </div>

          <div>
            <p className="text-sm text-gray-500 mb-1">Tone</p>
            <Badge variant="primary">{idea.aiRecommendedTone}</Badge>
          </div>

          <div>
            <p className="text-sm text-gray-500 mb-1">Duration</p>
            <Badge variant="warning">{idea.aiRecommendedDuration}</Badge>
          </div>
        </div>

        <div className="bg-indigo-50 rounded-lg p-4 mb-6">
          <h3 className="text-sm font-medium text-indigo-900 mb-2">💡 Kenapa Ini Efektif?</h3>
          <p className="text-sm text-indigo-700">{idea.aiReasoning}</p>
        </div>

        {idea.relatedTrends && idea.relatedTrends.length > 0 && (
          <div className="border-t border-gray-200 pt-4">
            <h3 className="text-sm font-medium text-gray-900 mb-3">🔥 Related Trends</h3>
            <div className="space-y-2">
              {idea.relatedTrends.map((trend, idx) => (
                <div key={idx} className="flex items-start space-x-2 text-sm">
                  <Badge variant="success">{Math.round(trend.relevanceScore * 100)}%</Badge>
                  <div>
                    <p className="font-medium text-gray-900">{trend.title}</p>
                    <p className="text-gray-600">{trend.reasoning}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={onRegenerate}
          disabled={isLoading}
        >
          🔄 Regenerate
        </Button>
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            onClick={onDiscard}
            disabled={isLoading}
          >
            Discard
          </Button>
          <Button
            onClick={onSave}
            disabled={isLoading}
          >
            💾 Save to Kanban
          </Button>
        </div>
      </div>
    </div>
  );
}
