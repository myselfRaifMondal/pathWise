// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PathWise",
  description: "Track jobs, internships, and applications with ease.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gradient-to-b from-blue-50 to-white text-gray-900 flex flex-col">
        {/* Header */}
        <header className="w-full bg-blue-600 text-white py-4 shadow">
          <div className="max-w-6xl mx-auto flex justify-between items-center px-4">
            <h1 className="text-2xl font-bold">PathWise</h1>
            <nav className="flex gap-6">
              <a href="/" className="hover:underline">Home</a>
              <a href="/login" className="hover:underline">Login</a>
              <a href="/signup" className="hover:underline">Sign Up</a>
            </nav>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 max-w-6xl mx-auto px-4 py-8">
          {children}
        </main>

        {/* Footer */}
        <footer className="w-full text-center text-sm text-gray-500 py-4 border-t">
          © {new Date().getFullYear()} PathWise. All rights reserved.
        </footer>
      </body>
    </html>
  );
}
