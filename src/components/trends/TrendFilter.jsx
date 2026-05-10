export function TrendFilter({ selectedCategory, onCategoryChange }) {
  const categories = [
    'All',
    'entertainment',
    'tech',
    'lifestyle',
    'news',
    'sports',
    'gaming',
  ];

  return (
    <div className="flex items-center space-x-2 overflow-x-auto pb-2">
      {categories.map((category) => (
        <button
          key={category}
          onClick={() => onCategoryChange(category === 'All' ? null : category)}
          className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
            (category === 'All' && !selectedCategory) || selectedCategory === category
              ? 'bg-primary text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          {category.charAt(0).toUpperCase() + category.slice(1)}
        </button>
      ))}
    </div>
  );
}