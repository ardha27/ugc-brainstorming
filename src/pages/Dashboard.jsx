import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '../components/layout';
import { Button, EmptyState } from '../components/common';
import { api } from '../lib/api';

export function Dashboard() {
  const [stats, setStats] = useState({ ideas: 0, scriptReady: 0, inProduction: 0, published: 0 });
  const [recentTrends, setRecentTrends] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [statsData, trendsData] = await Promise.all([
        api.getStats(),
        api.getTrends(null, 5),
      ]);
      setStats(statsData);
      setRecentTrends(trendsData);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const statCards = [
    { label: 'Ideas', value: stats.ideas, icon: '💡', color: 'gray' },
    { label: 'Script Ready', value: stats.scriptReady, icon: '📝', color: 'blue' },
    { label: 'In Production', value: stats.inProduction, icon: '🎬', color: 'orange' },
    { label: 'Published', value: stats.published, icon: '✅', color: 'green' },
  ];

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-100 mb-2">Dashboard</h1>
          <p className="text-gray-400">Selamat datang di UGC Brainstorming Tool!</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {statCards.map((stat) => (
            <div key={stat.label} className="bg-gray-800 rounded-lg border border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-100">{stat.value}</p>
                </div>
                <span className="text-4xl">{stat.icon}</span>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-primary to-secondary rounded-lg p-8 mb-8 text-white">
          <h2 className="text-2xl font-bold mb-2">Generate Ide Skit Baru</h2>
          <p className="mb-4 opacity-90">
            Masukkan info produk dan AI akan generate ide skit kreatif untuk soft-selling!
          </p>
          <Link to="/generate">
            <Button className="bg-white text-primary hover:bg-gray-100">
              ✨ Mulai Generate
            </Button>
          </Link>
        </div>

        {/* Recent Trends */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-100">🔥 Trending Topics</h2>
            <Link to="/trends" className="text-primary hover:underline">
              View All →
            </Link>
          </div>

          {recentTrends.length === 0 ? (
            <EmptyState
              icon="📊"
              title="No trending topics yet"
              description="Trending topics akan muncul setelah sistem meng-update data trend"
            />
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {recentTrends.map((trend) => (
                <div key={trend.id} className="border border-gray-700 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-lg">
                      {trend.source === 'google_trends' ? '🔍' : trend.source === 'reddit' ? '🤖' : '📺'}
                    </span>
                    <span className="text-sm text-gray-400">{trend.source.replace('_', ' ')}</span>
                  </div>
                  <h3 className="font-medium text-gray-200">{trend.title}</h3>
                  {trend.description && (
                    <p className="text-sm text-gray-400 mt-1 line-clamp-2">{trend.description}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-2 gap-4 mt-8">
          <Link to="/kanban" className="block">
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 hover:shadow-lg hover:border-primary transition-all">
              <h3 className="text-lg font-bold text-gray-100 mb-2">📋 Kanban Board</h3>
              <p className="text-gray-400">Kelola ide dari brainstorm sampai published</p>
            </div>
          </Link>
          <Link to="/generate" className="block">
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 hover:shadow-lg hover:border-primary transition-all">
              <h3 className="text-lg font-bold text-gray-100 mb-2">✨ Generate Idea</h3>
              <p className="text-gray-400">Buat ide skit baru dengan AI</p>
            </div>
          </Link>
        </div>
      </div>
    </Layout>
  );
}