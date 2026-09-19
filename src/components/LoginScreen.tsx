import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  GraduationCap, 
  AlertCircle, 
  ArrowRight, 
  User, 
  Mail, 
  ShieldCheck, 
  Sparkles, 
  Award, 
  Flame,
  BookOpen,
  CheckCircle2,
  Quote
} from 'lucide-react';

export function LoginScreen() {
  const { login, error, setError } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('कृपया अपना नाम दर्ज करें।');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('कृपया एक मान्य Gmail दर्ज करें।');
      return;
    }
    setLoading(true);
    try {
      await login(name, email);
    } catch (err: any) {
      console.warn("Login attempt note:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (quickName: string, quickEmail: string) => {
    setError(null);
    setLoading(true);
    try {
      await login(quickName, quickEmail);
    } catch (err: any) {
      console.warn("Quick login note:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleClearCache = () => {
    try {
      localStorage.clear();
      window.location.reload();
    } catch {}
  };

  const isAdminEmail = email.trim().toLowerCase() === 'rajkumarchaurasia141@gmail.com';

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 flex flex-col items-center justify-center p-3.5 sm:p-6 selection:bg-red-500/30 overflow-x-hidden">
      {/* Centered Mobile/Desktop Container */}
      <div className="w-full max-w-md mx-auto space-y-4 overflow-x-hidden">
        
        {/* Top Branding Emblem */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-red-600/20 via-amber-500/20 to-red-600/20 border border-amber-500/30 px-3.5 py-1.5 rounded-full shadow-inner">
            <Flame className="w-4 h-4 text-amber-400 animate-pulse" />
            <span className="text-xs font-black text-amber-300 tracking-wide uppercase">
              पढ़ेगा बिहार • बढ़ेगा बिहार
            </span>
          </div>

          <div className="flex items-center justify-center gap-2.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-red-700 via-red-600 to-amber-600 text-white flex items-center justify-center shadow-lg shadow-red-900/30 border border-white/20">
              <GraduationCap className="w-7 h-7" />
            </div>
            <div className="text-left">
              <h1 className="text-2xl sm:text-3xl font-black text-white leading-none tracking-tight">
                टॉपर बैच <span className="text-amber-400">2027</span>
              </h1>
              <p className="text-xs text-stone-300 font-medium mt-0.5">
                बिहार बोर्ड कक्षा 10वीं (BSEB 2027) टॉपर पोर्टल
              </p>
            </div>
          </div>
        </div>

        {/* Main Login Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200/90 relative overflow-hidden text-left">
          
          {/* Subtle Top Accent */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-red-600 via-amber-500 to-red-700"></div>

          <div className="mb-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg sm:text-xl font-black text-stone-900">
                विद्यार्थी प्रवेश (Student Login)
              </h2>
              <span className="text-[10px] font-extrabold text-red-700 bg-red-50 border border-red-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-500" />
                लक्ष्य 450+
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-1">
              अध्ययन शुरू करने के लिए अपना नाम व ईमेल दर्ज करें — बिना किसी जटिल पासवर्ड के।
            </p>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-4 p-3 rounded-2xl bg-red-50 border border-red-200 text-red-700 flex items-start gap-2.5 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <p className="font-semibold">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-red-600" /> 
                <span>आपका पूरा नाम (Full Name)</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="उदा. राहुल कुमार"
                  value={name}
                  onChange={e => { setName(e.target.value); setError(null); }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-stone-900 placeholder-stone-400 focus:outline-none focus:border-red-600 focus:bg-white transition-all text-sm font-medium shadow-inner"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-red-600" /> 
                <span>आपका जीमेल (Active Gmail ID)</span>
              </label>
              <div className="relative">
                <input
                  type="email"
                  placeholder="उदा. rahul.kumar@gmail.com"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setError(null); }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-stone-900 placeholder-stone-400 focus:outline-none focus:border-red-600 focus:bg-white transition-all text-sm font-medium shadow-inner"
                  required
                />
              </div>
              <p className="text-[10px] text-stone-400 mt-1 pl-1">
                * इसी जीमेल से आपका VIP कोर्स और नोट्स सुरक्षित रहेंगे।
              </p>
            </div>

            {isAdminEmail && (
              <div className="p-3 bg-amber-50 border border-amber-300 rounded-2xl flex items-center gap-2 text-xs text-amber-900 font-bold animate-fade-in">
                <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
                <span>पहचाना गया: आप <strong>सुपर एडमिन</strong> के रूप में लॉगिन कर रहे हैं।</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-red-700 via-red-600 to-amber-600 hover:from-red-800 hover:to-amber-700 disabled:opacity-50 text-white font-black py-3.5 rounded-2xl transition-all shadow-lg shadow-red-700/25 flex items-center justify-center gap-2 text-sm mt-2 cursor-pointer active:scale-[0.99]"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
                  <span>पोर्टल में प्रवेश हो रहा है...</span>
                </div>
              ) : (
                <>
                  <span>पढ़ाई शुरू करें (Start Learning)</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Divider: OR 1-Click Fast Entry */}
            <div className="relative my-3.5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white px-2.5 text-stone-400 font-bold uppercase tracking-wider text-[10px]">
                  या 1-क्लिक में तुरंत शुरू करें
                </span>
              </div>
            </div>

            {/* Quick Access Buttons */}
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => handleQuickLogin('BSEB विद्यार्थी', 'student.bseb@gmail.com')}
                disabled={loading}
                className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-stone-800 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors border border-slate-200 cursor-pointer shadow-xs active:scale-[0.98]"
              >
                <GraduationCap className="w-4 h-4 text-red-600" />
                <span>विद्यार्थी प्रवेश</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('Rajkumar Chaurasia', 'rajkumarchaurasia141@gmail.com')}
                disabled={loading}
                className="py-2.5 px-3 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-950 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors border border-amber-200 cursor-pointer shadow-xs active:scale-[0.98]"
              >
                <ShieldCheck className="w-4 h-4 text-amber-600" />
                <span>एडमिन प्रवेश</span>
              </button>
            </div>
          </form>

          {/* Feature Badges Grid */}
          <div className="mt-5 pt-4 border-t border-slate-100 grid grid-cols-2 gap-2 text-[11px] font-bold text-stone-600">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>सभी 6 विषय नोट्स</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>50-50 वस्तुनिष्ठ MCQs</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>NCERT पुस्तकें & हल</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>टॉपर परीक्षा टिप्स</span>
            </div>
          </div>
        </div>

        {/* Powerful Motivational Card (विशेष प्रेरणादायक संदेश) */}
        <div className="bg-gradient-to-br from-amber-500/15 via-slate-900 to-red-950/40 border border-amber-500/30 rounded-3xl p-4 sm:p-5 shadow-xl text-left relative overflow-hidden group">
          <div className="absolute top-0 right-0 -mr-6 -mt-6 w-24 h-24 bg-amber-400/10 rounded-full blur-xl pointer-events-none"></div>

          <div className="flex items-start gap-3 relative z-10">
            <div className="w-9 h-9 rounded-2xl bg-amber-400/20 border border-amber-400/30 flex items-center justify-center text-amber-300 shrink-0 mt-0.5">
              <Quote className="w-4 h-4 fill-current" />
            </div>
            
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 text-amber-400 text-[11px] font-extrabold uppercase tracking-wider">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                <span>टॉपर संकल्प 2027</span>
              </div>
              
              <p className="text-white font-black text-sm sm:text-base leading-snug">
                "मेहनत इतनी खामोशी से करो कि सफलता शोर मचा दे! आज किताबों में बहाया गया तुम्हारा हर एक कतरा पसीना, कल बिहार बोर्ड के मेरिट लिस्ट में तुम्हारा नाम चमकाएगा।"
              </p>

              <div className="flex items-center justify-between pt-1 border-t border-white/10 text-[11px] text-amber-200/90 font-medium">
                <span>— अपने माता-पिता के सपनों को सच करने का वक्त आ गया है</span>
                <span className="font-bold text-amber-300">🎯 450+ Target</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-center space-y-1">
          <p className="text-[11px] text-stone-400 font-medium">
            बिहार विद्यालय परीक्षा समिति (BSEB 2027) के विद्यार्थियों द्वारा 100% विश्वसनीय
          </p>
          <button
            onClick={handleClearCache}
            className="text-[10px] text-stone-500 hover:text-stone-300 underline cursor-pointer"
          >
            ऐप रिफ्रेश/डेटा रीसेट करें (Troubleshoot & Reset)
          </button>
        </div>

      </div>
    </div>
  );
}
