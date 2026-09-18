import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { LoginScreen } from './components/LoginScreen';
import { HomeScreen } from './components/HomeScreen';
import { SubjectsExplorer } from './components/SubjectsExplorer';
import { AdminPanel } from './components/AdminPanel';
import { LogOut, ShieldCheck } from 'lucide-react';

function MainApp() {
  const { user, isAdmin, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('home');
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);

  if (!user) return <LoginScreen />;

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col font-sans selection:bg-amber-500/30">
      <header className="px-6 py-4 border-b border-stone-800/80 bg-stone-900/80 backdrop-blur-md sticky top-0 z-40 flex justify-between items-center">
        <h1 onClick={() => { setActiveTab('home'); setSelectedSubject(null); }} className="text-xl font-black text-amber-500 cursor-pointer flex items-center gap-2 hover:opacity-80 transition-opacity">
          <span className="bg-amber-500 text-stone-950 px-2 py-0.5 rounded-md text-sm">10th</span> BSEB
        </h1>
        <div className="flex gap-4 items-center">
          {isAdmin && (
            <button onClick={() => setActiveTab('admin')} className="text-xs font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20 px-3 py-1.5 rounded-lg flex items-center gap-1.5 hover:bg-amber-500/20 transition-colors">
              <ShieldCheck className="w-3.5 h-3.5" /> एडमिन
            </button>
          )}
          <div className="hidden sm:block text-sm text-stone-400 font-medium">{user.email}</div>
          <button onClick={logout} className="text-stone-400 hover:text-white p-2 bg-stone-800 rounded-lg transition-colors" title="Logout">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto">
        {activeTab === 'home' && (
          <HomeScreen onSelect={(id: string) => { setSelectedSubject(id); setActiveTab('explorer'); }} />
        )}
        {activeTab === 'explorer' && selectedSubject && (
          <SubjectsExplorer subjectId={selectedSubject} onBack={() => { setActiveTab('home'); setSelectedSubject(null); }} />
        )}
        {activeTab === 'admin' && isAdmin && (
          <AdminPanel onBack={() => setActiveTab('home')} />
        )}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <MainApp />
      </DataProvider>
    </AuthProvider>
  );
}
