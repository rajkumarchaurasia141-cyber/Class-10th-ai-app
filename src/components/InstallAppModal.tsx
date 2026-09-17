import React, { useState, useEffect } from 'react';
import { Smartphone, Download, CheckCircle2, Globe, ExternalLink, X, Sparkles, Share2 } from 'lucide-react';

interface InstallAppModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InstallAppModal: React.FC<InstallAppModalProps> = ({ isOpen, onClose }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    const handleBeforeInstall = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    }
  };

  const appUrl = window.location.href;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(appUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-stone-900 border border-amber-500/40 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl relative text-stone-100">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg bg-stone-800 text-stone-400 hover:text-white hover:bg-stone-700 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-600 flex items-center justify-center text-stone-950 font-bold shadow-lg shadow-amber-500/20">
            <Smartphone className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <span>Android फोन में ऐप इंस्टॉल करें</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                100% कार्यशील
              </span>
            </h3>
            <p className="text-xs text-stone-400">
              BSEB 10वीं AI शिक्षक को बिना किसी झंझट के अपने मोबाइल में चलाएं
            </p>
          </div>
        </div>

        {/* Method 1: Direct Install via Chrome */}
        <div className="bg-stone-950 border border-stone-800 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
              <Sparkles className="w-4 h-4" />
              <span>विधि 1: मोबाइल में सीधे इंस्टॉल करें (सबसे तेज़)</span>
            </div>
            <span className="text-[11px] text-stone-400 font-mono">0 MB स्टोरेज</span>
          </div>

          <p className="text-xs text-stone-300 leading-relaxed">
            यह ऐप एक आधुनिक <strong>PWA (Progressive Web App)</strong> है। यह आपके फोन में बिना किसी APK डाउनलोड किए सीधे इंस्टॉल हो जाती है और बिल्कुल असली Android App की तरह फुल स्क्रीन में काम करती है।
          </p>

          {deferredPrompt ? (
            <button
              onClick={handleInstallClick}
              className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-amber-500/20"
            >
              <Download className="w-4 h-4" />
              <span>अभी फोन में इंस्टॉल करें (One-Click Install)</span>
            </button>
          ) : (
            <div className="bg-stone-900 border border-stone-800 rounded-lg p-3 text-xs text-stone-300 space-y-1.5">
              <div className="font-semibold text-white">मोबाइल Chrome में कैसे लगाएं:</div>
              <div className="flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-amber-500/20 text-amber-400 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">1</span>
                <span>फोन के क्रोम ब्राउज़र में ऊपर दाईं ओर <strong>तीन डॉट्स (⋮)</strong> दबाएं।</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-amber-500/20 text-amber-400 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">2</span>
                <span><strong>'Install app'</strong> या <strong>'Add to Home screen (होम स्क्रीन में जोड़ें)'</strong> पर क्लिक करें।</span>
              </div>
            </div>
          )}
        </div>

        {/* Method 2: PWABuilder APK Generator */}
        <div className="bg-stone-950 border border-stone-800 rounded-xl p-4 space-y-2.5">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
            <Globe className="w-4 h-4" />
            <span>विधि 2: यदि आपको सचमुच .APK फाइल ही चाहिए</span>
          </div>

          <p className="text-xs text-stone-300 leading-relaxed">
            इस ऐप को <strong>Microsoft PWABuilder</strong> द्वारा 1 मिनट में असली Android <code>.apk</code> पैकेज में बदला जा सकता है:
          </p>

          <ol className="text-xs text-stone-400 space-y-1 pl-4 list-decimal">
            <li>नीचे दिए गए बटन से अपने ऐप का लिंक कॉपी करें।</li>
            <li><strong>PWABuilder.com</strong> खोलें और लिंक पेस्ट करें।</li>
            <li><strong>'Package for Android'</strong> पर क्लिक करके डाउनलोड करें।</li>
          </ol>

          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={handleCopyLink}
              className="flex-1 py-2 px-3 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-medium flex items-center justify-center gap-1.5 border border-stone-700 transition-colors"
            >
              {copiedLink ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copiedLink ? 'लिंक कॉपी हो गया!' : 'ऐप लिंक कॉपी करें'}</span>
            </button>

            <a
              href="https://www.pwabuilder.com"
              target="_blank"
              rel="noopener noreferrer"
              className="py-2 px-3 rounded-lg bg-stone-800 hover:bg-stone-700 text-amber-300 text-xs font-semibold flex items-center gap-1 border border-stone-700 transition-colors"
            >
              <span>PWABuilder</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Note about Kotlin vs Web */}
        <div className="text-[11px] text-stone-400 bg-amber-950/20 border border-amber-500/20 rounded-lg p-2.5 leading-relaxed">
          💡 <strong>ध्यान दें:</strong> YouTube पर जो प्रॉम्ट (N-Educate) बताया जाता है, वह केवल उन ऐप्स पर काम करता है जो शुरुआत में ही <em>"Android (Kotlin)"</em> भाषा में बनाई गई हों। यह ऐप एक <em>Full-Stack Web App</em> है, इसलिए इसे ऊपर दी गई <strong>विधि 1 (PWA)</strong> से तुरंत अपने फोन में बिना किसी झंझट के चलाया जा सकता है।
        </div>
      </div>
    </div>
  );
};
