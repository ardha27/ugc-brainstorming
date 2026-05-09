import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/layout';
import { TrendCard, TrendTabs, TrendFilter } from '../components/trends';
import { EmptyState, LoadingSpinner } from '../components/common';
import { api } from '../lib/api';

export function TrendingTopics() {
  const navigate = useNavigate();
  const [trends, setTrends] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    loadTrends();
  }, [activeTab]);

  const loadTrends = async () => {
    setIsLoading(true);
    try {
      const data = await api.getTrends(activeTab, 50);
      setTrends(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUseTrend = (trend) => {
    // Navigate to generate page with trend pre-selected
    navigate('/generate', { state: { trend } });
  };

  const filteredTrends = selectedCategory
    ? trends.filter(t => t.category === selectedCategory)
    : trends;

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Trending Topics</h1>
        <p className="text-gray-600">Temukan topik trending untuk ide konten Anda</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          <p>{error}</p>
        </div>
      )}

      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <TrendTabs activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      <div className="mb-6">
        <TrendFilter
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      ) : filteredTrends.length === 0 ? (
        <EmptyState
          icon="📊"
          title="No trending topics"
          description="Trending topics akan muncul setelah sistem meng-update data dari Google Trends, Reddit, dan YouTube"
        />
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {filteredTrends.map((trend) => (
            <TrendCard
              key={trend.id}
              trend={trend}
              onUse={handleUseTrend}
            />
          ))}
        </div>
      )}
    </Layout>
  );
}
