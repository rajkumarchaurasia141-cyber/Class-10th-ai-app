import React from 'react';
import { 
  X, 
  Crown, 
  BookOpen, 
  GraduationCap, 
  Calendar, 
  BookText, 
  Share2, 
  MessageCircle, 
  Send, 
  ShieldCheck, 
  LogOut, 
  Sparkles, 
  ExternalLink, 
  Hourglass, 
  Clock, 
  PhoneCall, 
  Radio, 
  Trophy,
  Mail
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AppDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (view: string, extra?: any) => void;
  onOpenVip: () => void;
  onOpenGmailAuth?: () => void;
}

export function AppDrawer({ isOpen, onClose, onNavigate, onOpenVip, onOpenGmailAuth }: AppDrawerProps) {
  const { user, isAdmin, isVIP, vipDetails, logout } = useAuth();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex animate-fade-in overflow-hidden">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-stone-950/70 backdrop-blur-xs transition-opacity"
      />

      {/* Drawer Content - Native Android Style (82% width, rounded-r-3xl, elevation shadow) */}
      <div className="relative w-[82%] max-w-[320px] bg-white text-stone-800 h-full shadow-2xl flex flex-col z-10 animate-slide-in rounded-r-3xl overflow-hidden border-r border-slate-200/80">
        {/* Header with User Info */}
        <div className="bg-gradient-to-br from-red-700 via-red-800 to-stone-900 text-white p-5 relative">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white p-1 rounded-full bg-black/20 hover:bg-black/30 transition-colors cursor-pointer"
            title="बंद करें"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-13 h-13 rounded-full bg-white text-red-700 flex items-center justify-center font-black text-xl shadow-md border-2 border-amber-300 shrink-0">
              {isAdmin ? '👑' : user?.name ? user.name.charAt(0).toUpperCase() : 'B'}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-bold text-base text-white truncate leading-tight">
                {isAdmin ? 'राजकुमार चौरसिया' : user?.name || 'अतिथि विद्यार्थी'}
              </h3>
              <p className="text-xs text-stone-300 truncate">
                {user?.email || 'जीमेल कनेक्ट नहीं है'}
              </p>
              
              {/* VIP / Admin Status Badge */}
              <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
                {isAdmin ? (
                  <span className="bg-amber-400 text-stone-950 text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                    <ShieldCheck className="w-3 h-3 text-stone-950 fill-current" />
                    सुपर एडमिन (Admin)
                  </span>
                ) : isVIP ? (
                  <span className="bg-amber-400 text-stone-950 text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                    <Crown className="w-3 h-3 text-stone-950 fill-stone-950" />
                    VIP एक्टिव ({vipDetails?.daysRemaining || 0} दिन शेष)
                  </span>
                ) : vipDetails?.isExpired ? (
                  <span className="bg-rose-500/90 text-white text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    VIP समाप्त (रिन्यू करें)
                  </span>
                ) : (
                  <span className="bg-white/20 text-white text-[10px] font-medium px-2 py-0.5 rounded-full">
                    {user?.email ? 'साधारण (मुफ़्त) खाता' : 'डायरेक्ट स्टडी मोड'}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Quick Gmail Auth button if not identified or if wants to switch */}
          {!isAdmin && onOpenGmailAuth && (
            <button
              onClick={() => {
                onClose();
                onOpenGmailAuth();
              }}
              className="mt-3 w-full py-1.5 px-3 bg-white/15 hover:bg-white/25 text-amber-200 border border-amber-300/40 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Mail className="w-3.5 h-3.5 text-amber-300" />
              <span>{user?.email ? 'जीमेल बदलें' : 'जीमेल से पहचानें (Profile)'}</span>
            </button>
          )}
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-1 divide-y divide-slate-100 text-sm">
          <div className="space-y-1 pb-3">
            <button
              onClick={() => { onNavigate('home'); onClose(); }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-stone-700 hover:bg-red-50 hover:text-red-700 font-semibold transition-colors cursor-pointer text-left"
            >
              <div className="w-8 h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center">
                <GraduationCap className="w-4 h-4" />
              </div>
              <span>होम स्क्रीन (Home)</span>
            </button>

            <button
              onClick={() => { onNavigate('course'); onClose(); }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-stone-700 hover:bg-red-50 hover:text-red-700 font-semibold transition-colors cursor-pointer text-left"
            >
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                <BookOpen className="w-4 h-4" />
              </div>
              <span>सभी विषय (Class 10th)</span>
            </button>

            <button
              onClick={() => { onNavigate('live'); onClose(); }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-stone-700 hover:bg-red-50 hover:text-red-700 font-semibold transition-colors cursor-pointer text-left"
            >
              <div className="w-8 h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center">
                <Radio className="w-4 h-4 animate-pulse" />
              </div>
              <span>🔴 लाइव क्लास (Live Classes)</span>
            </button>

            <button
              onClick={() => { onNavigate('leaderboard'); onClose(); }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-stone-700 hover:bg-amber-50 hover:text-amber-700 font-semibold transition-colors cursor-pointer text-left"
            >
              <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
                <Trophy className="w-4 h-4" />
              </div>
              <span>🏆 टॉपर लीडरबोर्ड (Leaderboard)</span>
            </button>

            <button
              onClick={() => { onNavigate('routine'); onClose(); }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-stone-700 hover:bg-red-50 hover:text-red-700 font-semibold transition-colors cursor-pointer text-left"
            >
              <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center">
                <Calendar className="w-4 h-4" />
              </div>
              <span>क्लास टाइम टेबल / रूटीन</span>
            </button>

            <button
              onClick={() => { onNavigate('ncert'); onClose(); }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-stone-700 hover:bg-red-50 hover:text-red-700 font-semibold transition-colors cursor-pointer text-left"
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <BookText className="w-4 h-4" />
              </div>
              <span>NCERT पुस्तकें व समाधान</span>
            </button>
          </div>

          <div className="space-y-1 py-3">
            <button
              onClick={() => { onOpenVip(); onClose(); }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-amber-50 text-amber-800 hover:bg-amber-100 font-bold transition-colors cursor-pointer text-left border border-amber-200"
            >
              <div className="w-8 h-8 rounded-lg bg-amber-400 text-stone-900 flex items-center justify-center shadow-sm">
                <Crown className="w-4 h-4" />
              </div>
              <div>
                <div className="leading-tight">टॉपर VIP प्लान (₹99 / ₹600)</div>
                <div className="text-[11px] text-amber-700 font-normal">पूरा कोर्स, PDF नोट्स व टेस्ट</div>
              </div>
            </button>

            <button
              onClick={() => { onNavigate('social'); onClose(); }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-stone-700 hover:bg-red-50 hover:text-red-700 font-semibold transition-colors cursor-pointer text-left"
            >
              <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center">
                <Share2 className="w-4 h-4" />
              </div>
              <span>सोशल मीडिया & हेल्पलाइन</span>
            </button>
          </div>

          <div className="pt-3">
            <button
              onClick={() => { onNavigate('admin'); onClose(); }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-red-900 text-white font-bold transition-colors cursor-pointer text-left shadow-sm"
            >
              <div className="w-8 h-8 rounded-lg bg-red-700 text-white flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <span>एडमिन कंट्रोल पैनल</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-stone-600">
          <button 
            onClick={() => { onNavigate('social'); onClose(); }}
            className="flex items-center gap-1.5 hover:text-red-700 font-semibold cursor-pointer"
          >
            <PhoneCall className="w-3.5 h-3.5 text-red-600" />
            <span>हेल्पलाइन: 9241511070</span>
          </button>
          {user?.email ? (
            <button 
              onClick={logout}
              className="flex items-center gap-1.5 text-rose-600 hover:text-rose-800 font-bold cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>लॉगआउट</span>
            </button>
          ) : (
            <button 
              onClick={() => {
                onClose();
                if (onOpenGmailAuth) onOpenGmailAuth();
              }}
              className="flex items-center gap-1.5 text-red-700 hover:text-red-900 font-bold cursor-pointer"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>जीमेल पहचान</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
