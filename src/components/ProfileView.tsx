import React from 'react';
import { 
  User, 
  Crown, 
  Mail, 
  Calendar, 
  Hourglass, 
  Clock, 
  Phone, 
  Share2, 
  ShieldCheck, 
  LogOut, 
  Sparkles, 
  ChevronRight,
  BookOpen,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface ProfileViewProps {
  onOpenVip: () => void;
  onOpenRoutine: () => void;
  onOpenSocial: () => void;
  onOpenAdmin: () => void;
  onOpenCourse: () => void;
}

export function ProfileView({
  onOpenVip,
  onOpenRoutine,
  onOpenSocial,
  onOpenAdmin,
  onOpenCourse
}: ProfileViewProps) {
  const { user, isVIP, isAdmin, vipDetails, logout } = useAuth();
  const daysLeft = vipDetails?.daysRemaining;

  return (
    <div className="max-w-lg mx-auto p-4 space-y-4 pb-20">
      {/* Profile Card */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-red-600 to-amber-500 text-white flex items-center justify-center font-black text-2xl shadow-md border-2 border-white shrink-0">
          {user?.name ? user.name.charAt(0).toUpperCase() : 'S'}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-black text-stone-900 text-lg truncate">{user?.name || 'छात्र'}</h3>
            {isVIP && (
              <span className="bg-amber-400 text-stone-950 p-1 rounded-full text-xs shadow-xs" title="VIP स्टूडेंट">
                <Crown className="w-3 h-3 fill-current" />
              </span>
            )}
          </div>
          <p className="text-xs text-stone-500 font-mono truncate">{user?.email}</p>
          <span className="inline-block mt-1 text-[10px] font-bold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
            बिहार बोर्ड कक्षा 10वीं (BSEB 2027)
          </span>
        </div>
      </div>

      {/* Subscription Status Card */}
      <div className={`rounded-3xl p-5 border shadow-xs space-y-3 ${
        isVIP
          ? 'bg-gradient-to-br from-amber-500/10 via-amber-100/40 to-white border-amber-300'
          : vipDetails?.isExpired
          ? 'bg-gradient-to-br from-rose-500/10 to-white border-rose-300'
          : 'bg-white border-slate-200'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
              isVIP ? 'bg-amber-500 text-stone-950' : 'bg-slate-100 text-stone-600'
            }`}>
              <Crown className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h4 className="font-extrabold text-stone-900 text-sm">
                {isVIP ? 'टॉपर VIP मेंबरशिप' : vipDetails?.isExpired ? 'VIP प्लान समाप्त' : 'फ्री मेंबरशिप'}
              </h4>
              <p className="text-[11px] text-stone-500">
                {isVIP ? 'सम्पूर्ण स्टडी मैटेरियल अनलॉक है' : 'सभी नोट्स & 50 MCQs पाने हेतु'}
              </p>
            </div>
          </div>

          <button
            onClick={onOpenVip}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black shadow-xs transition-all cursor-pointer ${
              isVIP
                ? 'bg-amber-500 hover:bg-amber-400 text-stone-950'
                : 'bg-red-700 hover:bg-red-800 text-white'
            }`}
          >
            {isVIP ? 'वैधता बढ़ाएँ' : vipDetails?.isExpired ? 'पुनः रिन्यू करें' : 'VIP खरीदें'}
          </button>
        </div>

        {/* Validity Info if VIP or Expired */}
        {vipDetails && (
          <div className="pt-2 border-t border-slate-200/80 text-xs flex items-center justify-between text-stone-600">
            <span className="flex items-center gap-1">
              <Hourglass className="w-3.5 h-3.5 text-amber-600" />
              <span>वैधता: <strong>{vipDetails.formattedExpiry} तक</strong></span>
            </span>
            <span className={`font-bold ${isVIP ? 'text-emerald-600' : 'text-rose-600'}`}>
              {isVIP ? `${daysLeft} दिन बाकी` : 'अवधि पूर्ण'}
            </span>
          </div>
        )}
      </div>

      {/* Menu Options */}
      <div className="bg-white rounded-3xl border border-slate-200 divide-y divide-slate-100 overflow-hidden shadow-xs">
        <button
          onClick={onOpenCourse}
          className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-sm text-stone-900">मेरे विषय & चैप्टर्स</div>
              <div className="text-[11px] text-stone-500">संस्कृत, विज्ञान, गणित, सामाजिक विज्ञान, हिंदी</div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-stone-400" />
        </button>

        <button
          onClick={onOpenRoutine}
          className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-sm text-stone-900">क्लास रूटीन & टाइम टेबल</div>
              <div className="text-[11px] text-stone-500">साप्ताहिक कक्षाओं का विवरण</div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-stone-400" />
        </button>

        <button
          onClick={onOpenSocial}
          className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-pink-50 text-pink-700 flex items-center justify-center">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-sm text-stone-900">स्टडी ग्रुप्स (WhatsApp / Telegram)</div>
              <div className="text-[11px] text-stone-500">हजारों विद्यार्थियों के साथ जुड़ें</div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-stone-400" />
        </button>

        {isAdmin && (
          <button
            onClick={onOpenAdmin}
            className="w-full p-4 flex items-center justify-between bg-stone-900 text-white hover:bg-black transition-colors cursor-pointer text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-stone-800 text-amber-400 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-sm text-white">एडमिन मैनेजमेंट पैनल</div>
                <div className="text-[11px] text-amber-300">पेमेंट रिक्वेस्ट, छात्र लिस्ट & VIP अप्रूवल</div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-stone-400" />
          </button>
        )}
      </div>

      {/* Logout */}
      <button
        onClick={logout}
        className="w-full p-3.5 rounded-2xl bg-white hover:bg-rose-50 text-rose-600 font-bold text-xs border border-rose-200 flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
      >
        <LogOut className="w-4 h-4" />
        <span>ऐप से लॉगआउट करें</span>
      </button>
    </div>
  );
}
