// frontend/src/pages/Login.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth(); // 👈 use context login
  const navigate = useNavigate();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });

      // use context to set token and role
      const { token, user } = res.data;
      login(token, user);

      // Role‑based routing
      switch (user.role) {
        case 'admin':
          navigate('/admin');
          break;
        case 'seller':
          navigate('/seller');
          break;
        default:
          navigate('/');       // customer
      }
    } catch (err) {
      console.error('Login error:', err);
      alert('❌ Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-200 flex items-center justify-center p-4">
      <form
        onSubmit={submit}
        className="bg-white shadow-xl rounded-xl p-8 w-full max-w-sm space-y-5"
      >
        <h2 className="text-3xl font-bold text-center text-gray-800">Admin Login</h2>
        <p className="text-sm text-center text-gray-500">
          Please sign in with your credentials
        </p>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
            placeholder="admin@example.com"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
            placeholder="••••••••"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
        >
          {loading ? 'Logging in…' : 'Login'}
        </button>
      </form>
    </div>
  );
}
