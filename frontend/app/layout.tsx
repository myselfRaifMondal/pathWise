// app/layout.tsx
import type { Metadata } from "next";


import "./globals.css";
import { AuthProvider, useAuth } from "../contexts/AuthContext";
import { AppProvider } from "../contexts/AppContext";

export const metadata: Metadata = {
  title: "PathWise",
  description: "Track jobs, internships, and applications with ease.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // Custom header with auth-aware navigation
  function Header() {
    const { isAuthenticated, logout } = useAuth();
    return (
      <header className="w-full bg-blue-600 text-white py-4 shadow">
        <div className="max-w-6xl mx-auto flex justify-between items-center px-4">
          <h1 className="text-2xl font-bold">PathWise</h1>
          <nav className="flex gap-6">
            <a href="/" className="hover:underline">Home</a>
            {!isAuthenticated && <a href="/login" className="hover:underline">Login</a>}
            {!isAuthenticated && <a href="/signup" className="hover:underline">Sign Up</a>}
            {isAuthenticated && <a href="/dashboard" className="hover:underline">Dashboard</a>}
            {isAuthenticated && <button onClick={logout} className="hover:underline">Logout</button>}
          </nav>
        </div>
      </header>
    );
  }

  return (
    <html lang="en">
      <body className="min-h-screen bg-gradient-to-b from-blue-50 to-white text-gray-900 flex flex-col">
        <AuthProvider>
          <AppProvider>
            <Header />
            {/* Page Content */}
            <main className="flex-1 max-w-6xl mx-auto px-4 py-8">
              {children}
            </main>
            {/* Footer */}
            <footer className="w-full text-center text-sm text-gray-500 py-4 border-t">
              © {new Date().getFullYear()} PathWise. All rights reserved.
            </footer>
          </AppProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
