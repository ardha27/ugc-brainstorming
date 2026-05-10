export function TrendTabs({ activeTab, onTabChange }) {
  const tabs = [
    { id: 'all', label: 'All Trends', icon: '🌐' },
    { id: 'google_trends', label: 'Google Trends', icon: '🔍' },
    { id: 'reddit', label: 'Reddit', icon: '🤖' },
    { id: 'youtube', label: 'YouTube', icon: '📺' },
  ];

  return (
    <div className="border-b border-gray-700">
      <nav className="flex space-x-8">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id === 'all' ? null : tab.id)}
            className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              (tab.id === 'all' && !activeTab) || activeTab === tab.id
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-600'
            }`}
          >
            <span className="text-lg">{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}