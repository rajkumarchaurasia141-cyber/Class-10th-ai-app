import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Mail, 
  User, 
  ShieldCheck, 
  CheckCircle2, 
  X, 
  ArrowRight, 
  Sparkles, 
  GraduationCap, 
  AlertCircle 
} from 'lucide-react';

interface GmailAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  adminPrompt?: boolean;
}

export function GmailAuthModal({ isOpen, onClose, adminPrompt = false }: GmailAuthModalProps) {
  const { user, login, logout, isAdmin } = useAuth();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const ADMIN_EMAIL = 'rajkumarchaurasia141@gmail.com';
  const cleanEmail = email.trim().toLowerCase();
  const isTargetAdmin = cleanEmail === ADMIN_EMAIL;

  const handleQuickAdmin = async () => {
    setEmail(ADMIN_EMAIL);
    setName('राजकुमार चौरसिया');
    setLoading(true);
    setError(null);
    try {
      await login('राजकुमार चौरसिया (Admin)', ADMIN_EMAIL);
      setSuccess('मुख्य एडमिन की पहचान सफल! सभी एडमिन अधिकार सक्रिय कर दिए गए हैं।');
      setTimeout(() => {
        setSuccess(null);
        onClose();
      }, 1000);
    } catch (err: any) {
      setError('पहचान में त्रुटि: ' + (err?.message || String(err)));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!cleanEmail || !cleanEmail.includes('@')) {
      setError('कृपया एक मान्य Gmail ID दर्ज करें।');
      return;
    }

    const finalName = name.trim() || (isTargetAdmin ? 'राजकुमार चौरसिया (Admin)' : 'विद्यार्थी');

    setLoading(true);
    try {
      await login(finalName, cleanEmail);
      if (isTargetAdmin) {
        setSuccess('मुख्य एडमिन की पहचान सफल! सभी एडमिन अधिकार सक्रिय कर दिए गए हैं।');
      } else {
        setSuccess('जीमेल सफलतापूर्वक जुड़ गया!');
      }
      setTimeout(() => {
        setSuccess(null);
        onClose();
      }, 1000);
    } catch (err: any) {
      setError('लॉगिन में त्रुटि: ' + (err?.message || String(err)));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden relative">
        {/* Top Gradient Header */}
        <div className="bg-gradient-to-r from-red-700 via-stone-900 to-amber-700 p-5 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
              <Mail className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <h3 className="font-black text-lg leading-tight flex items-center gap-2">
                <span>जीमेल से पहचान</span>
                <span className="text-[10px] bg-amber-400 text-stone-950 font-black px-2 py-0.5 rounded-full uppercase">
                  BSEB 2027
                </span>
              </h3>
              <p className="text-xs text-stone-200 mt-0.5">
                एडमिन की पहचान उसके जीमेल से स्वतः हो जाएगी
              </p>
            </div>
          </div>
        </div>

        {/* Body Form */}
        <div className="p-6 space-y-4">
          {/* Quick Admin Identification Button */}
          <div className="p-3.5 bg-gradient-to-r from-amber-50 to-amber-100/60 border border-amber-300 rounded-2xl">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs font-bold text-stone-800">
                <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
                <span>मुख्य एडमिन (राजकुमार चौरसिया)</span>
              </div>
              <button
                type="button"
                onClick={handleQuickAdmin}
                disabled={loading}
                className="px-3 py-1.5 bg-stone-900 hover:bg-black text-amber-400 font-bold text-xs rounded-xl shadow-xs transition-transform active:scale-95 cursor-pointer shrink-0 flex items-center gap-1"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>एडमिन पहचान</span>
              </button>
            </div>
            <p className="text-[11px] text-stone-600 mt-1 font-mono">
              rajkumarchaurasia141@gmail.com
            </p>
          </div>

          {/* Alert Messages */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{success}</span>
            </div>
          )}

          {/* Form for any custom Gmail */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-red-600" />
                <span>जीमेल आईडी (Gmail ID)</span>
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError(null);
                }}
                placeholder="उदा. rajkumarchaurasia141@gmail.com या आपकी जीमेल"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:border-red-600 shadow-inner"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-red-600" />
                <span>नाम (वैकल्पिक / Optional)</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={isTargetAdmin ? 'राजकुमार चौरसिया' : 'आपका नाम'}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:border-red-600 shadow-inner"
              />
            </div>

            {/* Realtime Admin recognition notice */}
            {isTargetAdmin && (
              <div className="p-2.5 bg-amber-50 border border-amber-300 rounded-xl flex items-center gap-2 text-xs text-amber-900 font-bold animate-fade-in">
                <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
                <span>मान्य एडमिन जीमेल! प्रवेश पर समस्त एडमिन अधिकार अनलॉक होंगे।</span>
              </div>
            )}

            <div className="pt-2 flex items-center gap-2">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 bg-gradient-to-r from-red-700 via-red-600 to-amber-600 hover:from-red-800 hover:to-amber-700 text-white font-black text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <span>पहचान हो रही है...</span>
                ) : (
                  <>
                    <span>{isTargetAdmin ? 'एडमिन के रूप में पुष्टि करें' : 'जीमेल से पहचानें'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={onClose}
                className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-stone-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                रद्द करें
              </button>
            </div>
          </form>

          {/* Current Status Footer */}
          {user?.email && (
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-stone-500">
              <span className="truncate">वर्तमान: <strong>{user.email}</strong> {isAdmin && '(Admin)'}</span>
              <button
                type="button"
                onClick={() => {
                  logout();
                  setError(null);
                  setSuccess('लॉगआउट कर दिया गया है।');
                  setTimeout(() => setSuccess(null), 1500);
                }}
                className="text-red-600 hover:text-red-800 font-bold cursor-pointer shrink-0 ml-2"
              >
                हटाएँ
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
