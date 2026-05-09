import { Badge, Button } from '../common';

export function TrendCard({ trend, onUse }) {
  const sourceIcons = {
    google_trends: '🔍',
    reddit: '🤖',
    youtube: '📺',
  };

  const sourceColors = {
    google_trends: 'primary',
    reddit: 'warning',
    youtube: 'danger',
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          <span className="text-2xl">{sourceIcons[trend.source]}</span>
          <Badge variant={sourceColors[trend.source]}>
            {trend.source.replace('_', ' ')}
          </Badge>
          {trend.score > 0 && (
            <Badge variant="success">🔥 {trend.score}</Badge>
          )}
        </div>
      </div>

      <h3 className="font-medium text-gray-900 mb-2">{trend.title}</h3>

      {trend.description && (
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{trend.description}</p>
      )}

      {trend.category && (
        <Badge variant="default" className="mb-3">{trend.category}</Badge>
      )}

      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-500">
          {new Date(trend.fetched_at).toLocaleDateString('id-ID')}
        </p>
        <Button size="sm" onClick={() => onUse(trend)}>
          Use This Trend
        </Button>
      </div>

      {trend.url && (
        <a
          href={trend.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-primary hover:underline mt-2 block"
        >
          View Source →
        </a>
      )}
    </div>
  );
}