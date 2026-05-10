export function Badge({ children, variant = 'default', className = '' }) {
  const variants = {
    default: 'bg-gray-700 text-gray-200',
    primary: 'bg-indigo-900 text-indigo-200',
    success: 'bg-green-900 text-green-200',
    warning: 'bg-orange-900 text-orange-200',
    purple: 'bg-purple-900 text-purple-200',
    tiktok: 'bg-black text-white',
    instagram: 'bg-gradient-to-r from-purple-900 to-pink-900 text-white',
    youtube: 'bg-red-900 text-white',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}