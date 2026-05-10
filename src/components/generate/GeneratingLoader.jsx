import { LoadingSpinner } from '../common';

export function GeneratingLoader() {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <LoadingSpinner size="lg" />
      <h3 className="text-lg font-medium text-gray-100 mt-6 mb-2">
        AI sedang membuat ide skit...
      </h3>
      <p className="text-gray-400 text-center max-w-md">
        Proses ini memakan waktu 15-30 detik. AI sedang menganalisis produk Anda dan mencari trending topics yang relevan.
      </p>
      <div className="mt-6 flex items-center space-x-2 text-sm text-gray-500">
        <div className="animate-pulse">⚡</div>
        <span>Powered by Claude AI</span>
      </div>
    </div>
  );
}