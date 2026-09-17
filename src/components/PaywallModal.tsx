import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, CheckCircle2, Copy, Send, QrCode } from 'lucide-react';

export const PaywallModal: React.FC = () => {
  const { showPaywall, setShowPaywall, user } = useAuth();
  const [copied, setCopied] = useState(false);
  const upiId = "9708868515@ybl";
  
  if (!showPaywall) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(upiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const emailText = user ? user.email : '';
  const message = `नमस्ते सर, मैंने टॉपर बैच का पेमेंट कर दिया है। मेरी Gmail: ${emailText}`;
  const whatsappUrl = `https://wa.me/919241511070?text=${encodeURIComponent(message)}`;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-stone-900 border border-stone-700 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl relative flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-amber-600 to-amber-500 flex items-center justify-between">
          <h3 className="font-bold text-white text-lg">प्रीमियम कंटेंट अनलॉक करें 🔓</h3>
          <button 
            onClick={() => setShowPaywall(false)}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-black/20 text-white hover:bg-black/30 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          <p className="text-stone-300 text-sm text-center mb-6">
            इस चैप्टर और आगे के सभी नोट्स, टेस्ट और PYQs को अनलॉक करने के लिए टॉपर बैच ज्वाइन करें।
          </p>

          {/* Plans */}
          <div className="space-y-3 mb-8">
            <div className="bg-stone-950 border border-stone-800 rounded-xl p-4 flex items-center justify-between relative overflow-hidden">
              <div>
                <h4 className="font-bold text-white">प्लान 1 (मासिक)</h4>
                <p className="text-xs text-stone-400 mt-1">1 महीने की वैधता</p>
              </div>
              <div className="text-xl font-bold text-amber-400">₹99</div>
            </div>

            <div className="bg-amber-950/30 border border-amber-500/50 rounded-xl p-4 flex items-center justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-amber-500 text-stone-950 text-[10px] font-bold px-2 py-0.5 rounded-bl-lg">
                BEST VALUE
              </div>
              <div>
                <h4 className="font-bold text-amber-400">प्लान 2 (टॉपर बैच)</h4>
                <p className="text-xs text-stone-400 mt-1">पूरे साल की वैधता + सभी विषय</p>
              </div>
              <div className="text-2xl font-bold text-white">₹600</div>
            </div>
          </div>

          {/* Payment Details */}
          <div className="bg-stone-950 rounded-2xl p-5 border border-stone-800 text-center mb-6">
            <h4 className="text-sm font-semibold text-stone-300 mb-3">फीस भेजने के लिए UPI ID</h4>
            
            <div className="flex items-center justify-between bg-stone-900 border border-stone-700 rounded-lg p-3 mb-4">
              <span className="text-amber-400 font-mono font-bold tracking-wide">{upiId}</span>
              <button 
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-800 hover:bg-stone-700 rounded-md text-xs font-semibold text-white transition-colors"
              >
                {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied' : 'Copy ID'}
              </button>
            </div>

            <div className="flex flex-col items-center justify-center pt-2 border-t border-stone-800/50">
              <p className="text-xs text-stone-500 mb-2">या किसी भी ऐप (PhonePe, Paytm, GPay) से स्कैन करें</p>
              <div className="w-32 h-32 bg-white rounded-xl p-2 flex items-center justify-center">
                {/* Placeholder for actual QR code, we'll use an icon for now */}
                <div className="w-full h-full border-4 border-dashed border-stone-300 flex items-center justify-center flex-col gap-2">
                  <QrCode className="w-8 h-8 text-stone-800" />
                  <span className="text-[10px] text-stone-500 font-bold">QR CODE</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <a 
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold py-4 px-4 rounded-xl flex items-center justify-center gap-2 transition-transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <Send className="w-5 h-5" />
            WhatsApp पर पेमेंट स्क्रीनशॉट भेजें
          </a>
          <p className="text-[10px] text-stone-500 text-center mt-3">
            पेमेंट वेरीफाई होने के 5 मिनट के अंदर आपका अकाउंट अनलॉक हो जाएगा।
          </p>
        </div>
      </div>
    </div>
  );
};
