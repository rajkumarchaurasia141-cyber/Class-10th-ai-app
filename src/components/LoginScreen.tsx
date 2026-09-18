import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { BookOpen, AlertCircle, ArrowRight, User, Mail, Shield } from 'lucide-react';

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
    await login(name, email);
    setLoading(false);
  };

  const isAdminEmail = email.trim().toLowerCase() === 'rajkumarchaurasia141@gmail.com';

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-950 p-4 text-center selection:bg-amber-500/30">
      <div className="bg-stone-900 p-8 sm:p-10 rounded-3xl border border-stone-800 max-w-md w-full shadow-2xl relative overflow-hidden text-left">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-amber-500/10 rounded-2xl border border-amber-500/20">
            <BookOpen className="w-8 h-8 text-amber-500" />
          </div>
          <div>
            <span className="text-xs font-bold text-amber-500 tracking-wider uppercase bg-amber-500/10 px-2 py-0.5 rounded">बिहार बोर्ड वर्ग 10</span>
            <h1 className="text-2xl font-black text-white">BSEB 10th पोर्टल</h1>
          </div>
        </div>

        <p className="text-stone-400 text-sm mb-6">
          अपनी पढ़ाई शुरू करने के लिए कृपया अपना <strong>नाम</strong> और <strong>जीमेल</strong> दर्ज करें।
        </p>

        {error && (
          <div className="mb-6 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-start gap-2.5 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <p className="font-medium">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-amber-500" /> आपका नाम
            </label>
            <input
              type="text"
              placeholder="उदा. राहुल कुमार"
              value={name}
              onChange={e => { setName(e.target.value); setError(null); }}
              className="w-full bg-stone-950 border border-stone-800 rounded-xl px-4 py-3 text-white placeholder-stone-600 focus:outline-none focus:border-amber-500 transition-colors text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-amber-500" /> आपका जीमेल (Gmail)
            </label>
            <input
              type="email"
              placeholder="उदा. yourname@gmail.com"
              value={email}
              onChange={e => { setEmail(e.target.value); setError(null); }}
              className="w-full bg-stone-950 border border-stone-800 rounded-xl px-4 py-3 text-white placeholder-stone-600 focus:outline-none focus:border-amber-500 transition-colors text-sm"
              required
            />
          </div>

          {isAdminEmail && (
            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center gap-2 text-xs text-amber-400 font-medium">
              <Shield className="w-4 h-4 text-amber-400 shrink-0" />
              <span>पहचाना गया: आप <strong>एडमिन</strong> के रूप में लॉगिन कर रहे हैं।</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-amber-600/20 flex items-center justify-center gap-2 text-sm mt-4 cursor-pointer"
          >
            {loading ? 'लॉगिन हो रहा है...' : (
              <>
                <span>पोर्टल में प्रवेश करें</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-stone-800/80 text-center">
          <p className="text-xs text-stone-500">
            विद्यार्थी बिना पासवर्ड सीधे अपने नाम और ईमेल से अध्ययन कर सकते हैं।
          </p>
        </div>
      </div>
    </div>
  );
}

