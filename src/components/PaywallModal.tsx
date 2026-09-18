import React from 'react';
import { Lock } from 'lucide-react';

export function PaywallModal({ onClose }: any) {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-stone-900 p-8 rounded-3xl max-w-sm w-full border border-amber-500/30 text-center shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 bg-amber-500/20 rounded-full blur-3xl"></div>
        
        <div className="mx-auto w-16 h-16 bg-amber-500/10 flex items-center justify-center rounded-full mb-6 relative z-10">
          <Lock className="w-8 h-8 text-amber-500" />
        </div>
        
        <h2 className="text-2xl font-black text-white mb-3 relative z-10">VIP Access Required</h2>
        <p className="text-stone-400 mb-8 leading-relaxed relative z-10">
          चैप्टर 2 और उसके आगे के सभी चैप्टर केवल VIP छात्रों के लिए हैं। अपना अकाउंट अनलॉक करवाने के लिए एडमिन (Rajkumar) से संपर्क करें।
        </p>
        <button onClick={onClose} className="w-full bg-stone-800 hover:bg-stone-700 text-white font-bold p-3.5 rounded-xl transition-colors relative z-10">
          वापस जाएँ
        </button>
      </div>
    </div>
  );
}
