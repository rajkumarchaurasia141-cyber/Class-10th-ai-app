import React, { useState, useRef } from 'react';
import { 
  Crown, 
  CheckCircle2, 
  Sparkles, 
  X, 
  ShieldCheck, 
  ArrowRight, 
  Copy, 
  Check, 
  QrCode, 
  MessageCircle, 
  Upload, 
  Image as ImageIcon, 
  Loader2, 
  AlertCircle,
  ExternalLink,
  Hourglass,
  Clock,
  Mail
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { db, storage } from '../lib/firebase';
import { doc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';
import { safeSetDoc, isQuotaError } from '../utils/firestoreSafe';

export function PaywallModal({ onClose }: { onClose: () => void }) {
  const { user, fbUser, isVIP, vipDetails, login } = useAuth();
  const { appConfig } = useData();
  const [selectedPlan, setSelectedPlan] = useState<'1month' | '1year'>('1year');
  const [showPaymentInfo, setShowPaymentInfo] = useState(false);
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [studentEmailInput, setStudentEmailInput] = useState(user?.email || '');
  const [studentNameInput, setStudentNameInput] = useState(user?.name || '');

  // In-App Screenshot Upload State
  const [screenshotData, setScreenshotData] = useState<string | null>(null);
  const [screenshotFileName, setScreenshotFileName] = useState<string>('');
  const [utrNumber, setUtrNumber] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [firestoreFailed, setFirestoreFailed] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const UPI_ID = appConfig.upiId;
  const WHATSAPP_RAW = '91' + appConfig.helplineNumber;
  const WHATSAPP_DISPLAY = appConfig.helplineNumber;

  const priceMonth = appConfig.price1Month;
  const priceYear = appConfig.price1Year;

  const planAmount = selectedPlan === '1month' ? `₹${priceMonth}` : `₹${priceYear}`;
  const planTitle = selectedPlan === '1month' ? `1 माह प्लान (₹${priceMonth})` : `1 वर्ष प्लान (₹${priceYear})`;

  const handleCopy = async (text: string, type: 'upi' | 'phone') => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        if (type === 'upi') {
          setCopiedUpi(true);
          setTimeout(() => setCopiedUpi(false), 2500);
        } else {
          setCopiedPhone(true);
          setTimeout(() => setCopiedPhone(false), 2500);
        }
        return;
      }
    } catch {
      // fallback
    }

    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      if (type === 'upi') {
        setCopiedUpi(true);
        setTimeout(() => setCopiedUpi(false), 2500);
      } else {
        setCopiedPhone(true);
        setTimeout(() => setCopiedPhone(false), 2500);
      }
    } catch (err: any) {
      console.warn('Copy notice:', err?.message || String(err));
    }
  };

  // Image Compressor & Reader
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('कृपया केवल फोटो (JPG, PNG) फाइल चुनें।');
      return;
    }

    setUploadError(null);
    setScreenshotFileName(file.name);

    const reader = new FileReader();
    reader.onerror = () => {
      setUploadError('फोटो पढ़ने में समस्या आई। कृपया दूसरी फोटो चुनें।');
    };
    reader.onload = (event) => {
      const img = new Image();
      img.onerror = () => {
        setUploadError('फोटो लोड नहीं हो सकी। कृपया दोबारा चुनें।');
      };
      img.onload = () => {
        // Compress image using canvas
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height = Math.round(height * (MAX_WIDTH / width));
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width = Math.round(width * (MAX_HEIGHT / height));
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          // Compress to JPEG 0.65 for clear receipt and fast upload (~40-60KB)
          const dataUrl = canvas.toDataURL('image/jpeg', 0.65);
          setScreenshotData(dataUrl);
        } else {
          setScreenshotData(event.target?.result as string);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Submit Screenshot to Firestore & Local Storage
  const handleSubmitScreenshot = async () => {
    if (!screenshotData) {
      setUploadError('कृपया पहले पेमेंट स्क्रीनशॉट का फोटो चुनें।');
      return;
    }

    const cleanEmail = (user?.email || studentEmailInput).trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setUploadError('कृपया अपना वैध जीमेल (Gmail) दर्ज करें जिस पर VIP एक्टिवेट किया जाएगा।');
      return;
    }

    const finalStudentName = (user?.name || studentNameInput).trim() || 'विद्यार्थी';

    // Auto-save user identity if not previously set
    if (!user?.email) {
      try {
        login(finalStudentName, cleanEmail);
      } catch (e) {
        console.warn('Auto login note:', e);
      }
    }

    setUploading(true);
    setUploadError(null);
    setFirestoreFailed(false);

    const timestamp = Date.now();
    const requestId = `${cleanEmail.replace(/[^a-zA-Z0-9]/g, '_')}_${timestamp}`;
    const userId = fbUser?.uid || cleanEmail.replace(/[^a-zA-Z0-9]/g, '_');

    try {
      // 1. Upload screenshot to Firebase Storage with a 4-second timeout race to prevent infinite spinning
      const storagePath = `payments/${userId}/screenshot_${timestamp}.jpg`;
      const storageRef = ref(storage, storagePath);
      
      let downloadURL = '';
      console.log('Uploading screenshot to storage path:', storagePath);
      
      try {
        const uploadPromise = async () => {
          await uploadString(storageRef, screenshotData, 'data_url');
          return await getDownloadURL(storageRef);
        };
        
        const timeoutPromise = new Promise<null>((resolve) => {
          setTimeout(() => resolve(null), 4000);
        });
        
        const uploadedUrl = await Promise.race([uploadPromise(), timeoutPromise]);
        if (uploadedUrl) {
          downloadURL = uploadedUrl;
          console.log('Screenshot upload successful! Download URL:', downloadURL);
        } else {
          console.warn('Firebase Storage upload timed out. Falling back to secure direct Firestore storage.');
          downloadURL = screenshotData; // Use compressed base64 directly as fallback
        }
      } catch (storageErr) {
        console.warn('Firebase Storage upload failed. Falling back to direct Firestore storage:', storageErr);
        downloadURL = screenshotData; // Use compressed base64 directly as fallback
      }

      // 2. Prepare payload with required schema
      const paymentPayload = {
        userId,
        userName: finalStudentName,
        userEmail: cleanEmail,
        screenshotUrl: downloadURL,
        courseId: 'bseb_10th_vip',
        status: 'pending' as const,
        createdAt: serverTimestamp(),
        // backwards-compatible properties for UI and local storage fallbacks
        id: requestId,
        studentName: finalStudentName,
        studentEmail: cleanEmail,
        plan: selectedPlan,
        planTitle,
        planAmount,
        planPrice: selectedPlan === '1month' ? 99 : 600,
        screenshotDataUrl: downloadURL, // replace local base64 with remote URL or local fallback
        utr: utrNumber.trim(),
        submittedAt: new Date().toISOString()
      };

      // 3. Save to LocalStorage so payment request is never lost
      try {
        const stored = JSON.parse(localStorage.getItem('bseb_payment_requests') || '[]');
        const filtered = stored.filter((r: any) => r.id !== requestId);
        localStorage.setItem('bseb_payment_requests', JSON.stringify([paymentPayload, ...filtered]));
      } catch (e) {
        console.warn('Local payment storage note:', e);
      }

      // 4. Save to firestore collections 'payments' and 'payment_requests'
      const dbSuccessPayments = await safeSetDoc(doc(db, 'payments', requestId), paymentPayload, undefined, 5000);
      const dbSuccessRequests = await safeSetDoc(doc(db, 'payment_requests', requestId), paymentPayload, undefined, 5000);

      if (!dbSuccessPayments && !dbSuccessRequests) {
        setFirestoreFailed(true);
      }
    } catch (err: any) {
      console.error('Firebase screenshot upload or Firestore save failed:', err);
      setUploadError('स्क्रीनशॉट अपलोड करने में त्रुटि हुई: ' + (err?.message || String(err)));
      setFirestoreFailed(true);
    } finally {
      setUploading(false);
      setUploadSuccess(true);
    }
  };

  // Pre-filled WhatsApp message as requested by the user
  const studentName = user?.name?.trim() || 'छात्र';
  const studentEmail = user?.email?.trim() || '';

  const rawWhatsAppMessage = 
`सर, मैंने BSEB 10th VIP टॉपर बैच ले लिया है।
कृपया मेरा VIP बैच अनलॉक कर दीजिए।

📌 मेरा विवरण:
• छात्र का नाम: ${studentName}
• मेरा जीमेल: ${studentEmail}
• चुना गया प्लान: ${planTitle}
• भुगतान राशि: ${planAmount}

(मैंने पेमेंट का स्क्रीनशॉट इस मैसेज के साथ अटैच कर दिया है)`;

  const whatsappUrl = `https://wa.me/${WHATSAPP_RAW}?text=${encodeURIComponent(rawWhatsAppMessage)}`;

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-2.5 sm:p-4 z-50 animate-fade-in overflow-y-auto">
      <div className="bg-stone-900 border border-amber-500/30 rounded-2xl sm:rounded-3xl max-w-lg w-full p-4 sm:p-7 md:p-8 shadow-2xl relative overflow-hidden my-auto max-h-[94vh] flex flex-col">
        {/* Background glow */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-52 h-52 bg-amber-500/15 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-52 h-52 bg-amber-600/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-stone-400 hover:text-white bg-stone-800/80 hover:bg-stone-700 p-2 rounded-full transition-colors cursor-pointer z-20"
          title="बंद करें"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="overflow-y-auto pr-1 flex-1 scrollbar-none">
          {/* Header Badge & Title */}
          <div className="text-center relative z-10 mb-5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider mb-2.5">
              <Crown className="w-3.5 h-3.5 text-amber-400" />
              BSEB 10th VIP टॉपर बैच
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-white">
              VIP मेंबरशिप प्लान
            </h2>
            <p className="text-stone-400 text-xs md:text-sm mt-1 max-w-sm mx-auto">
              कक्षा 10 बिहार बोर्ड के सभी विषयों के सम्पूर्ण नोट्स, VVI टॉपर टिप्स और 50+ MCQs अनलॉक करें।
            </p>
          </div>

          {/* Status Banners */}
          {vipDetails?.isExpired && (
            <div className="bg-amber-950/40 border border-amber-500/50 rounded-2xl p-3.5 mb-4 text-left flex items-start gap-2.5 relative z-10">
              <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-bold text-amber-300">आपका पिछला VIP प्लान समाप्त हो चुका है!</div>
                <div className="text-[11px] text-stone-300 mt-0.5">
                  अपनी पढ़ाई निरंतर जारी रखने के लिए 1 माह (₹99) या 1 वर्ष (₹600) प्लान चुनकर पुनः पेमेंट स्क्रीनशॉट अपलोड करें। एडमिन सत्यापन के बाद तुरंत एक्टिवेट हो जाएगा।
                </div>
              </div>
            </div>
          )}

          {isVIP && (
            <div className="bg-emerald-950/40 border border-emerald-500/40 rounded-2xl p-3 mb-4 text-left flex items-start gap-2.5 relative z-10">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-bold text-emerald-300">आपका VIP प्लान वर्तमान में सक्रिय है!</div>
                <div className="text-[11px] text-stone-300 mt-0.5">
                  वैधता: <strong>{vipDetails?.formattedExpiry} तक</strong> ({vipDetails?.daysRemaining} दिन शेष)। आप आगे के लिए अपनी वैधता अभी से बढ़ा भी सकते हैं।
                </div>
              </div>
            </div>
          )}

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5 relative z-10">
            {/* 1 Month Plan */}
            <div 
              onClick={() => { setSelectedPlan('1month'); }}
              className={`p-4 rounded-2xl border cursor-pointer transition-all relative ${
                selectedPlan === '1month'
                  ? 'bg-amber-950/40 border-amber-500 shadow-lg shadow-amber-950/50 scale-[1.02]'
                  : 'bg-stone-950/70 border-stone-800 hover:border-stone-700 text-stone-300'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-bold text-stone-400 uppercase tracking-wide">1 माह प्लान</span>
                {selectedPlan === '1month' && (
                  <CheckCircle2 className="w-4 h-4 text-amber-400" />
                )}
              </div>
              <div className="flex items-baseline gap-1 mb-1.5">
                <span className="text-3xl font-black text-white">₹{priceMonth}</span>
                <span className="text-xs text-stone-400">/ 1 महीना</span>
              </div>
              <div className="flex items-center gap-1 text-[11px] text-stone-300 font-medium mt-1">
                <Hourglass className="w-3 h-3 text-amber-400" />
                <span>30 दिन की वैधता</span>
              </div>
              <p className="text-[11px] text-stone-400 mt-1 leading-snug">
                30 दिन बाद स्वतः समाप्त हो जाएगा। पुनः पेमेंट करने पर फिर खुल जाएगा।
              </p>
            </div>

            {/* 1 Year Plan (Best Value) */}
            <div 
              onClick={() => { setSelectedPlan('1year'); }}
              className={`p-4 rounded-2xl border cursor-pointer transition-all relative ${
                selectedPlan === '1year'
                  ? 'bg-amber-950/50 border-amber-500 shadow-lg shadow-amber-950/50 scale-[1.02]'
                  : 'bg-stone-950/70 border-stone-800 hover:border-stone-700 text-stone-300'
              }`}
            >
              <div className="absolute -top-2.5 right-3 bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider shadow">
                बेस्ट वैल्यू (Best)
              </div>
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wide">1 वर्ष प्लान</span>
                {selectedPlan === '1year' && (
                  <CheckCircle2 className="w-4 h-4 text-amber-400" />
                )}
              </div>
              <div className="flex items-baseline gap-1 mb-1.5">
                <span className="text-3xl font-black text-white">₹{priceYear}</span>
                <span className="text-xs text-stone-400">/ 1 पूरा वर्ष</span>
              </div>
              <div className="flex items-center gap-1 text-[11px] text-amber-300 font-medium mt-1">
                <Hourglass className="w-3 h-3 text-amber-400" />
                <span>365 दिन (पूरे 1 वर्ष) की वैधता</span>
              </div>
              <p className="text-[11px] text-amber-200/80 mt-1 leading-snug">
                मात्र ₹50/माह — 1 वर्ष बाद ही हटेगा। पूरी बोर्ड परीक्षा तक बेफिक्र तैयारी।
              </p>
            </div>
          </div>

          {/* Benefits List */}
          {!showPaymentInfo && (
            <div className="bg-stone-950/80 border border-stone-800/90 rounded-2xl p-4 mb-5 relative z-10 space-y-2">
              <div className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                VIP में क्या-क्या मिलेगा:
              </div>
              <div className="flex items-center gap-2 text-xs text-stone-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>सभी विषयों के <strong>चैप्टर 2 और आगे के सभी अध्यायों</strong> का फुल एक्सेस</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-stone-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>हर चैप्टर के <strong>50+ VVI वस्तुनिष्ठ (MCQ)</strong> एवं तुरंत स्कोर कार्ड</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-stone-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span><strong>VVI टॉपर परीक्षा टिप्स</strong> एवं NCERT लघु व दीर्घ उत्तरीय उत्तर</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-stone-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>संस्कृत, विज्ञान, हिन्दी, गणित और सामाजिक विज्ञान के विशेष नोट्स</span>
              </div>
            </div>
          )}

          {/* Action Button & Payment Section */}
          <div className="space-y-4 relative z-10">
            {!showPaymentInfo ? (
              <button 
                onClick={() => setShowPaymentInfo(true)}
                className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-black py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-900/30 cursor-pointer text-sm"
              >
                <span>
                  {selectedPlan === '1month' ? '₹99 (1 माह)' : '₹600 (1 वर्ष)'} प्लान अभी खरीदें
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <div className="bg-stone-950/95 border border-amber-500/40 rounded-2xl p-4 sm:p-5 text-left space-y-4 animate-fade-in shadow-xl">
                {/* Header Info */}
                <div className="flex items-center justify-between border-b border-stone-800 pb-3">
                  <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
                    <QrCode className="w-4 h-4 text-amber-400" />
                    पेमेंट एवं एक्टिवेशन विवरण
                  </div>
                  <span className="text-sm sm:text-base font-black text-amber-400 bg-amber-500/15 px-2.5 py-0.5 rounded-lg border border-amber-500/30">
                    राशि: {planAmount}
                  </span>
                </div>

                {/* STEP 1: UPI ID */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-stone-200 flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-amber-500 text-stone-950 flex items-center justify-center font-black text-[11px]">1</span>
                      इस UPI ID पर {planAmount} भेजें:
                    </span>
                    <span className="text-[11px] text-stone-400">GPay, PhonePe, Paytm</span>
                  </div>

                  <div className="bg-stone-900 border-2 border-amber-500/60 rounded-xl p-2.5 sm:p-3 flex items-center justify-between gap-2 shadow-inner">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
                      <span className="font-mono text-sm sm:text-base font-black text-amber-300 select-all truncate">
                        {UPI_ID}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleCopy(UPI_ID, 'upi')}
                      className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                        copiedUpi
                          ? 'bg-emerald-500 text-white shadow-md shadow-emerald-900/40'
                          : 'bg-amber-500 hover:bg-amber-400 text-stone-950 shadow-md'
                      }`}
                    >
                      {copiedUpi ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>कॉपी हो गया!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>कॉपी करें</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* QR Code Scanner Display if uploaded by Admin */}
                {appConfig.qrCodeDataUrl && (
                  <div className="bg-stone-900 border border-amber-500/40 rounded-2xl p-4 text-center space-y-2">
                    <div className="text-xs font-bold text-amber-400 flex items-center justify-center gap-1.5">
                      <QrCode className="w-4 h-4" /> QR स्कैनर से स्कैन करके पेमेंट करें:
                    </div>
                    <div className="w-44 h-44 mx-auto bg-white p-2 rounded-xl border border-amber-500/30 shadow-md">
                      <img src={appConfig.qrCodeDataUrl} alt="UPI QR Scanner" className="w-full h-full object-contain" />
                    </div>
                    <p className="text-[11px] text-stone-400">किसी भी UPI ऐप (GPay, PhonePe, Paytm) से स्कैन करें</p>
                  </div>
                )}

                {/* STEP 2: IN-APP SCREENSHOT UPLOAD */}
                <div className="bg-stone-900/90 border border-amber-500/40 rounded-2xl p-3.5 sm:p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400 uppercase tracking-wide">
                      <span className="w-5 h-5 rounded-full bg-amber-500 text-stone-950 flex items-center justify-center font-black text-[11px]">2</span>
                      ऐप में ही पेमेंट फोटो (स्क्रीनशॉट) अपलोड करें:
                    </div>
                  </div>

                  {uploadSuccess ? (
                    <div className={`p-4 rounded-xl border space-y-3 animate-fade-in ${
                      firestoreFailed 
                        ? 'bg-amber-500/10 border-amber-500/30 text-amber-300' 
                        : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                    }`}>
                      <div className="flex items-center gap-2 font-bold text-sm">
                        {firestoreFailed ? (
                          <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
                        ) : (
                          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                        )}
                        <span>
                          {firestoreFailed 
                            ? '⚠️ सर्वर ओवरलोड: व्हाट्सएप पर भेजें!' 
                            : 'स्क्रीनशॉट सफलतापूर्वक सबमिट हो गया!'}
                        </span>
                      </div>
                      
                      {firestoreFailed ? (
                        <p className="text-xs text-stone-200 leading-relaxed">
                          प्रिय <strong className="text-white">{user?.name || studentNameInput || 'विद्यार्थी'}</strong>, आज की दैनिक सर्वर लिमिट पूरी होने के कारण ऐप में ऑटो-सबमिट नहीं हो पाया। 
                          <strong className="text-amber-300"> चिंता न करें!</strong> आपका बैच एक्टिव करने के लिए कृपया नीचे दिए गए <strong className="text-white">"WhatsApp पर स्क्रीनशॉट भेजें"</strong> बटन पर क्लिक करके Rajkumar Sir को तुरंत स्क्रीनशॉट व्हाट्सएप पर भेज दें।
                        </p>
                      ) : (
                        <p className="text-xs text-stone-200 leading-relaxed">
                          धन्यवाद <strong className="text-white">{user?.name || studentNameInput || 'विद्यार्थी'}</strong>! आपका पेमेंट स्क्रीनशॉट सुरक्षित सहेज लिया गया है। 
                          एडमिन (Rajkumar Sir) द्वारा वैरिफाई होते ही आपका <strong className="text-amber-300">{planTitle}</strong> तुरंत एक्टिवेट कर दिया जाएगा।
                        </p>
                      )}

                      <div className="text-[11px] text-stone-300 pt-1 border-t border-stone-800/80 flex flex-wrap items-center justify-between gap-1.5">
                        <span>पंजीकृत ईमेल: <span className="font-mono text-white font-bold">{user?.email || studentEmailInput}</span></span>
                        <span className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                          firestoreFailed 
                            ? 'text-amber-400 bg-amber-500/20' 
                            : 'text-emerald-400 bg-emerald-500/20'
                        }`}>
                          {firestoreFailed ? 'व्हाट्सएप अनिवार्य' : 'विचाराधीन (Pending)'}
                        </span>
                      </div>

                      {/* Instant WhatsApp Verification Button */}
                      <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`w-full text-white font-bold py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 text-xs transition-all shadow-md cursor-pointer text-center ${
                          firestoreFailed 
                            ? 'bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 animate-pulse ring-2 ring-emerald-500/50' 
                            : 'bg-emerald-600 hover:bg-emerald-500'
                        }`}
                      >
                        <MessageCircle className="w-4 h-4 text-white fill-white/20" />
                        <span>{firestoreFailed ? '👉 व्हाट्सएप पर स्क्रीनशॉट भेजें (अनिवार्य) 👈' : 'WhatsApp पर भी भेजें (5 मिनट में फास्ट एक्टिवेशन)'}</span>
                      </a>

                      <div className="text-center pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            setUploadSuccess(false);
                            setScreenshotData(null);
                            setScreenshotFileName('');
                          }}
                          className="text-[11px] text-stone-400 hover:text-stone-200 underline cursor-pointer"
                        >
                          नया फोटो बदलें या दोबारा अपलोड करें
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <input 
                        type="file" 
                        ref={fileInputRef}
                        accept="image/*" 
                        onChange={handleFileSelect} 
                        className="hidden" 
                      />

                      {/* Upload Box / Image Preview */}
                      {!screenshotData ? (
                        <div 
                          onClick={() => fileInputRef.current?.click()}
                          className="border-2 border-dashed border-stone-700 hover:border-amber-500/70 bg-stone-950/60 rounded-xl p-5 text-center cursor-pointer transition-all group"
                        >
                          <div className="w-10 h-10 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                            <Upload className="w-5 h-5" />
                          </div>
                          <span className="text-xs font-bold text-white block">
                            स्क्रीनशॉट फोटो चुनें या यहाँ ड्रॉप करें
                          </span>
                          <span className="text-[11px] text-stone-400 block mt-0.5">
                            (PhonePe / Google Pay / Paytm का पेमेंट स्क्रीनशॉट)
                          </span>
                        </div>
                      ) : (
                        <div className="bg-stone-950 p-3 rounded-xl border border-stone-800 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-stone-300 flex items-center gap-1.5 font-medium truncate max-w-[200px]">
                              <ImageIcon className="w-4 h-4 text-amber-400 shrink-0" />
                              {screenshotFileName || 'पेमेंट स्क्रीनशॉट'}
                            </span>
                            <button
                              type="button"
                              onClick={() => { setScreenshotData(null); setScreenshotFileName(''); }}
                              className="text-xs text-rose-400 hover:text-rose-300 cursor-pointer"
                            >
                              हटाएँ / बदलें
                            </button>
                          </div>

                          {/* Image Preview */}
                          <div className="max-h-48 overflow-hidden rounded-lg border border-stone-800 bg-black/50 flex items-center justify-center">
                            <img 
                              src={screenshotData} 
                              alt="Payment Screenshot Preview" 
                              className="max-h-48 w-auto object-contain rounded"
                            />
                          </div>
                        </div>
                      )}

                      {/* Optional UTR / Reference number */}
                      <div>
                        <label className="block text-[11px] font-medium text-stone-400 mb-1">
                          UPI Ref / UTR / ट्रांजैक्शन नंबर (वैकल्पिक):
                        </label>
                        <input
                          type="text"
                          value={utrNumber}
                          onChange={(e) => setUtrNumber(e.target.value)}
                          placeholder="उदा. 423872891902"
                          className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-2 text-xs text-white placeholder-stone-600 focus:outline-none focus:border-amber-500"
                        />
                      </div>

                      {/* If user is not logged in, ask for their Gmail so VIP can be assigned */}
                      {!user?.email && (
                        <div className="space-y-2 pt-1 border-t border-stone-800">
                          <div>
                            <label className="block text-[11px] font-bold text-amber-400 mb-1 flex items-center gap-1">
                              <Mail className="w-3.5 h-3.5" />
                              <span>आपकी जीमेल आईडी (VIP एक्टिवेशन हेतु): *</span>
                            </label>
                            <input
                              type="email"
                              required
                              value={studentEmailInput}
                              onChange={(e) => {
                                setStudentEmailInput(e.target.value);
                                setUploadError(null);
                              }}
                              placeholder="उदा. yourname@gmail.com"
                              className="w-full bg-stone-950 border border-amber-500/40 rounded-lg px-3 py-2 text-xs text-white placeholder-stone-600 focus:outline-none focus:border-amber-400"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-medium text-stone-400 mb-1">
                              आपका नाम (वैकल्पिक):
                            </label>
                            <input
                              type="text"
                              value={studentNameInput}
                              onChange={(e) => setStudentNameInput(e.target.value)}
                              placeholder="उदा. राहुल कुमार"
                              className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-2 text-xs text-white placeholder-stone-600 focus:outline-none focus:border-amber-500"
                            />
                          </div>
                        </div>
                      )}

                      {uploadError && (
                        <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-1.5">
                          <AlertCircle className="w-4 h-4 shrink-0" />
                          <span>{uploadError}</span>
                        </div>
                      )}

                      {/* Submit Button */}
                      <button
                        type="button"
                        onClick={handleSubmitScreenshot}
                        disabled={uploading || !screenshotData}
                        className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-stone-950 font-black py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 text-xs sm:text-sm transition-all shadow-md cursor-pointer"
                      >
                        {uploading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>स्क्रीनशॉट अपलोड हो रहा है...</span>
                          </>
                        ) : (
                          <>
                            <Upload className="w-4 h-4" />
                            <span>स्क्रीनशॉट सबमिट करें</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>

                {/* STEP 3: OPTIONAL WHATSAPP OPTION */}
                <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-2xl p-3 sm:p-3.5 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                      <MessageCircle className="w-4 h-4 text-emerald-400" />
                      या WhatsApp पर भी भेज सकते हैं:
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(WHATSAPP_DISPLAY, 'phone')}
                      className="text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
                    >
                      {copiedPhone ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedPhone ? 'कॉपी हो गया' : WHATSAPP_DISPLAY}</span>
                    </button>
                  </div>

                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 text-xs transition-all shadow-md cursor-pointer text-center group"
                  >
                    <MessageCircle className="w-4 h-4 text-white fill-white/20" />
                    <span>WhatsApp पर स्क्रीनशॉट भेजें</span>
                    <ExternalLink className="w-3.5 h-3.5 opacity-70 group-hover:translate-x-0.5 transition-transform" />
                  </a>
                </div>

                {/* Security & Verification note */}
                <div className="p-2.5 rounded-lg bg-stone-900 border border-stone-800 text-stone-400 text-[11px] flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>
                    स्क्रीनशॉट सबमिट होते ही एडमिन पैनल में आपका विवरण तुरंत पहुँच जाएगा।
                  </span>
                </div>
              </div>
            )}

            <button 
              onClick={onClose} 
              className="w-full bg-stone-800/80 hover:bg-stone-800 text-stone-400 hover:text-white font-medium py-2.5 px-4 rounded-xl transition-colors text-xs cursor-pointer"
            >
              वापस जाएँ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
