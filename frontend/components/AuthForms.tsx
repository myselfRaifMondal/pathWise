import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function AuthForms() {
  const { mode, setMode, login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // TODO: Call backend API for login/signup/forgot
    setTimeout(() => {
      login(); // Simulate login for now
      setIsLoading(false);
    }, 800);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold mb-6 text-center text-blue-700">
          {mode === 'signup' ? 'Sign Up' : mode === 'forgot-password' ? 'Forgot Password' : 'Sign In'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <input
              type="text"
              placeholder="Username"
              value={formData.username}
              onChange={e => handleInputChange('username', e.target.value)}
              className="w-full border rounded px-3 py-2"
              required
            />
          )}
          <input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={e => handleInputChange('email', e.target.value)}
            className="w-full border rounded px-3 py-2"
            required
          />
          {mode !== 'forgot-password' && (
            <input
              type="password"
              placeholder="Password"
              value={formData.password}
              onChange={e => handleInputChange('password', e.target.value)}
              className="w-full border rounded px-3 py-2"
              required
            />
          )}
          {mode === 'signup' && (
            <input
              type="password"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={e => handleInputChange('confirmPassword', e.target.value)}
              className="w-full border rounded px-3 py-2"
              required
            />
          )}
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded transition"
            disabled={isLoading}
          >
            {isLoading ? 'Loading...' : mode === 'signup' ? 'Create Account' : mode === 'forgot-password' ? 'Send Reset Link' : 'Sign In'}
          </button>
        </form>
        <div className="mt-4 text-center text-sm text-gray-500">
          {mode === 'signup' ? (
            <>
              Already have an account?{' '}
              <button className="text-blue-600 hover:underline" onClick={() => setMode('signin')}>
                Sign In
              </button>
            </>
          ) : mode === 'forgot-password' ? (
            <>
              Remembered your password?{' '}
              <button className="text-blue-600 hover:underline" onClick={() => setMode('signin')}>
                Sign In
              </button>
            </>
          ) : (
            <>
              New here?{' '}
              <button className="text-blue-600 hover:underline" onClick={() => setMode('signup')}>
                Create an account
              </button>
              <br />
              <button className="text-blue-600 hover:underline mt-1" onClick={() => setMode('forgot-password')}>
                Forgot password?
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
