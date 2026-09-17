import React from 'react';
import { Home, BookOpen, History, GraduationCap, Lightbulb } from 'lucide-react';
import { ActiveMainTab } from '../types';

interface BottomNavigationProps {
  activeTab: ActiveMainTab;
  onChangeTab: (tab: ActiveMainTab) => void;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({ activeTab, onChangeTab }) => {
  const tabs = [
    {
      id: 'home' as ActiveMainTab,
      label: 'Home',
      hindiLabel: 'मुख्य पृष्ठ',
      icon: Home,
    },
    {
      id: 'subjects' as ActiveMainTab,
      label: 'Subjects',
      hindiLabel: 'सभी विषय',
      icon: BookOpen,
    },
    {
      id: 'pyq' as ActiveMainTab,
      label: 'PYQ',
      hindiLabel: '2016-2026',
      icon: History,
      badge: '10 Yrs',
    },
    {
      id: 'ai-teacher' as ActiveMainTab,
      label: 'AI Teacher',
      hindiLabel: 'AI शिक्षक',
      icon: GraduationCap,
      badge: 'फोटो डाउट',
    },
    {
      id: 'tricks' as ActiveMainTab,
      label: 'Tricks',
      hindiLabel: 'ट्रिक से समझो',
      icon: Lightbulb,
    },
  ];

  return (
    <nav
      id="bottom-navigation-bar"
      aria-label="मुख्य नेविगेशन"
      className="fixed bottom-0 left-0 right-0 z-50 bg-stone-900/95 backdrop-blur-xl border-t border-stone-800/80 shadow-2xl transition-all"
    >
      <div className="max-w-md md:max-w-xl mx-auto px-2 py-1.5 flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              id={`bottom-nav-${tab.id}`}
              onClick={() => onChangeTab(tab.id)}
              className={`relative flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all duration-200 cursor-pointer min-w-[58px] min-h-[46px] ${
                isActive
                  ? 'text-amber-400 font-semibold'
                  : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/40'
              }`}
            >
              {/* Active subtle indicator glow background */}
              {isActive && (
                <span className="absolute inset-0 bg-amber-500/10 rounded-xl border border-amber-500/25 animate-fade-in" />
              )}

              {/* Icon Container with Badge */}
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform duration-200 ${
                    isActive ? 'scale-110 stroke-[2.25]' : 'stroke-[1.75]'
                  }`}
                />
                {tab.badge && (
                  <span className="absolute -top-1.5 -right-3 text-[9px] font-bold px-1 py-0.2 rounded-full bg-amber-500 text-stone-950 scale-90 whitespace-nowrap shadow-sm">
                    {tab.badge}
                  </span>
                )}
              </div>

              {/* Label */}
              <span className="text-[11px] mt-0.5 tracking-tight leading-none whitespace-nowrap">
                {tab.label}
              </span>
              <span className="text-[9px] text-stone-500 font-normal leading-tight hidden xs:block">
                {tab.hindiLabel}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
