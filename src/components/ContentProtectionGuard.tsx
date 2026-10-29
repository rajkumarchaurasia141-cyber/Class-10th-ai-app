import React, { useEffect, useState } from 'react';
import { ShieldAlert, Lock, ShieldCheck } from 'lucide-react';

interface ContentProtectionGuardProps {
  isAdmin: boolean;
  children?: React.ReactNode;
}

export const ContentProtectionGuard: React.FC<ContentProtectionGuardProps> = ({
  isAdmin,
  children,
}) => {
  const [warningMessage, setWarningMessage] = useState<string | null>(null);
  const [showAntiScreenshotVeil, setShowAntiScreenshotVeil] = useState(false);

  const showSecurityAlert = (msg: string) => {
    setWarningMessage(msg);
  };

  useEffect(() => {
    if (!warningMessage) return;
    const timer = setTimeout(() => {
      setWarningMessage(null);
    }, 2800);
    return () => clearTimeout(timer);
  }, [warningMessage]);

  useEffect(() => {
    // If user is Admin, disable all restrictions and remove lock classes
    if (isAdmin) {
      document.body.classList.remove('protected-content-lock');
      document.documentElement.classList.remove('protected-content-lock');
      return;
    }

    // Apply strict content-lock CSS class for non-admins
    document.body.classList.add('protected-content-lock');
    document.documentElement.classList.add('protected-content-lock');

    // 1. Block Right-Click / Context Menu & Long-Press Menu
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      showSecurityAlert('⚠️ सुरक्षा सूचना: राइट-क्लिक या लॉन्ग-प्रेस कॉपी करना प्रतिबंधित है (केवल एडमिन को अनुमति)।');
      return false;
    };

    // 2. Block Copy Event & Poison/Clear Clipboard
    const handleCopy = (e: ClipboardEvent) => {
      const activeEl = document.activeElement;
      const isInput = activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA');

      // Even in inputs, if not admin, disallow copying confidential questions/answers
      e.preventDefault();
      e.stopPropagation();

      try {
        if (e.clipboardData) {
          e.clipboardData.setData('text/plain', '⚠️ सामग्री कॉपी करना केवल एडमिन के लिए अनुमत है।');
        }
      } catch {}

      showSecurityAlert('⚠️ कॉपी करना प्रतिबंधित है! केवल एडमिन के लिए सामग्री कॉपी करने की अनुमति है।');
      return false;
    };

    // 3. Block Cut Event
    const handleCut = (e: ClipboardEvent) => {
      e.preventDefault();
      e.stopPropagation();
      showSecurityAlert('⚠️ कट या कॉपी करना प्रतिबंधित है (केवल एडमिन के लिए)।');
      return false;
    };

    // 4. Block Drag & Drop of text and images
    const handleDragStart = (e: DragEvent) => {
      e.preventDefault();
      return false;
    };

    // 5. Block Keyboard Shortcuts (Ctrl+C, Ctrl+X, PrintScreen, Win+Shift+S, F12, Ctrl+U, Ctrl+S, Ctrl+P)
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCtrlOrMeta = e.ctrlKey || e.metaKey;
      const key = e.key?.toLowerCase();

      // PrintScreen / Screenshot Key
      if (e.key === 'PrintScreen' || e.code === 'PrintScreen') {
        e.preventDefault();
        try {
          navigator.clipboard?.writeText('⚠️ स्क्रीनशॉट लेना केवल एडमिन के लिए अनुमत है।');
        } catch {}
        setShowAntiScreenshotVeil(true);
        setTimeout(() => setShowAntiScreenshotVeil(false), 2000);
        showSecurityAlert('⚠️ स्क्रीनशॉट लेना प्रतिबंधित है! केवल एडमिन के लिए स्क्रीनशॉट की अनुमति है।');
        return false;
      }

      // Windows Snipping Tool (Win + Shift + S) or Ctrl + Shift + S
      if (isCtrlOrMeta && e.shiftKey && (key === 's' || key === 'i' || key === 'j' || key === 'c')) {
        e.preventDefault();
        setShowAntiScreenshotVeil(true);
        setTimeout(() => setShowAntiScreenshotVeil(false), 2000);
        showSecurityAlert('⚠️ स्क्रीनशॉट या निरीक्षण उपकरण प्रतिबंधित है!');
        return false;
      }

      // Ctrl+C (Copy) or Ctrl+X (Cut)
      if (isCtrlOrMeta && (key === 'c' || key === 'x')) {
        e.preventDefault();
        showSecurityAlert('⚠️ सामग्री कॉपी करना केवल एडमिन के लिए अनुमत है!');
        return false;
      }

      // Ctrl+P (Print to PDF / Paper)
      if (isCtrlOrMeta && key === 'p') {
        e.preventDefault();
        showSecurityAlert('⚠️ प्रिंट या PDF सेव करना प्रतिबंधित है!');
        return false;
      }

      // Ctrl+S (Save HTML page)
      if (isCtrlOrMeta && key === 's') {
        e.preventDefault();
        showSecurityAlert('⚠️ पेज सेव करना प्रतिबंधित है!');
        return false;
      }

      // Ctrl+U (View Page Source)
      if (isCtrlOrMeta && key === 'u') {
        e.preventDefault();
        return false;
      }

      // F12 (DevTools)
      if (e.key === 'F12') {
        e.preventDefault();
        return false;
      }

      // Ctrl+A (Select All) outside of text fields
      if (isCtrlOrMeta && key === 'a') {
        const target = e.target as HTMLElement;
        const isInputField = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA');
        if (!isInputField) {
          e.preventDefault();
          showSecurityAlert('⚠️ पूरी स्क्रीन चुनना प्रतिबंधित है!');
          return false;
        }
      }
    };

    // 6. Handle Keyup for PrintScreen to clear clipboard buffer
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'PrintScreen' || e.code === 'PrintScreen') {
        try {
          navigator.clipboard?.writeText('');
        } catch {}
        setShowAntiScreenshotVeil(true);
        setTimeout(() => setShowAntiScreenshotVeil(false), 2000);
      }
    };

    // 7. Anti-Screen Capture Veil on Window Blur (Mobile screenshot gestures & screen recorders cause blur)
    const handleWindowBlur = () => {
      // Trigger a momentary watermark veil to obstruct third-party capture / app-switcher snapshots
      setShowAntiScreenshotVeil(true);
    };

    const handleWindowFocus = () => {
      setShowAntiScreenshotVeil(false);
    };

    window.addEventListener('contextmenu', handleContextMenu, { capture: true });
    document.addEventListener('copy', handleCopy, { capture: true });
    document.addEventListener('cut', handleCut, { capture: true });
    document.addEventListener('dragstart', handleDragStart, { capture: true });
    window.addEventListener('keydown', handleKeyDown, { capture: true });
    window.addEventListener('keyup', handleKeyUp, { capture: true });
    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('focus', handleWindowFocus);

    return () => {
      document.body.classList.remove('protected-content-lock');
      document.documentElement.classList.remove('protected-content-lock');
      window.removeEventListener('contextmenu', handleContextMenu, { capture: true });
      document.removeEventListener('copy', handleCopy, { capture: true });
      document.removeEventListener('cut', handleCut, { capture: true });
      document.removeEventListener('dragstart', handleDragStart, { capture: true });
      window.removeEventListener('keydown', handleKeyDown, { capture: true });
      window.removeEventListener('keyup', handleKeyUp, { capture: true });
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('focus', handleWindowFocus);
    };
  }, [isAdmin]);

  return (
    <>
      {children}

      {/* Temporary Anti-Screenshot Protection Veil for Non-Admins */}
      {!isAdmin && showAntiScreenshotVeil && (
        <div className="fixed inset-0 z-[9999999] bg-stone-950/95 backdrop-blur-xl text-white flex flex-col items-center justify-center p-6 text-center select-none animate-fade-in pointer-events-none">
          <div className="w-16 h-16 rounded-3xl bg-red-600/30 text-red-500 border-2 border-red-500/50 flex items-center justify-center mb-4">
            <Lock className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-black text-red-400 tracking-tight mb-2">
            स्क्रीन कैप्चर / स्क्रीनशॉट सुरक्षित (Protected)
          </h3>
          <p className="text-stone-300 text-xs sm:text-sm max-w-sm font-semibold leading-relaxed">
            सुरक्षा नीति के अनुसार इस ऐप्लिकेशन में स्क्रीनशॉट और सामग्री कॉपी करना केवल एडमिन के लिए अनुमत है।
          </p>
        </div>
      )}

      {/* Floating Red Warning Toast on Copy or Screenshot Attempt */}
      {!isAdmin && warningMessage && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[999999] max-w-md w-[92%] sm:w-auto animate-fade-in pointer-events-auto">
          <div className="bg-gradient-to-r from-red-950 via-stone-900 to-red-950 text-white px-4 py-3 rounded-2xl shadow-2xl border-2 border-red-500 flex items-center gap-3">
            <div className="p-2 rounded-xl bg-red-600 text-white shrink-0">
              <ShieldAlert className="w-5 h-5 animate-pulse" />
            </div>
            <div className="flex-1">
              <span className="text-[10px] uppercase font-black tracking-wider text-red-300 block">
                सुरक्षा प्रतिबंध (Security Restriction)
              </span>
              <p className="text-xs sm:text-[13px] font-bold text-white leading-snug mt-0.5">
                {warningMessage}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Discreet Admin Privilege Badge if logged in as Admin */}
      {isAdmin && (
        <div
          title="एडमिन सुरक्षा छूट: आप कॉपी और स्क्रीनशॉट ले सकते हैं"
          className="fixed bottom-2 right-2 z-[9999] bg-emerald-700/90 hover:bg-emerald-700 text-white text-[10px] font-black px-2.5 py-1 rounded-full shadow-lg border border-emerald-400 flex items-center gap-1.5 select-none transition-all opacity-80 hover:opacity-100"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-200" />
          <span>Admin Mode (Copy & Screenshot Allowed)</span>
        </div>
      )}
    </>
  );
};
