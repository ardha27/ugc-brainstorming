import { Link, useLocation } from 'react-router-dom';

export function Sidebar() {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const links = [
    { path: '/', label: 'Dashboard', icon: '🏠' },
    { path: '/generate', label: 'Generate Idea', icon: '✨' },
    { path: '/kanban', label: 'Kanban Board', icon: '📋' },
    { path: '/trends', label: 'Trending Topics', icon: '🔥' },
  ];

  return (
    <aside className="w-64 bg-gray-800 border-r border-gray-700 min-h-screen">
      <div className="p-4">
        <h2 className="text-lg font-bold text-gray-100 mb-4">Menu</h2>
        <nav className="space-y-2">
          {links.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors ${
                isActive(link.path)
                  ? 'bg-primary text-white'
                  : 'text-gray-300 hover:bg-gray-700'
              }`}
            >
              <span className="text-xl">{link.icon}</span>
              <span className="font-medium">{link.label}</span>
            </Link>
          ))}
        </nav>
      </div>
    </aside>
  );
}