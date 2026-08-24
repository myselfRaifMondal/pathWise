import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const menuItems = [
  { key: 'welcome', label: 'Welcome' },
  { key: 'kanban', label: 'Kanban Board' },
  { key: 'calendar', label: 'Calendar' },
  { key: 'settings', label: 'Settings' }
];

export default function Dashboard() {
  const { logout } = useAuth();
  const [currentView, setCurrentView] = useState('welcome');

  return (
    <div className="flex min-h-screen">
      <aside className="w-56 bg-blue-600 text-white flex flex-col py-6 px-2">
        <div className="text-2xl font-bold mb-8 px-2">Dashboard</div>
        <nav className="flex-1 flex flex-col gap-2">
          {menuItems.map(item => (
            <button
              key={item.key}
              className={`text-left px-4 py-2 rounded transition ${currentView === item.key ? 'bg-blue-800' : 'hover:bg-blue-700'}`}
              onClick={() => setCurrentView(item.key)}
            >
              {item.label}
            </button>
          ))}
        </nav>
        <button
          className="mt-8 px-4 py-2 bg-white text-blue-600 rounded hover:bg-gray-100"
          onClick={logout}
        >
          Sign Out
        </button>
      </aside>
      <main className="flex-1 p-8">
        {currentView === 'welcome' && <div className="text-2xl font-bold">Welcome to your dashboard!</div>}
        {currentView === 'kanban' && <div>Kanban Board (coming soon)</div>}
        {currentView === 'calendar' && <div>Calendar (coming soon)</div>}
        {currentView === 'settings' && <div>Settings (coming soon)</div>}
      </main>
    </div>
  );
}
