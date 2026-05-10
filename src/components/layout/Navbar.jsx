import { Link } from 'react-router-dom';

export function Navbar() {
  return (
    <nav className="bg-gray-800 border-b border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <span className="text-2xl font-bold text-primary">UGC Brainstorming</span>
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <Link
              to="/"
              className="text-gray-300 hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Dashboard
            </Link>
            <Link
              to="/kanban"
              className="text-gray-300 hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Kanban
            </Link>
            <Link
              to="/trends"
              className="text-gray-300 hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Trends
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}