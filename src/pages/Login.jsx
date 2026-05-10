import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ADMIN_PASSWORD = 'ugc2024';

export function Login() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);

    if (password === ADMIN_PASSWORD) {
      localStorage.setItem('ugc_auth', 'true');
      navigate('/');
    } else {
      setError('Password salah');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary">UGC Brainstorming</h1>
          <p className="text-gray-400 mt-2">Masuk untuk mengakses</p>
        </div>

        {error && (
          <div className="mb-4 px-4 py-3 rounded-lg bg-red-900/50 border border-red-700 text-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Masukkan password"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-primary hover:bg-indigo-600 text-white font-medium py-3 rounded-lg transition-colors"
          >
            Masuk
          </button>
        </form>
      </div>
    </div>
  );
}