// app/page.tsx
"use client";


import LandingPage from "../components/LandingPage";
import AuthForms from "../components/AuthForms";
import Dashboard from "../components/Dashboard";
import { useAuth } from "../contexts/AuthContext";

export default function HomePage() {
  const { isAuthenticated, mode } = useAuth();
  if (isAuthenticated) {
    return <Dashboard />;
  }
  if (!isAuthenticated && (mode === 'signin' || mode === 'signup' || mode === 'forgot-password')) {
    return <AuthForms />;
  }
  return <LandingPage />;
}
