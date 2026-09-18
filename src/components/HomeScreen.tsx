import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { BookText, Crown, Sparkles, ChevronRight, CheckCircle2 } from 'lucide-react';
import { PaywallModal } from './PaywallModal';

export function HomeScreen({ onSelect }: any) {
  const { subjects, loading } = useData();
  const { isVIP } = useAuth();
  const [showPaywall, setShowPaywall] = useState(false);

  if (loading) return <div className="text-center p-10 text-stone-400">विषय लोड हो रहे हैं...</div>;

  const subList = Object.values(subjects);
  if (subList.length === 0) return <div className="text-center p-10 text-stone-400">कोई विषय नहीं मिला।</div>;

  return (
    <div className="p-4 max-w-4xl mx-auto space-y-6">
      {/* VIP Plan Promo Banner */}
      {!isVIP ? (
        <div 
          onClick={() => setShowPaywall(true)}
          className="bg-gradient-to-r from-amber-950/60 via-stone-900 to-amber-950/40 border border-amber-500/40 rounded-3xl p-5 md:p-6 shadow-xl cursor-pointer hover:border-amber-500 transition-all relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 -mr-12 -mt-12 w-36 h-36 bg-amber-500/15 rounded-full blur-2xl group-hover:bg-amber-500/25 transition-all"></div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
                <Crown className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wider bg-amber-500/10 px-2 py-0.5 rounded">
                    फुल कोर्स VIP प्लान
                  </span>
                  <span className="text-xs text-amber-300/80 font-medium">
                    1 माह: ₹99 | 1 वर्ष: ₹600
                  </span>
                </div>
                <h3 className="text-lg md:text-xl font-black text-white mt-1">
                  सभी अध्यायों के पूरे नोट्स & 50 MCQs अनलॉक करें
                </h3>
                <p className="text-xs text-stone-400 mt-0.5">
                  1 महीना मात्र ₹99 अथवा 1 पूरा वर्ष मात्र ₹600 में — क्लिक करके प्लान देखें
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold px-4 py-2.5 rounded-xl text-xs whitespace-nowrap shadow transition-all shrink-0">
              <span>प्लान देखें</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-stone-900/90 border border-amber-500/30 rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/10 rounded-xl text-amber-400">
              <Crown className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-amber-400">VIP एक्सेस सक्रिय है</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <p className="text-xs text-stone-400">आपके पास सभी विषयों और अध्यायों का सम्पूर्ण एक्सेस है।</p>
            </div>
          </div>
          <button 
            onClick={() => setShowPaywall(true)} 
            className="text-xs text-stone-400 hover:text-amber-400 underline cursor-pointer"
          >
            प्लान विवरण
          </button>
        </div>
      )}

      {/* Subjects Grid */}
      <div>
        <h2 className="text-2xl font-bold mb-4 text-amber-500">सभी विषय (Class 10)</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {subList.map((sub: any, index: number) => (
            <div 
              key={sub.id || `sub-${index}`} 
              onClick={() => onSelect(sub.id)} 
              className="bg-stone-900 p-6 rounded-2xl cursor-pointer border border-stone-800 hover:border-amber-500/50 hover:bg-stone-800/50 transition-all flex items-center gap-4 shadow-lg"
            >
              <div className="p-4 bg-amber-500/10 rounded-xl text-amber-500">
                <BookText className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">{sub.subject_name_hindi || sub.subject_name || sub.id}</h3>
                <p className="text-sm text-stone-400 mt-1">{sub.chapters?.length || 0} अध्याय उपलब्ध</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showPaywall && <PaywallModal onClose={() => setShowPaywall(false)} />}
    </div>
  );
}
