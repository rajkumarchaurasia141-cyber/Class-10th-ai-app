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
  Smartphone,
  MessageCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import { doc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore';

export function PaywallModal({ 
  onClose, 
  courseType = 'full_course' 
}: { 
  onClose: () => void; 
  courseType?: 'full_course' | 'crash_course';
}) {
  const { user, fbUser, login } = useAuth();
  
  const defaultPrice = courseType === 'crash_course' ? 299 : 499;

  // Dynamic UPI and Price Config with standard default values
  const [config, setConfig] = useState({
    upiId: "9241511070@ybl",
    whatsappNumber: "9241511070",
    price: defaultPrice,
    qrCodeUrl: ""
  });

  const activePrice = courseType === 'crash_course' 
    ? 299 
    : (config.price && config.price !== 299 ? config.price : 499);

  const upiPayLink = `upi://pay?pa=${encodeURIComponent(config.upiId)}&pn=${encodeURIComponent(courseType === 'crash_course' ? 'BiharBoardCrashCourse' : 'BiharBoardTopperBatch')}&am=${activePrice}&cu=INR&tn=${encodeURIComponent(courseType === 'crash_course' ? 'BSEB 10th Crash Course' : 'BSEB 10th Topper Batch')}`;

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
        const rawWa = data.whatsappNumber;
        const finalWa = (rawWa === '9507464117' || !rawWa) ? '9241511070' : rawWa;
        const rawPrice = Number(data.price);
        const finalPrice = (rawPrice === 600 || !rawPrice) ? 299 : rawPrice;
        if (rawPrice === 600 || data.price1Year === 600 || !data.price) {
          try {
            setDoc(docRef, { price: 299, price1Year: 299, whatsappNumber: finalWa }, { merge: true }).catch(() => {});
          } catch {}
        }
        setConfig({
          upiId: data.upiId || "9241511070@ybl",
          whatsappNumber: finalWa,
          price: courseType === 'crash_course' ? 299 : (finalPrice === 299 ? 499 : finalPrice),
          qrCodeUrl: data.qrCodeUrl || ""
        });
      } else {
        try {
          setDoc(docRef, { price: defaultPrice, price1Year: 499, upiId: "9241511070@ybl", whatsappNumber: "9241511070" }, { merge: true }).catch(() => {});
        } catch {}
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
        courseName: courseType === 'crash_course' ? "न्यू क्रैश कोर्स (Class 10th)" : "Topper Batch (फुल कोर्स)",
        courseType: courseType,
        amount: activePrice,
        upiRef: utrNumber.trim() || "N/A",
        screenshotBase64: screenshotBase64,
        status: "pending",
        createdAt: serverTimestamp()
      };

      // Add to "payment_requests" collection
      const requestDocRef = doc(db, 'payment_requests', requestId);
      await setDoc(requestDocRef, payload);

      // If crash course, also write to crash_course_requests
      if (courseType === 'crash_course') {
        try {
          await setDoc(doc(db, 'crash_course_requests', requestId), {
            id: requestId,
            userId: uid,
            studentName: finalStudentName,
            studentEmail: emailForPayload,
            courseName: "न्यू क्रैश कोर्स (Class 10th)",
            amount: activePrice,
            screenshotDataUrl: screenshotBase64,
            utr: utrNumber.trim() || 'N/A',
            status: 'pending',
            submittedAt: new Date().toISOString()
          }, { merge: true });
        } catch (e) {
          console.warn("Crash course requests doc save notice:", e);
        }
      }

      // Trigger email notification
      try {
        await fetch('/api/send-payment-notification', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            studentName: finalStudentName,
            studentEmail: emailForPayload,
            amount: activePrice,
            screenshotUrl: screenshotBase64,
            requestId: requestId
          })
        });
      } catch (emailErr) {
        console.error("Failed to trigger email notification:", emailErr);
      }

      setSubmitSuccess(true);
      alert("आपका पेमेंट रिक्वेस्ट एडमिन के पास चला गया है। एडमिन द्वारा एक्सेप्ट करते ही आपका कोर्स अनलॉक हो जाएगा। अगर 5 मिनट के अंदर नहीं खुलता है तो WhatsApp (9241511070) पर मैसेज करें।");
      onClose();
    } catch (err: any) {
      console.error("Payment submission failed:", err);
      const isQuota = err?.code === 'resource-exhausted' || err?.message?.includes('Quota') || err?.message?.includes('resource-exhausted');
      if (isQuota) {
        setErrorMessage(`⚠️ सर्वर दैनिक लिमिट समाप्त (Daily Quota Reached): हमारे डेटाबेस की आज की अपलोड सीमा समाप्त हो गई है। आप चिंता न करें - कृपया सीधे एडमिन के व्हाट्सएप (${config.whatsappNumber}) पर पेमेंट स्क्रीनशॉट भेजकर अपना कोर्स तुरंत अनलॉक करवा लें!`);
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
              <h3 className="text-sm font-black text-stone-900 tracking-tight uppercase">
                {courseType === 'crash_course' ? 'बिहार बोर्ड 10वीं न्यू क्रैश कोर्स' : 'बिहार बोर्ड 10वीं टॉपर बैच (फुल कोर्स)'}
              </h3>
              <p className="text-[10px] text-stone-500 font-bold">
                {courseType === 'crash_course' ? '10th Fast-Track Crash Course (₹299)' : 'Full Syllabus Topper Batch (₹499)'}
              </p>
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
              {courseType === 'crash_course' ? `न्यू क्रैश कोर्स अनलॉक करें - मात्र ₹${activePrice}` : `टॉपर बैच (फुल कोर्स) अनलॉक करें - मात्र ₹${activePrice}`}
            </h2>
            <p className="text-[11px] text-stone-600 mt-1 font-semibold leading-relaxed">
              {courseType === 'crash_course' 
                ? 'सभी 6 विषयों के 151+ अध्यायों के 30 VVI MCQ टेस्ट, तुरंत व्याख्या व स्पेशल बूस्टर्स अनलॉक करें।' 
                : 'कक्षा 10वीं सम्पूर्ण सिलेबस — सभी 6 विषयों के हस्तलिखित नोट्स, VVI टॉपर टिप्स और टेस्ट अनलॉक करें।'}
            </p>
            <div className="absolute top-1 right-2 animate-bounce">
              <Sparkles className="w-4 h-4 text-amber-500" />
            </div>
          </div>

          {/* QR Code and Scanner Section */}
          <div className="bg-stone-50 border border-stone-200 rounded-2xl p-3 text-center space-y-3">
            {config.qrCodeUrl ? (
              <>
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
              </>
            ) : (
              <div className="py-2 space-y-1">
                <QrCode className="w-6 h-6 text-stone-400 mx-auto" />
                <span className="text-[11px] font-bold text-stone-500 block">QR कोड फ़िलहाल उपलब्ध नहीं है</span>
                <p className="text-[9px] text-stone-400">नीचे दिए गए बटन या UPI ID का उपयोग करें।</p>
              </div>
            )}
            
            {/* Direct Pay Button for Mobile Users */}
            <div className="px-4">
              <a 
                href={upiPayLink}
                className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-xl font-black text-xs transition-all shadow-md active:scale-95"
              >
                <Smartphone className="w-4 h-4" />
                <span>🚀 सीधे पेमेंट करें (Direct Pay)</span>
              </a>
              <p className="text-[9px] text-stone-400 mt-1.5 font-bold">GPay, PhonePe, Paytm, या अन्य किसी भी UPI ऐप से भुगतान करें</p>
            </div>
          </div>

          {/* Payment Steps Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* STEP 1: Copy UPI ID */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-black text-stone-700 flex items-center gap-1">
                <span className="w-4 h-4 rounded-full bg-red-600 text-white flex items-center justify-center text-[9px] font-black">1</span>
                QR कोड स्कैन करके या UPI ID पर ₹{activePrice} भेजें:
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

            {/* STEP 2: Screenshot uploader & Direct WhatsApp Sending */}
            <div className="space-y-2.5">
              <label className="text-[11px] font-black text-stone-700 flex items-center gap-1">
                <span className="w-4 h-4 rounded-full bg-red-600 text-white flex items-center justify-center text-[9px] font-black">2</span>
                पेमेंट का स्क्रीनशॉट यहाँ अपलोड करें या सीधे WhatsApp पर भेजें:
              </label>

              {/* Direct WhatsApp Clickable Link (Right at screenshot upload) */}
              <div className="bg-gradient-to-r from-emerald-600 to-green-600 rounded-2xl p-3 text-white shadow-md border border-emerald-400">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                    <span className="text-[11px] font-black uppercase tracking-wider text-emerald-100">
                      ⚡ डायरेक्ट व्हाट्सएप लिंक
                    </span>
                  </div>
                  <span className="bg-white/20 backdrop-blur-xs text-white font-mono text-[10px] font-black px-2 py-0.5 rounded-full border border-white/30">
                    {config.whatsappNumber || '9241511070'}
                  </span>
                </div>

                <a
                  href={`https://wa.me/91${config.whatsappNumber || '9241511070'}?text=${encodeURIComponent(`नमस्ते राज सर, मैंने ₹${activePrice} का ${courseType === 'crash_course' ? 'न्यू क्रैश कोर्स (₹299)' : 'फुल कोर्स - टॉपर बैच (₹499)'} पेमेंट कर दिया है। यह रहा मेरा पेमेंट स्क्रीनशॉट। कृपया मेरा कोर्स तुरंत अनलॉक कर दीजिए। (Gmail: ${studentEmailInput || user?.email || ''})`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-white hover:bg-emerald-50 active:scale-95 text-emerald-800 font-black py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 text-xs shadow-sm transition-all cursor-pointer border border-emerald-200"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-600 fill-emerald-600 shrink-0" />
                  <span>यहाँ क्लिक करें ➜ सीधे मेरे WhatsApp पर भेजें ({config.whatsappNumber || '9241511070'})</span>
                </a>
                
                <p className="text-[10px] text-emerald-100 text-center font-bold mt-1.5 leading-tight">
                  (यहाँ क्लिक करते ही सीधे राज सर का WhatsApp खुल जाएगा और स्क्रीनशॉट भेजकर तुरंत एक्टिवेट करवा सकते हैं)
                </p>
              </div>

              {/* In-app file picker */}
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
                  className="border-2 border-dashed border-stone-300 hover:border-red-600 hover:bg-stone-50 rounded-2xl p-3.5 text-center cursor-pointer transition-all"
                >
                  <Upload className="w-5 h-5 text-stone-400 mx-auto mb-1" />
                  <span className="text-xs font-black text-stone-800 block">
                    या ऐप में स्क्रीनशॉट फोटो चुनें (JPEG/PNG)
                  </span>
                  <span className="text-[10px] text-stone-500 block mt-0.5 font-semibold">
                    (फोटो चुनकर नीचे 'सबमिट करें' बटन दबाएं)
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

            {/* Direct WhatsApp Option */}
            <a
              href={`https://wa.me/91${config.whatsappNumber}?text=${encodeURIComponent(`नमस्ते सर, मैंने ₹${activePrice} का क्रैश कोर्स पेमेंट किया है। कृपया मेरा कोर्स अनलॉक करें। मेरी जीमेल: ${studentEmailInput || user?.email || ''}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold py-2 px-4 rounded-xl flex items-center justify-center gap-2 text-xs transition-all cursor-pointer text-center"
            >
              <Smartphone className="w-4 h-4 text-emerald-600" />
              <span>व्हाट्सएप ({config.whatsappNumber}) पर भी स्क्रीनशॉट भेज सकते हैं</span>
            </a>
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
