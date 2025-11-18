import React, { useState } from 'react';
import { User } from '../types';

interface AuthPageProps {
  onLogin: (user: User) => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!email || !password) {
        throw new Error('Email and password required');
      }
      if (!isLogin && !name) {
        throw new Error('Name required for signup');
      }

      // Register/login user with Chat backend on port 8081
      const BACKEND_URL = import.meta.env.VITE_AUTH_SERVICE_URL || 'http://localhost:8081';
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';

      const response = await fetch(`${BACKEND_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          name,
          password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Request failed: ${response.status}`);
      }

      const data = await response.json();
      const user: User = data.data || data;

      // Store user and token in localStorage
      localStorage.setItem('whooper_user', JSON.stringify(user));
      localStorage.setItem('whooper_token', 'test-token-' + user.id);

      onLogin(user);

    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background-main">
      <div className="w-full max-w-md">
        <div className="bg-background-panel rounded-2xl shadow-xl p-8 border border-border-color">
          {/* Logo/Title */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-text-primary mb-2">
              Whooper Chat
            </h1>
            <p className="text-text-secondary">
              {isLogin ? 'Sign in to your account' : 'Create a new account'}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-text-primary mb-1">
                  Full Name
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required={!isLogin}
                  className="w-full px-4 py-2 bg-background-main border border-border-color rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
                  placeholder="John Doe"
                />
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-text-primary mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2 bg-background-main border border-border-color rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-text-primary mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-2 bg-background-main border border-border-color rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="bg-red-900/30 border border-red-700 text-red-400 px-4 py-2 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-accent text-white font-semibold rounded-lg hover:bg-accent-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Please wait...' : isLogin ? 'Sign In' : 'Sign Up'}
            </button>
          </form>

          {/* Toggle Login/Register */}
          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
                setName('');
                setEmail('');
                setPassword('');
              }}
              className="text-accent hover:text-accent-hover font-medium text-sm"
            >
              {isLogin ? "Don't have an account? Sign Up" : 'Already have an account? Sign In'}
            </button>
          </div>

          {/* Debug - Clear All Data */}
          <div className="mt-4 pt-4 border-t border-border-color">
            <p className="text-xs text-text-secondary text-center mb-2">Testing Tools:</p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={async () => {
                  if (confirm('Clear all users and messages?')) {
                    const AUTH_URL = import.meta.env.VITE_AUTH_SERVICE_URL || 'http://localhost:8081';
                    try {
                      await fetch(`${AUTH_URL}/api/auth/users`, { method: 'DELETE' });
                      alert('All data cleared!');
                    } catch (err) {
                      alert(`Error clearing data: ${err}`);
                    }
                  }
                }}
                className="flex-1 py-1.5 px-3 bg-red-900/30 border border-red-700 text-red-400 text-xs rounded hover:bg-red-900/50 transition-colors"
              >
                Clear All Data
              </button>
              <button
                type="button"
                onClick={async () => {
                  const AUTH_URL = import.meta.env.VITE_AUTH_SERVICE_URL || 'http://localhost:8081';
                  try {
                    const res = await fetch(`${AUTH_URL}/api/auth/users`);
                    if (!res.ok) {
                      alert(`Error: ${res.status} ${res.statusText}`);
                      return;
                    }
                    const users = await res.json();
                    const userList = Array.isArray(users) ? users : (users.data || []);
                    alert(`Total users: ${userList.length}\n\n${userList.map((u: any) => `${u.name} (${u.email})`).join('\n')}`);
                  } catch (err) {
                    alert(`Error: ${err}`);
                  }
                }}
                className="flex-1 py-1.5 px-3 bg-background-main border border-border-color text-text-secondary text-xs rounded hover:bg-input-field transition-colors"
              >
                View Users
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
