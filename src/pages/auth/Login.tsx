import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { Eye, EyeOff, Play } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('kingsleyfejjstus@gmail.com');
  const [password, setPassword] = useState('123dd456');            
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();


const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();
  setError('');
  setLoading(true);

  try {
    const response = await api.post('/auth/login', { email, password });
    
    // Extract token and user from response
    const { token, user } = response.data;

    if (token) {
      localStorage.setItem('token', token);
    }

    if (user) {
      // Normalize role string (e.g., "ADMIN" -> "admin")
      const userRole = user.role ? user.role.toLowerCase() : 'admin';
      console.log('Backend Login Response:', response.data);
      
      localStorage.setItem('role', userRole);
      localStorage.setItem('user', JSON.stringify(user)); 

      // Route according to role
      if (userRole === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate('/student/dashboard', { replace: true });
      }
    }
  } catch (err: any) {
    console.error('Login error:', err);
    setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="min-h-screen flex flex-col justify-between items-center bg-gray-50 p-4">
      <div className="w-full max-w-md my-auto bg-white p-8 rounded-xl shadow-sm border border-gray-100">
        {/* Brand Header */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center text-white">
            <Play className="w-4 h-4 fill-current" />
          </div>
          <div className="leading-none">
            <span className="font-extrabold text-gray-900 text-lg tracking-tight">AI STORYSPRINT</span>
            <span className="block text-[10px] text-gray-400 uppercase tracking-wider font-semibold">EDITING</span>
          </div>
        </div>

        <div className="text-center mb-6">
          <h1 className="text-xl font-bold text-gray-900">Welcome back 👋</h1>
          <p className="text-sm text-gray-500 mt-1">Sign in to continue</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 text-xs font-medium rounded-lg border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs">
            <label className="flex items-center gap-2 cursor-pointer text-gray-600">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-gray-300 text-brand focus:ring-brand"
              />
              Remember me
            </label>
            <a href="#" className="text-brand font-medium hover:underline">Forgot password?</a>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand hover:bg-brand-dark text-white font-medium py-2.5 rounded-lg text-sm transition duration-150 disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>

      <footer className="text-xs text-gray-400 pb-4">
        © 2024 AI Storysprint Editing. All rights reserved.
      </footer>
    </div>
  );
}