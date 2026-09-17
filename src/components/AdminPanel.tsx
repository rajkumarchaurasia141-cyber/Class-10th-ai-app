import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, UserPlus, CheckCircle, AlertCircle } from 'lucide-react';

export function AdminPanel() {
  const { user } = useAuth();
  const [emailToUnlock, setEmailToUnlock] = useState('');
  const [status, setStatus] = useState<{type: 'idle' | 'success' | 'error', message: string}>({ type: 'idle', message: '' });
  const [isLoading, setIsLoading] = useState(false);

  // Simple hardcoded check - only allow the owner
  if (user?.email !== 'rajkumarchaurasia141@gmail.com') {
    return (
      <div className="p-6 text-center text-red-400 mt-20">
        <ShieldCheck className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <h2 className="text-xl font-bold">Access Denied</h2>
        <p className="mt-2">केवल एडमिन (Rajkumar) को यहाँ आने की अनुमति है।</p>
      </div>
    );
  }

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailToUnlock.trim()) return;

    setIsLoading(true);
    setStatus({ type: 'idle', message: '' });

    try {
      // Create a direct API call or just send to our existing endpoint with a secret key
      // Wait, we can just use the /api/add-vip endpoint we created earlier!
      const res = await fetch('/api/add-vip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: emailToUnlock.trim(), 
          adminKey: "rajkumar_secret_admin_key" // We need to update server.ts to accept this
        })
      });

      const data = await res.json();
      if (res.ok) {
        setStatus({ type: 'success', message: `${emailToUnlock} को सफलतापूर्वक अनलॉक कर दिया गया है!` });
        setEmailToUnlock('');
      } else {
        setStatus({ type: 'error', message: data.error || 'Failed to unlock.' });
      }
    } catch (err) {
      setStatus({ type: 'error', message: 'नेटवर्क एरर या सर्वर समस्या।' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-xl mx-auto w-full pt-10">
      <div className="bg-stone-900 border border-amber-900/30 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl"></div>
        
        <div className="flex items-center gap-3 mb-6 relative z-10">
          <div className="p-3 bg-amber-500/10 rounded-xl">
            <ShieldCheck className="w-6 h-6 text-amber-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">एडमिन पैनल</h2>
            <p className="text-sm text-stone-400">छात्रों को अनलॉक करें</p>
          </div>
        </div>

        <form onSubmit={handleUnlock} className="space-y-4 relative z-10">
          <div>
            <label className="block text-sm font-medium text-stone-300 mb-2">छात्र का Gmail Address डालें:</label>
            <input 
              type="email" 
              value={emailToUnlock}
              onChange={(e) => setEmailToUnlock(e.target.value)}
              placeholder="student@gmail.com"
              className="w-full bg-stone-950 border border-stone-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
              required
            />
          </div>

          <button 
            type="submit" 
            disabled={isLoading || !emailToUnlock}
            className="w-full bg-amber-600 hover:bg-amber-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors"
          >
            {isLoading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            ) : (
              <>
                <UserPlus className="w-5 h-5" />
                अनलॉक करें (VIP बनाएं)
              </>
            )}
          </button>
        </form>

        {status.message && (
          <div className={`mt-4 p-4 rounded-xl flex items-start gap-3 border ${
            status.type === 'success' 
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
              : 'bg-red-500/10 border-red-500/20 text-red-400'
          }`}>
            {status.type === 'success' ? (
              <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            )}
            <p className="text-sm font-medium">{status.message}</p>
          </div>
        )}
      </div>
    </div>
  );
}
