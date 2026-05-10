import { Button, Badge } from '../common';

export function CardDetailModal({ idea, onClose, onDelete }) {
  if (!idea) return null;

  const platformIcons = {
    TikTok: '🎬',
    Instagram: '📱',
    YouTube: '🎥',
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gray-800 border-b border-gray-700 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-100">Detail Ide</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-100 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <h3 className="text-2xl font-bold text-gray-100 mb-2">{idea.title}</h3>
            <div className="flex items-center space-x-2">
              <Badge variant="default">{idea.product_name}</Badge>
              <Badge variant="primary">{idea.product_category}</Badge>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-300 mb-2">Konsep</h4>
            <p className="text-gray-300 whitespace-pre-line">{idea.concept}</p>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-500 mb-1">Platform</p>
              <div className="flex items-center space-x-2">
                <span className="text-xl">{platformIcons[idea.ai_recommended_platform]}</span>
                <Badge>{idea.ai_recommended_platform}</Badge>
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-500 mb-1">Tone</p>
              <Badge variant="primary">{idea.ai_recommended_tone}</Badge>
            </div>

            <div>
              <p className="text-sm text-gray-500 mb-1">Duration</p>
              <Badge variant="warning">{idea.ai_recommended_duration}</Badge>
            </div>
          </div>

          {idea.ai_reasoning && (
            <div className="bg-indigo-900/50 rounded-lg p-4">
              <h4 className="font-medium text-indigo-300 mb-2">💡 AI Reasoning</h4>
              <p className="text-sm text-indigo-200">{idea.ai_reasoning}</p>
            </div>
          )}

          <div>
            <h4 className="font-medium text-gray-300 mb-2">Fitur Produk</h4>
            <p className="text-gray-300 whitespace-pre-line">{idea.product_features}</p>
          </div>

          {idea.tags && idea.tags.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-300 mb-2">Tags</h4>
              <div className="flex flex-wrap gap-2">
                {idea.tags.map((tag, idx) => (
                  <Badge key={idx} variant="primary">{tag}</Badge>
                ))}
              </div>
            </div>
          )}

          <div className="text-sm text-gray-500">
            <p>Created: {new Date(idea.created_at).toLocaleString('id-ID')}</p>
            <p>Updated: {new Date(idea.updated_at).toLocaleString('id-ID')}</p>
          </div>
        </div>

        <div className="sticky bottom-0 bg-gray-700 border-t border-gray-600 px-6 py-4 flex items-center justify-between">
          <Button variant="danger" onClick={() => onDelete(idea.id)}>
            Delete
          </Button>
          <Button onClick={onClose}>Close</Button>
        </div>
      </div>
    </div>
  );
}