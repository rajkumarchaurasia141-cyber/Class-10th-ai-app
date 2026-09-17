import React from 'react';
import {
  GraduationCap,
  Bell,
  Search,
  UserCircle2,
  Home,
  BookOpen,
  History,
  Lightbulb,
} from 'lucide-react';
import { ActiveMainTab } from '../types';

interface HeaderProps {
  activeTab: ActiveMainTab;
  setActiveTab: (tab: ActiveMainTab) => void;
  onOpenTips: () => void;
  onOpenInstall: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
}) => {
  const mainTabs = [
    { id: 'home' as ActiveMainTab, label: 'Home', icon: Home },
    { id: 'subjects' as ActiveMainTab, label: 'Subjects', icon: BookOpen },
    { id: 'pyq' as ActiveMainTab, label: 'PYQ (2016-2026)', icon: History },
    { id: 'ai-teacher' as ActiveMainTab, label: 'AI Teacher', icon: GraduationCap },
    { id: 'tricks' as ActiveMainTab, label: 'Tricks', icon: Lightbulb },
    { id: 'math-solutions' as ActiveMainTab, label: 'Math Solutions', icon: BookOpen },
  ];

  return (
    <header className="bg-stone-950 border-b border-stone-800 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-3">
          
          {/* Left: Logo & App Title */}
          <div 
            className="flex items-center gap-3 cursor-pointer select-none"
            onClick={() => setActiveTab('home')}
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0 relative flex flex-col items-center justify-center rounded-full bg-gradient-to-br from-stone-800 to-stone-950 border-2 border-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.2)] overflow-hidden">
              <span className="text-amber-400 drop-shadow-md leading-none mt-1 text-lg sm:text-xl">🎓</span>
              <span className="text-white font-black tracking-tighter leading-none text-[10px] sm:text-xs">PB</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] text-stone-400 font-medium tracking-wide">
                नमस्ते, छात्र! 👋
              </span>
              <h1 className="text-base sm:text-lg font-bold text-white tracking-tight leading-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
                Padhega Bihar <span className="text-amber-400">- 10th</span>
              </h1>
            </div>
          </div>

          {/* Right: Search & Notifications */}
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="hidden sm:flex items-center bg-stone-900 border border-stone-800 rounded-full px-3 py-1.5 w-48 lg:w-64">
              <Search className="w-4 h-4 text-stone-400 mr-2" />
              <input 
                type="text" 
                placeholder="सर्च करें..." 
                className="bg-transparent text-sm text-stone-200 outline-none w-full placeholder:text-stone-500"
              />
            </div>
            
            <button className="sm:hidden w-9 h-9 flex items-center justify-center rounded-full bg-stone-900 border border-stone-800 text-stone-300 hover:text-white transition-colors">
              <Search className="w-4 h-4" />
            </button>
            <button className="relative w-9 h-9 flex items-center justify-center rounded-full bg-stone-900 border border-stone-800 text-stone-300 hover:text-white transition-colors">
              <Bell className="w-4 h-4" />
              <span className="absolute top-2 right-2.5 w-1.5 h-1.5 bg-rose-500 rounded-full"></span>
            </button>
          </div>
        </div>

        {/* Desktop / Tablet Navigation Tabs */}
        <nav className="hidden sm:flex space-x-2 overflow-x-auto pb-3 scrollbar-none">
          {mainTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-amber-500 text-stone-950 shadow-md shadow-amber-500/20'
                    : 'bg-stone-900 text-stone-400 border border-stone-800 hover:text-stone-200 hover:bg-stone-800'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-stone-950' : 'text-stone-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
