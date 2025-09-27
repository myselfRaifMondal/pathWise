import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button, Input } from '../lib/ui';

export default function AuthForms() {
  const { mode, setMode, login, signup } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev: typeof formData) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    if (mode === 'signin') {
      const res = await login(formData.email, formData.password);
      if (res?.error) setError(res.error);
    } else if (mode === 'signup') {
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        setIsLoading(false);
        return;
      }
      const res = await signup(formData.email, formData.password);
      if (res?.error) setError(res.error);
    } else if (mode === 'forgot-password') {
      setError('Forgot password not implemented');
    }
    setIsLoading(false);
  };

  return (
  <div className="flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold mb-6 text-center text-blue-700">
          {mode === 'signup' ? 'Sign Up' : mode === 'forgot-password' ? 'Forgot Password' : 'Sign In'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="text-red-600 text-sm text-center">{error}</div>}
          {mode === 'signup' && (
            <Input
              type="text"
              placeholder="Username"
              value={formData.username}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('username', e.target.value)}
              required
            />
          )}
          <Input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('email', e.target.value)}
            required
          />
          {mode !== 'forgot-password' && (
            <Input
              type="password"
              placeholder="Password"
              value={formData.password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('password', e.target.value)}
              required
            />
          )}
          {mode === 'signup' && (
            <Input
              type="password"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('confirmPassword', e.target.value)}
              required
            />
          )}
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Loading...' : mode === 'signup' ? 'Create Account' : mode === 'forgot-password' ? 'Send Reset Link' : 'Sign In'}
          </Button>
        </form>
        <div className="mt-4 text-center text-sm text-gray-500">
          {mode === 'signup' ? (
            <>
              Already have an account?{' '}
              <Button variant="link" type="button" onClick={() => setMode('signin')}>
                Sign In
              </Button>
            </>
          ) : mode === 'forgot-password' ? (
            <>
              Remembered your password?{' '}
              <Button variant="link" type="button" onClick={() => setMode('signin')}>
                Sign In
              </Button>
            </>
          ) : (
            <>
              New here?{' '}
              <Button variant="link" type="button" onClick={() => setMode('signup')}>
                Create an account
              </Button>
              <br />
              <Button variant="link" type="button" className="mt-1" onClick={() => setMode('forgot-password')}>
                Forgot password?
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
