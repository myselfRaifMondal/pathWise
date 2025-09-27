import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../lib/ui';

export default function LandingPage() {
  const { setMode } = useAuth();
    return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-blue-700 mb-2">PathWise</h1>
        <p className="text-lg text-gray-600 max-w-xl text-center">
          Track your <span className="font-semibold">jobs</span>, <span className="font-semibold">internships</span>, and <span className="font-semibold">applications</span> in one place 🚀
        </p>
      </header>
      <div className="flex gap-4">
          <Button variant="default" size="lg" onClick={() => setMode('signin')}>
            Sign In
          </Button>
          <Button variant="outline" size="lg" onClick={() => setMode('signup')}>
            Sign Up
          </Button>
      </div>
    </div>
  );
}
