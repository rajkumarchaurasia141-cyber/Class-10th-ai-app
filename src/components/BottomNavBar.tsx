import React from 'react';
import { Home, BookOpen, Radio, Trophy, DownloadCloud, MessageCircle, User } from 'lucide-react';

interface BottomNavBarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function BottomNavBar({ activeTab, onTabChange }: BottomNavBarProps) {
  const navItems = [
    { id: 'home', label: 'Home', hindiLabel: 'होम', icon: Home },
    { id: 'my_courses', label: 'My Courses', hindiLabel: 'कोर्स', icon: BookOpen },
    { id: 'live', label: 'Live', hindiLabel: 'लाइव', icon: Radio },
    { id: 'leaderboard', label: 'Leaderboard', hindiLabel: 'टॉपर', icon: Trophy },
    { id: 'downloads', label: 'Downloads', hindiLabel: 'नोट्स', icon: DownloadCloud },
    { id: 'chat', label: 'Chat', hindiLabel: 'डाउट/चैट', icon: MessageCircle },
    { id: 'profile', label: 'Profile', hindiLabel: 'प्रोफाइल', icon: User }
  ];

  return (
    <nav className="sticky bottom-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-1 flex items-center justify-around shadow-lg">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={`flex-1 py-1.5 px-1 flex flex-col items-center justify-center transition-all cursor-pointer select-none relative ${
              isActive ? 'text-red-700 font-bold' : 'text-stone-400 hover:text-stone-600 font-medium'
            }`}
          >
            {isActive && (
              <span className="absolute -top-1 w-6 h-0.5 bg-red-600 rounded-full" />
            )}
            <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110' : ''}`} />
            <span className="text-[10px] tracking-tight mt-0.5 whitespace-nowrap">
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
