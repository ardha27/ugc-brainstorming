import { Badge } from '../common';

export function IdeaCard({ idea, onClick }) {
  const platformIcons = {
    TikTok: '🎬',
    Instagram: '📱',
    YouTube: '🎥',
  };

  return (
    <div
      onClick={onClick}
      className="bg-gray-700 rounded-lg border border-gray-600 p-4 cursor-pointer hover:shadow-md hover:border-primary transition-all"
    >
      <h3 className="font-medium text-gray-100 mb-2 line-clamp-2">{idea.title}</h3>

      <div className="flex items-center space-x-2 mb-3">
        <Badge variant="default">{idea.product_name}</Badge>
        {idea.ai_recommended_platform && (
          <span className="text-lg">{platformIcons[idea.ai_recommended_platform]}</span>
        )}
      </div>

      {idea.tags && idea.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {idea.tags.slice(0, 3).map((tag, idx) => (
            <Badge key={idx} variant="primary" className="text-xs">
              {tag}
            </Badge>
          ))}
          {idea.tags.length > 3 && (
            <Badge variant="default" className="text-xs">
              +{idea.tags.length - 3}
            </Badge>
          )}
        </div>
      )}

      <p className="text-xs text-gray-500 mt-3">
        {new Date(idea.created_at).toLocaleDateString('id-ID')}
      </p>
    </div>
  );
}