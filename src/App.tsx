import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { LoginScreen } from './components/LoginScreen';
import { HomeScreen } from './components/HomeScreen';
import { SubjectsExplorer } from './components/SubjectsExplorer';
import { AdminPanel } from './components/AdminPanel';
import { PaywallModal } from './components/PaywallModal';
import { LogOut, ShieldCheck, Crown } from 'lucide-react';

function MainApp() {
  const { user, isAdmin, isVIP, vipDetails, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('home');
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [showVipModal, setShowVipModal] = useState(false);

  if (!user) return <LoginScreen />;

  const isExpired = vipDetails?.isExpired;
  const daysLeft = vipDetails?.daysRemaining;

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col font-sans selection:bg-amber-500/30">
      <header className="px-4 sm:px-6 py-3.5 border-b border-stone-800/80 bg-stone-900/80 backdrop-blur-md sticky top-0 z-40 flex justify-between items-center">
        <h1 onClick={() => { setActiveTab('home'); setSelectedSubject(null); }} className="text-lg sm:text-xl font-black text-amber-500 cursor-pointer flex items-center gap-2 hover:opacity-80 transition-opacity">
          <span className="bg-amber-500 text-stone-950 px-2 py-0.5 rounded-md text-xs sm:text-sm">10th</span> BSEB
        </h1>
        <div className="flex gap-2.5 sm:gap-3 items-center">
          {/* VIP Plan Indicator / Modal Button */}
          <button
            onClick={() => setShowVipModal(true)}
            className={`text-xs font-bold px-2.5 sm:px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
              isVIP
                ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30 hover:bg-amber-500/25'
                : isExpired
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 animate-pulse'
                : 'bg-gradient-to-r from-amber-600 to-amber-700 text-white shadow-md shadow-amber-900/30 hover:brightness-110'
            }`}
            title="VIP प्लान देखें"
          >
            <Crown className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">
              {isVIP 
                ? (daysLeft && daysLeft < 999 ? `VIP सक्रिय (${daysLeft} दिन शेष)` : 'VIP सक्रिय') 
                : isExpired 
                ? 'VIP समाप्त (रिन्यू करें)' 
                : 'VIP प्लान (₹99 / ₹600)'}
            </span>
            <span className="xs:hidden">
              {isVIP ? (daysLeft && daysLeft < 999 ? `${daysLeft}d VIP` : 'VIP') : isExpired ? 'रिन्यू' : '₹99 VIP'}
            </span>
          </button>

          {isAdmin && (
            <button onClick={() => setActiveTab('admin')} className="text-xs font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20 px-2.5 sm:px-3 py-1.5 rounded-lg flex items-center gap-1.5 hover:bg-amber-500/20 transition-colors cursor-pointer">
              <ShieldCheck className="w-3.5 h-3.5" /> <span className="hidden sm:inline">एडमिन</span>
            </button>
          )}

          <div className="hidden md:flex flex-col text-right">
            <span className="text-xs font-semibold text-stone-200 truncate max-w-[120px]">{user.name}</span>
            <span className="text-[10px] text-stone-400 truncate max-w-[120px]">{user.email}</span>
          </div>

          <button onClick={logout} className="text-stone-400 hover:text-white p-2 bg-stone-800 hover:bg-stone-700 rounded-lg transition-colors cursor-pointer" title="लॉगआउट">
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

      {showVipModal && <PaywallModal onClose={() => setShowVipModal(false)} />}
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
