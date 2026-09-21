import React, { useState, useEffect, useRef } from 'react';
import { 
  Crown, 
  CheckCircle2, 
  Sparkles, 
  X, 
  ShieldCheck, 
  Copy, 
  Check, 
  QrCode, 
  Upload, 
  Image as ImageIcon, 
  Loader2, 
  AlertCircle,
  FileText,
  Mail,
  Smartphone
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import { doc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore';

export function PaywallModal({ onClose }: { onClose: () => void }) {
  const { user, fbUser, login } = useAuth();
  
  // Dynamic UPI and Price Config with standard default values
  const [config, setConfig] = useState({
    upiId: "9708868515@yb1",
    price: 299,
    qrCodeUrl: ""
  });

  const [copiedUpi, setCopiedUpi] = useState(false);
  const [studentEmailInput, setStudentEmailInput] = useState(user?.email || '');
  const [studentNameInput, setStudentNameInput] = useState(user?.name || '');

  // Payment screenshot processing states
  const [screenshotBase64, setScreenshotBase64] = useState<string | null>(null);
  const [screenshotFileName, setScreenshotFileName] = useState<string>('');
  const [utrNumber, setUtrNumber] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Real-time listener to payment configuration settings
  useEffect(() => {
    const docRef = doc(db, 'app_settings', 'payment_config');
    const unsub = onSnapshot(docRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setConfig({
          upiId: data.upiId || "9708868515@yb1",
          price: Number(data.price) || 299,
          qrCodeUrl: data.qrCodeUrl || ""
        });
      }
    }, (err) => {
      console.warn("Could not load remote payment configuration:", err);
    });
    return () => unsub();
  }, []);

  const handleCopyUpi = async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(config.upiId);
        setCopiedUpi(true);
        setTimeout(() => setCopiedUpi(false), 2500);
        return;
      }
    } catch {}

    // Fallback copy method
    try {
      const textArea = document.createElement('textarea');
      textArea.value = config.upiId;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopiedUpi(true);
      setTimeout(() => setCopiedUpi(false), 2500);
    } catch (err: any) {
      console.warn('Copy failed:', err);
    }
  };

  // Client-side instant Canvas image compression
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('कृपया केवल फोटो (JPG, PNG) फाइल चुनें।');
      return;
    }

    setErrorMessage(null);
    setScreenshotFileName(file.name);

    const reader = new FileReader();
    reader.onerror = () => {
      setErrorMessage('फोटो पढ़ने में त्रुटि। कृपया पुनः प्रयास करें।');
    };
    reader.onload = (event) => {
      const img = new Image();
      img.onerror = () => {
        setErrorMessage('फोटो लोड नहीं हो सकी। कृपया दूसरा स्क्रीनशॉट चुनें।');
      };
      img.onload = () => {
        // Create canvas for ultra-fast compression
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 750; // Requested size limit to stay under 70KB
        let width = img.width;
        let height = img.height;

        if (width > MAX_WIDTH) {
          height = Math.round(height * (MAX_WIDTH / width));
          width = MAX_WIDTH;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          // Compress to JPEG with 0.6 quality (Instantly results in 30KB - 60KB payload)
          const dataUrl = canvas.toDataURL('image/jpeg', 0.6);
          setScreenshotBase64(dataUrl);
        } else {
          setScreenshotBase64(event.target?.result as string);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!screenshotBase64) {
      setErrorMessage('कृपया पहले अपने पेमेंट का स्क्रीनशॉट फोटो अपलोड करें।');
      return;
    }

    const emailForPayload = (user?.email || studentEmailInput).trim().toLowerCase();
    if (!emailForPayload || !emailForPayload.includes('@')) {
      setErrorMessage('कृपया एक वैध ईमेल (Gmail) दर्ज करें ताकि आपका कोर्स अनलॉक हो सके।');
      return;
    }

    const finalStudentName = (user?.name || studentNameInput).trim() || 'छात्र';

    // Auto save user details to local identity if logged out or input changes
    if (!user?.email) {
      try {
        login(finalStudentName, emailForPayload);
      } catch (err) {
        console.warn("Local registration failed:", err);
      }
    }

    setSubmitting(true);

    const timestamp = Date.now();
    const uid = fbUser?.uid || `simulated_${emailForPayload.replace(/[^a-zA-Z0-9]/g, '_')}`;
    const requestId = `req_${uid}_${timestamp}`;

    try {
      // Create document payload as requested by user
      const payload = {
        userId: uid,
        userEmail: emailForPayload,
        userName: finalStudentName,
        courseName: "Crash Course",
        amount: config.price,
        upiRef: utrNumber.trim() || "N/A",
        screenshotBase64: screenshotBase64,
        status: "pending",
        createdAt: serverTimestamp()
      };

      // Add to "payment_requests" collection
      const requestDocRef = doc(db, 'payment_requests', requestId);
      await setDoc(requestDocRef, payload);

      // Trigger email notification
      try {
        await fetch('/api/send-payment-notification', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            studentName: finalStudentName,
            studentEmail: emailForPayload,
            amount: config.price,
            screenshotUrl: screenshotBase64,
            requestId: requestId
          })
        });
      } catch (emailErr) {
        console.error("Failed to trigger email notification:", emailErr);
      }

      setSubmitSuccess(true);
      alert("पेमेंट स्क्रीनशॉट सफलतापूर्वक भेज दिया गया है! एडमिन द्वारा सत्यापन होते ही सभी चैप्टर्स अनलॉक हो जाएंगे।");
      onClose();
    } catch (err: any) {
      console.error("Payment submission failed:", err);
      const isQuota = err?.code === 'resource-exhausted' || err?.message?.includes('Quota') || err?.message?.includes('resource-exhausted');
      if (isQuota) {
        setErrorMessage('⚠️ सर्वर दैनिक लिमिट समाप्त (Daily Quota Reached): हमारे डेटाबेस की आज की अपलोड सीमा समाप्त हो गई है। आप चिंता न करें - कृपया सीधे एडमिन के फोन नंबर या व्हाट्सएप (9708868515) पर पेमेंट स्क्रीनशॉट भेजकर अपना कोर्स तुरंत अनलॉक करवा लें!');
      } else {
        setErrorMessage(err?.message || 'कनेक्शन एरर। कृपया दोबारा सबमिट करने का प्रयास करें।');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-stone-950/90 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 z-50 overflow-y-auto animate-fade-in">
      <div className="bg-white rounded-3xl border border-stone-200 shadow-2xl max-w-md w-full relative overflow-hidden my-auto p-5 sm:p-6 flex flex-col max-h-[96vh] text-stone-900">
        
        {/* Modal Top Header Bar */}
        <div className="flex items-center justify-between border-b border-stone-100 pb-3 mb-4 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <Crown className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <h3 className="text-sm font-black text-stone-900 tracking-tight uppercase">बिहार बोर्ड परीक्षा 2027</h3>
              <p className="text-[10px] text-stone-500 font-bold">Board Exam Crash Course</p>
            </div>
          </div>
          
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center transition-all cursor-pointer"
            title="बंद करें"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable container for Paywall steps */}
        <div className="overflow-y-auto pr-1 flex-1 space-y-4 scrollbar-none">
          
          {/* Main Hero Header */}
          <div className="text-center bg-stone-50 rounded-2xl p-4 border border-stone-100 relative">
            <h2 className="text-lg sm:text-xl font-black text-stone-900">
              क्रैश कोर्स अनलॉक करें - मात्र ₹{config.price}
            </h2>
            <p className="text-[11px] text-stone-600 mt-1 font-semibold leading-relaxed">
              सभी विषयों के चैप्टर 2 और उसके बाद के सभी नोट्स, VVI टॉपर टिप्स, और प्रश्नोत्तरी तुरंत अनलॉक करें।
            </p>
            <div className="absolute top-1 right-2 animate-bounce">
              <Sparkles className="w-4 h-4 text-amber-500" />
            </div>
          </div>

          {/* QR Code and Scanner Section */}
          {config.qrCodeUrl ? (
            <div className="bg-stone-50 border border-stone-200 rounded-2xl p-3 text-center space-y-2">
              <span className="text-[11px] font-black text-stone-500 flex items-center justify-center gap-1">
                <QrCode className="w-4 h-4 text-red-600 animate-pulse" /> QR कोड स्कैन करके पेमेंट करें:
              </span>
              <div className="w-44 h-44 mx-auto bg-white p-2.5 rounded-xl border border-stone-200 shadow-sm">
                <img 
                  src={config.qrCodeUrl} 
                  alt="UPI QR Code" 
                  className="w-full h-full object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>
              <p className="text-[10px] text-stone-500 font-semibold">GPay, PhonePe, Paytm, या अन्य किसी भी UPI ऐप से स्कैन करें</p>
            </div>
          ) : (
            <div className="bg-stone-50 border border-dashed border-stone-300 rounded-2xl p-4 text-center space-y-1">
              <QrCode className="w-6 h-6 text-stone-400 mx-auto" />
              <span className="text-[11px] font-bold text-stone-500 block">QR कोड फ़िलहाल अनुपलब्ध है</span>
              <p className="text-[9px] text-stone-400">कृपया नीचे दी गई UPI आईडी का उपयोग करके भुगतान करें।</p>
            </div>
          )}

          {/* Payment Steps Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* STEP 1: Copy UPI ID */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-black text-stone-700 flex items-center gap-1">
                <span className="w-4 h-4 rounded-full bg-red-600 text-white flex items-center justify-center text-[9px] font-black">1</span>
                QR कोड स्कैन करके या UPI ID पर ₹{config.price} भेजें:
              </label>

              <div className="bg-stone-50 border border-stone-200 rounded-xl p-2.5 flex items-center justify-between gap-2 shadow-xs">
                <div className="overflow-hidden">
                  <span className="text-xs text-stone-500 font-bold block uppercase tracking-wider text-[9px]">Official UPI Address</span>
                  <span className="font-mono text-xs sm:text-sm font-black text-red-700 tracking-tight select-all">
                    {config.upiId}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleCopyUpi}
                  className={`px-3 py-1.5 rounded-lg font-black text-xs transition-all cursor-pointer flex items-center gap-1 ${
                    copiedUpi
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-stone-900 hover:bg-stone-800 text-white shadow-xs'
                  }`}
                  style={{ minHeight: '44px' }}
                >
                  {copiedUpi ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>कॉपी हो गया!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>UPI ID कॉपी करें</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* STEP 2: Screenshot uploader */}
            <div className="space-y-2">
              <label className="text-[11px] font-black text-stone-700 flex items-center gap-1">
                <span className="w-4 h-4 rounded-full bg-red-600 text-white flex items-center justify-center text-[9px] font-black">2</span>
                पेमेंट का स्क्रीनशॉट यहाँ अपलोड करें:
              </label>

              <input 
                type="file" 
                ref={fileInputRef}
                accept="image/*" 
                onChange={handleFileChange} 
                className="hidden" 
              />

              {!screenshotBase64 ? (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-stone-300 hover:border-red-600 hover:bg-stone-50 rounded-2xl p-4 text-center cursor-pointer transition-all"
                >
                  <Upload className="w-6 h-6 text-stone-400 mx-auto mb-1.5" />
                  <span className="text-xs font-black text-stone-800 block">
                    स्क्रीनशॉट फोटो चुनें (JPEG/PNG)
                  </span>
                  <span className="text-[10px] text-stone-500 block mt-0.5 font-semibold">
                    (भेजने से पहले ऐप इसे 70 KB से छोटा कर देगा)
                  </span>
                </div>
              ) : (
                <div className="bg-stone-50 p-2.5 rounded-2xl border border-stone-200 space-y-2 animate-fade-in">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-stone-700 flex items-center gap-1.5 truncate max-w-[200px]">
                      <ImageIcon className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      {screenshotFileName || "Screenshots.jpg"}
                    </span>
                    <button
                      type="button"
                      onClick={() => { setScreenshotBase64(null); setScreenshotFileName(''); }}
                      className="text-[11px] font-bold text-red-600 hover:text-red-500 underline cursor-pointer"
                    >
                      हटाएँ / बदलें
                    </button>
                  </div>

                  <div className="max-h-28 overflow-hidden rounded-lg border border-stone-200 bg-white flex items-center justify-center p-1">
                    <img 
                      src={screenshotBase64} 
                      alt="Payment Preview" 
                      className="max-h-24 w-auto object-contain rounded"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Step 3: Reference input & Identity registration if logged out */}
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-black text-stone-700 mb-1">
                  UPI Ref / UTR नंबर (12 अंक - वैकल्पिक):
                </label>
                <input
                  type="text"
                  maxLength={12}
                  value={utrNumber}
                  onChange={(e) => setUtrNumber(e.target.value.replace(/\D/g, ''))}
                  placeholder="उदा. 423872891902"
                  className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2.5 text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-red-600 font-bold"
                  style={{ minHeight: '44px' }}
                />
              </div>

              {!user?.email && (
                <div className="p-3 bg-red-50 border border-red-100 rounded-2xl space-y-3">
                  <span className="text-[11px] font-black text-red-800 block">
                    ⚠️ आप लॉग-इन नहीं हैं! कोर्स एक्टिवेशन के लिए जीमेल लिखें:
                  </span>
                  
                  <div>
                    <label className="block text-[10px] font-black text-stone-600 mb-1">
                      आपकी जीमेल आईडी (Gmail ID): *
                    </label>
                    <input
                      type="email"
                      required
                      value={studentEmailInput}
                      onChange={(e) => setStudentEmailInput(e.target.value)}
                      placeholder="उदा. yourname@gmail.com"
                      className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-red-600"
                      style={{ minHeight: '44px' }}
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-stone-600 mb-1">
                      आपका नाम (Name):
                    </label>
                    <input
                      type="text"
                      value={studentNameInput}
                      onChange={(e) => setStudentNameInput(e.target.value)}
                      placeholder="उदा. राहुल कुमार"
                      className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-red-600"
                      style={{ minHeight: '44px' }}
                    />
                  </div>
                </div>
              )}
            </div>

            {errorMessage && (
              <div className="p-2.5 rounded-xl bg-red-50 border border-red-100 text-red-600 text-[11px] flex items-center gap-1.5 font-bold">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting || !screenshotBase64}
              className="w-full bg-gradient-to-r from-red-700 to-red-600 hover:from-red-600 hover:to-red-500 disabled:opacity-50 text-white font-black py-3 px-4 rounded-xl flex items-center justify-center gap-2 text-sm transition-all shadow-md cursor-pointer shrink-0 mt-2"
              style={{ minHeight: '44px' }}
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>पेमेंट सहेजा जा रहा है...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>पेमेंट स्क्रीनशॉट सबमिट करें</span>
                </>
              )}
            </button>
          </form>

          {/* Secure SSL Badge */}
          <div className="p-2 rounded-xl bg-stone-50 border border-stone-200 text-stone-500 text-[9px] font-bold flex items-center justify-center gap-1.5 shrink-0">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>100% सुरक्षित और सत्यापित सीधे Rajkumar Sir द्वारा सत्यापन</span>
          </div>
          
        </div>
      </div>
    </div>
  );
}
