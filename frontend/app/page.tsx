// app/page.tsx
"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, Box } from "@react-three/drei";
import { Suspense } from "react";
import { motion } from "framer-motion";

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center text-center min-h-[80vh]">
      <motion.h2
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-5xl font-extrabold mb-6 text-blue-700"
      >
        Welcome to PathWise
      </motion.h2>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-lg text-gray-600 mb-8 max-w-xl"
      >
        Track your <span className="font-semibold">jobs</span>,{" "}
        <span className="font-semibold">internships</span>, and{" "}
        <span className="font-semibold">applications</span> in one place 🚀
      </motion.p>
      {/* 3D Canvas removed as requested */}
      <a
        href="/signup"
        className="mt-10 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg shadow-lg transition"
      >
        Get Started
      </a>
    </div>
  );
}
