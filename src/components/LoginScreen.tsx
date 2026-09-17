import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, ArrowRight } from 'lucide-react';

export const LoginScreen: React.FC = () => {
  const { login } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      setError('कृपया अपना नाम और Gmail ID भरें।');
      return;
    }
    if (!email.includes('@')) {
      setError('कृपया सही Gmail ID भरें।');
      return;
    }
    login(name.trim(), email.trim());
  };

  return (
    <div className="min-h-screen bg-stone-950 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-stone-900 border border-stone-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        {/* Decorative background blur */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        
        <div className="relative z-10">
          <div className="flex flex-col items-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl flex items-center justify-center shadow-lg mb-4">
              <GraduationCap className="w-10 h-10 text-stone-900" />
            </div>
            <h1 className="text-3xl font-extrabold text-white font-serif tracking-tight">Padhega Bihar</h1>
            <p className="text-stone-400 mt-2 text-center">बिहार बोर्ड 10वीं की सर्वश्रेष्ठ तैयारी</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-xl text-sm text-center">
                {error}
              </div>
            )}
            
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-stone-300 ml-1">छात्र का नाम (Full Name)</label>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="उदा. राहुल कुमार"
                className="w-full bg-stone-950 border border-stone-800 rounded-xl px-4 py-3.5 text-white placeholder-stone-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-stone-300 ml-1">Gmail ID</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="उदा. student@gmail.com"
                className="w-full bg-stone-950 border border-stone-800 rounded-xl px-4 py-3.5 text-white placeholder-stone-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
              />
            </div>

            <button 
              type="submit"
              className="w-full bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-colors mt-4 text-lg"
            >
              ऐप में प्रवेश करें
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
