import React, { useState, useEffect } from 'react';
import { Smartphone, Download, X, Sparkles, CheckCircle2 } from 'lucide-react';

export function InstallAppBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Also check if already in standalone mode
    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone) {
      setInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      // Fallback instruction popup
      alert("अपने मोबाइल में ऐप इनस्टॉल करने के लिए:\n1. ब्राउज़र मेनू (⋮) पर क्लिक करें।\n2. 'Add to Home screen' या 'Install app' चुनें।");
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setInstalled(true);
      setShowBanner(false);
    }
    setDeferredPrompt(null);
  };

  if (installed || !showBanner) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 max-w-md mx-auto bg-gradient-to-r from-stone-900 via-red-950 to-stone-900 border-2 border-amber-400 text-white p-4 rounded-3xl shadow-2xl backdrop-blur-xl animate-bounce-short flex items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-red-600 flex items-center justify-center shrink-0 shadow-lg border border-amber-300/40">
          <Smartphone className="w-6 h-6 text-stone-950" />
        </div>
        <div>
          <div className="flex items-center gap-1 text-[10px] font-bold text-amber-400 uppercase tracking-wider">
            <Sparkles className="w-3 h-3" /> 1-Click Mobile App
          </div>
          <h4 className="text-sm font-black text-white">फोन में ऐप इनस्टॉल करें</h4>
          <p className="text-[11px] text-stone-300">बिना ब्राउज़र के सीधे होम स्क्रीन पर चलाएँ!</p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={handleInstallClick}
          className="bg-amber-400 hover:bg-amber-500 text-stone-950 font-black px-4 py-2.5 rounded-xl text-xs shadow-lg cursor-pointer flex items-center gap-1.5 transition-transform active:scale-95"
        >
          <Download className="w-4 h-4" /> इनस्टॉल
        </button>
        <button
          onClick={() => setShowBanner(false)}
          className="text-stone-400 hover:text-white p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
          title="बंद करें"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
