// app/login.tsx (Next.js 14 App Router)
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Call backend API to log in (omitted)
    router.push('/dashboard');
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex min-h-screen items-center justify-center bg-gray-100">
      <form onSubmit={handleSubmit} className="p-6 bg-white rounded shadow-md w-full max-w-sm">
        <h1 className="text-2xl mb-4">Login</h1>
        <label className="block mb-2">
          Email
          <input type="email" value={email}
                 onChange={e => setEmail(e.target.value)}
                 className="mt-1 block w-full border rounded px-2 py-1"
                 required />
        </label>
        <label className="block mb-4">
          Password
          <input type="password" value={password}
                 onChange={e => setPassword(e.target.value)}
                 className="mt-1 block w-full border rounded px-2 py-1"
                 required />
        </label>
        <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded">Log In</button>
      </form>
    </motion.div>
  );
}
