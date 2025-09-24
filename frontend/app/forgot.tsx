// app/forgot.tsx
"use client";

import { useState } from "react";
import { motion } from "framer-motion";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Call backend forgot-password API
    console.log("Password reset requested for:", email);
    alert("If this email exists, you’ll receive reset instructions.");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex justify-center items-center min-h-[70vh]"
    >
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-md rounded-lg p-6 w-full max-w-md"
      >
        <h2 className="text-2xl font-bold mb-4">Forgot Password</h2>
        <label className="block mb-3">
          <span className="text-gray-700">Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="mt-1 block w-full rounded border px-3 py-2"
          />
        </label>
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded transition"
        >
          Send Reset Link
        </button>
        <p className="mt-4 text-sm text-gray-500">
          <a href="/login" className="text-blue-600 hover:underline">
            Back to login
          </a>
        </p>
      </form>
    </motion.div>
  );
}
