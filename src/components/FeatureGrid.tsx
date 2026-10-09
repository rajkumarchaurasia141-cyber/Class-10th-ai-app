import React from 'react';
import { 
  GraduationCap, 
  MonitorPlay, 
  FileCheck2, 
  Award, 
  BookMarked, 
  Sparkles, 
  CheckSquare, 
  CalendarDays, 
  Share2,
  Crown,
  FileText,
  BookOpen,
  Trophy,
  Lock,
  Zap
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface FeatureGridProps {
  onNavigate: (view: string, extra?: any) => void;
}

export function FeatureGrid({ onNavigate }: FeatureGridProps) {
  const { isVIP } = useAuth();

  const gridItems = [
    {
      id: 'course',
      title: 'Course',
      subtitle: 'सशुल्क कोर्स',
      badge: 'VIP',
      badgeColor: 'bg-red-500 text-white',
      bgIcon: 'bg-gradient-to-br from-indigo-500 to-blue-600',
      icon: GraduationCap,
      renderIcon: () => (
        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center relative shadow-xs group-hover:scale-105 transition-transform">
          <div className="w-7.5 h-7.5 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white shadow-xs">
            <GraduationCap className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
          </div>
          <span className="absolute -top-1 -right-1 bg-amber-400 text-stone-950 font-black text-[7px] px-1 rounded-full shadow-2xs">
            10th
          </span>
        </div>
      )
    },
    {
      id: 'free_courses',
      title: 'Free Courses',
      subtitle: 'फ्री वीडियो & डेमो',
      badge: 'FREE',
      badgeColor: 'bg-emerald-500 text-white',
      bgIcon: 'bg-gradient-to-br from-teal-400 to-emerald-600',
      icon: MonitorPlay,
      renderIcon: () => (
        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center relative shadow-xs group-hover:scale-105 transition-transform">
          <div className="w-7.5 h-7.5 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white shadow-xs">
            <MonitorPlay className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
          </div>
          <span className="absolute -top-1 -right-1 bg-emerald-500 text-white font-black text-[7px] px-1 rounded-full">
            DEMO
          </span>
        </div>
      )
    },
    {
      id: 'paid_notes',
      title: 'Guess Paper',
      subtitle: 'गेस पेपर & नोट्स',
      badge: isVIP ? 'UNLOCKED' : 'LOCKED',
      badgeColor: isVIP ? 'bg-emerald-600 text-white' : 'bg-amber-500 text-stone-950 font-black',
      bgIcon: 'bg-gradient-to-br from-rose-500 to-red-600',
      icon: FileCheck2,
      renderIcon: () => (
        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center relative shadow-xs group-hover:scale-105 transition-transform">
          <div className="w-7.5 h-7.5 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-amber-500 to-rose-600 flex items-center justify-center text-white shadow-xs">
            {isVIP ? <FileText className="w-4 h-4 sm:w-4.5 sm:h-4.5" /> : <Lock className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-white" />}
          </div>
          {!isVIP ? (
            <span className="absolute -bottom-1 -right-1 bg-red-600 text-white font-black text-[7px] px-1 rounded shadow-2xs">
              LOCK
            </span>
          ) : (
            <span className="absolute -bottom-1 -right-1 bg-emerald-600 text-white font-black text-[7px] px-1 rounded shadow-2xs">
              VIP
            </span>
          )}
        </div>
      )
    },
    {
      id: 'crash_course',
      title: 'Crash Course',
      subtitle: 'Class 10th Only',
      badge: '10th',
      badgeColor: 'bg-amber-500 text-stone-950 font-black',
      bgIcon: 'bg-gradient-to-br from-amber-500 to-red-600',
      icon: Zap,
      renderIcon: () => (
        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center relative shadow-xs group-hover:scale-105 transition-transform">
          <div className="w-7.5 h-7.5 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-amber-500 to-red-600 flex items-center justify-center text-white shadow-xs">
            <Zap className="w-4 h-4 sm:w-4.5 sm:h-4.5 fill-current" />
          </div>
          <span className="absolute -top-1 -right-1 bg-amber-400 text-stone-950 font-black text-[7px] px-1 rounded-full shadow-2xs">
            10th
          </span>
        </div>
      )
    },
    {
      id: 'paid_test',
      title: 'Paid Test',
      subtitle: '50 MCQ टेस्ट सीरीज',
      badge: '50 MCQs',
      badgeColor: 'bg-blue-600 text-white',
      bgIcon: 'bg-gradient-to-br from-blue-500 to-cyan-600',
      icon: Award,
      renderIcon: () => (
        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center relative shadow-xs group-hover:scale-105 transition-transform">
          <div className="w-7.5 h-7.5 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-xs">
            <Award className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
          </div>
          <span className="absolute -top-1 -right-1 bg-amber-400 text-stone-950 font-black text-[7px] px-1 rounded-full shadow-2xs">
            TEST
          </span>
        </div>
      )
    },
    {
      id: 'ncert_book',
      title: 'NCERT Book',
      subtitle: 'BSEB पुस्तकें',
      badge: 'NCERT',
      badgeColor: 'bg-amber-600 text-white',
      bgIcon: 'bg-gradient-to-br from-amber-500 to-orange-600',
      icon: BookMarked,
      renderIcon: () => (
        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center relative shadow-xs group-hover:scale-105 transition-transform">
          <div className="w-7.5 h-7.5 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-xs">
            <BookMarked className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
          </div>
          <span className="absolute -top-1 -right-1 bg-amber-600 text-white font-black text-[7px] px-1 rounded-full">
            BSEB
          </span>
        </div>
      )
    },
    {
      id: 'free_notes',
      title: 'Free Notes',
      subtitle: 'रिवीजन व फॉर्मूला',
      badge: 'FREE',
      badgeColor: 'bg-emerald-600 text-white',
      bgIcon: 'bg-gradient-to-br from-emerald-500 to-green-600',
      icon: Sparkles,
      renderIcon: () => (
        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center relative shadow-xs group-hover:scale-105 transition-transform">
          <div className="w-7.5 h-7.5 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center text-white font-black text-[9px] tracking-tight shadow-xs">
            FREE
          </div>
        </div>
      )
    },
    {
      id: 'free_test',
      title: 'Free Test',
      subtitle: 'डेली फ्री क्विज़',
      badge: 'QUIZ',
      badgeColor: 'bg-sky-500 text-white',
      bgIcon: 'bg-gradient-to-br from-sky-500 to-blue-600',
      icon: CheckSquare,
      renderIcon: () => (
        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center relative shadow-xs group-hover:scale-105 transition-transform">
          <div className="w-7.5 h-7.5 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center text-white shadow-xs">
            <CheckSquare className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
          </div>
          <span className="absolute -top-1 -right-1 bg-emerald-500 text-white font-black text-[7px] px-1 rounded-full">
            LIVE
          </span>
        </div>
      )
    },
    {
      id: 'routine',
      title: 'Class Routine',
      subtitle: 'टाइम टेबल / शेड्यूल',
      badge: 'फुल सिलेबस',
      badgeColor: 'bg-purple-600 text-white',
      bgIcon: 'bg-gradient-to-br from-purple-500 to-fuchsia-600',
      icon: CalendarDays,
      renderIcon: () => (
        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center relative shadow-xs group-hover:scale-105 transition-transform">
          <div className="w-7.5 h-7.5 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-purple-500 to-fuchsia-600 flex items-center justify-center text-white shadow-xs">
            <CalendarDays className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
          </div>
        </div>
      )
    },
    {
      id: 'social',
      title: 'Social & Help',
      subtitle: 'YouTube, WhatsApp, हेल्प',
      badge: 'JOIN',
      badgeColor: 'bg-red-600 text-white',
      bgIcon: 'bg-gradient-to-br from-red-500 to-rose-600',
      icon: Share2,
      renderIcon: () => (
        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-pink-50 border border-pink-100 flex items-center justify-center relative shadow-xs group-hover:scale-105 transition-transform">
          <div className="w-7.5 h-7.5 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center text-white shadow-xs">
            <Share2 className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
          </div>
          <span className="absolute -top-1 -right-1 bg-red-600 text-white font-black text-[7px] px-1 rounded-full animate-pulse">
            NEW
          </span>
        </div>
      )
    },
    {
      id: 'leaderboard',
      title: 'Topper Rank',
      subtitle: 'टॉपर लीडरबोर्ड',
      badge: 'TOP',
      badgeColor: 'bg-amber-500 text-stone-950 font-black',
      bgIcon: 'bg-gradient-to-br from-amber-500 to-yellow-600',
      icon: Trophy,
      renderIcon: () => (
        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center relative shadow-xs group-hover:scale-105 transition-transform">
          <div className="w-7.5 h-7.5 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center text-stone-950 shadow-xs">
            <Trophy className="w-4 h-4 sm:w-4.5 sm:h-4.5 fill-stone-950" />
          </div>
          <span className="absolute -top-1 -right-1 bg-red-600 text-white font-black text-[7px] px-1 rounded-full animate-pulse">
            HOT
          </span>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-2">
      {/* Section Title */}
      <div className="flex items-center justify-between px-1">
        <h3 className="text-xs font-black text-stone-900 flex items-center gap-1.5">
          <span className="w-2 h-3.5 rounded-full bg-red-600 inline-block"></span>
          <span>मुख्य सुविधाएँ & अध्ययन सामग्री</span>
        </h3>
        <span className="text-[10px] text-stone-500 font-bold">BSEB 10th Special</span>
      </div>

      {/* 3x3 Grid (Matches user screenshot perfectly!) */}
      <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
        {gridItems.map((item) => (
          <div
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className="group bg-white hover:bg-slate-50/90 rounded-xl p-2 sm:p-2.5 border border-slate-200/80 shadow-2xs hover:shadow-xs transition-all duration-200 cursor-pointer flex flex-col items-center text-center justify-between relative overflow-hidden"
          >
            {/* Top Icon */}
            <div className="pt-0.5">
              {item.renderIcon()}
            </div>

            {/* Labels */}
            <div className="w-full mt-1.5 space-y-0.5">
              <h4 className="text-[11px] sm:text-xs font-black text-stone-900 tracking-tight leading-tight group-hover:text-red-700 transition-colors">
                {item.title}
              </h4>
              <p className="text-[9px] sm:text-[10px] text-stone-500 font-semibold truncate leading-none">
                {item.subtitle}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
