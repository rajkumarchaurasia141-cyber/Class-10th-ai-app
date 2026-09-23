import React, { useState, useRef } from 'react';
import { Settings, Phone, QrCode, Youtube, Instagram, MessageCircle, Send, CheckCircle2, AlertCircle, Save, Upload, Image as ImageIcon, RotateCcw } from 'lucide-react';
import { useData } from '../context/DataContext';
import { db } from '../lib/firebase';
import { doc } from 'firebase/firestore';
import { safeSetDoc } from '../utils/firestoreSafe';
import { AppLogo } from './AppLogo';

export function AdminSettingsManager() {
  const { appConfig, updateSettings } = useData();

  const [helplineNumber, setHelplineNumber] = useState(appConfig.helplineNumber);
  const [upiId, setUpiId] = useState(appConfig.upiId || '9708868515@yb1');
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState(appConfig.qrCodeDataUrl || '');
  const [appLogoUrl, setAppLogoUrl] = useState(appConfig.appLogoUrl || '');
  const [youtubeUrl, setYoutubeUrl] = useState(appConfig.youtubeUrl);
  const [instagramUrl, setInstagramUrl] = useState(appConfig.instagramUrl);
  const [whatsappGroupUrl, setWhatsappGroupUrl] = useState(appConfig.whatsappGroupUrl);
  const [telegramUrl, setTelegramUrl] = useState(appConfig.telegramUrl);
  const [price1Month, setPrice1Month] = useState((appConfig.price1Month || 99).toString());
  const [price1Year, setPrice1Year] = useState((appConfig.price1Year || 299).toString());

  const qrInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('कृपया केवल इमेज (JPG, PNG) फाइल चुनें।');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = async () => {
        const canvas = document.createElement('canvas');
        const MAX = 512;
        let w = img.width;
        let h = img.height;
        if (w > h) {
          if (w > MAX) { h *= MAX / w; w = MAX; }
        } else {
          if (h > MAX) { w *= MAX / h; h = MAX; }
        }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, w, h);
          const newLogoData = canvas.toDataURL('image/png', 0.95);
          setAppLogoUrl(newLogoData);
          try {
            await updateSettings({
              ...appConfig,
              appLogoUrl: newLogoData
            });
            setSuccessMsg('✅ बधाई हो! आपकी ओरिजिनल फोटो/डीपी तुरंत सेव हो गई है और पूरे ऐप में सेट हो चुकी है!');
            setTimeout(() => setSuccessMsg(''), 4000);
          } catch (err) {
            console.error(err);
          }
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleQrUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('कृपया केवल इमेज (JPG, PNG) फाइल चुनें।');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX = 600;
        let w = img.width;
        let h = img.height;
        if (w > h) {
          if (w > MAX) { h *= MAX / w; w = MAX; }
        } else {
          if (h > MAX) { w *= MAX / h; h = MAX; }
        }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, w, h);
          setQrCodeDataUrl(canvas.toDataURL('image/jpeg', 0.85));
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const mPrice = parseInt(price1Month);
    const yPrice = parseInt(price1Year);

    if (isNaN(mPrice) || isNaN(yPrice)) {
      setErrorMsg('कृपया मूल्य में सही संख्या (Number) दर्ज करें।');
      return;
    }

    try {
      // 1. Update general settings config
      await updateSettings({
        helplineNumber: helplineNumber.trim(),
        upiId: upiId.trim(),
        qrCodeDataUrl: qrCodeDataUrl.trim(),
        appLogoUrl: appLogoUrl.trim(),
        youtubeUrl: youtubeUrl.trim(),
        instagramUrl: instagramUrl.trim(),
        whatsappGroupUrl: whatsappGroupUrl.trim(),
        telegramUrl: telegramUrl.trim(),
        price1Month: mPrice,
        price1Year: yPrice
      });

      // 2. Synchronize configuration to Firestore "app_settings/payment_config"
      // to store config with fields: { upiId, price, qrCodeUrl, appLogoUrl }
      const paymentConfigRef = doc(db, 'app_settings', 'payment_config');
      await safeSetDoc(paymentConfigRef, {
        upiId: upiId.trim(),
        price: yPrice || 299,
        qrCodeUrl: qrCodeDataUrl.trim(),
        appLogoUrl: appLogoUrl.trim()
      }, { merge: true }, 5000, true);

      setSuccessMsg('बधाई हो! सभी सेटिंग्स, ऐप लोगो/DP, UPI स्कैनर, सोशल मीडिया लिंक्स और कीमतें सफलतापूर्वक अपडेट हो गई हैं!');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      console.error("Save settings error:", err);
      setErrorMsg('सेटिंग्स सेव करने में त्रुटि: ' + (err?.message || String(err)));
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto text-stone-900">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-black text-stone-900 flex items-center gap-2">
            <Settings className="w-5 h-5 text-amber-600" />
            UPI व QR सेटिंग्स & क्रैश कोर्स मूल्य (Admin Settings)
          </h3>
          <p className="text-xs text-stone-500">यहाँ से आप अपना QR कोड स्कैनर अपलोड कर सकते हैं, मोबाइल नंबर, UPI ID और क्रैश कोर्स की कीमतें बदल सकते हैं।</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-6">
        
        {/* Contact & Payment Settings */}
        <div className="space-y-4">
          <h4 className="text-xs font-black uppercase tracking-wider text-stone-800 border-b border-slate-100 pb-2 flex items-center gap-2">
            <Phone className="w-4 h-4 text-amber-600" />
            1. हेल्पलाइन नंबर एवं पेमेंट (UPI ID & QR Scanner)
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-700">स्टूडेंट हेल्पलाइन / मोबाइल नंबर</label>
              <input
                type="text"
                required
                value={helplineNumber}
                onChange={(e) => setHelplineNumber(e.target.value)}
                placeholder="उदा: 9241511070"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 font-bold focus:outline-none focus:border-amber-500"
                style={{ minHeight: '44px' }}
              />
              <span className="text-[10px] text-stone-500">यह नंबर छात्रों को हेल्पलाइन और WhatsApp पर दिखेगा।</span>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-700">पेमेंट UPI ID (PhonePay/GPay/Paytm)</label>
              <input
                type="text"
                required
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                placeholder="उदा: 9708868515@yb1"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 font-bold focus:outline-none focus:border-amber-500"
                style={{ minHeight: '44px' }}
              />
              <span className="text-[10px] text-stone-500 font-bold">छात्र इसी UPI ID पर पेमेंट करके स्क्रीनशॉट भेजेंगे।</span>
            </div>
          </div>

          {/* QR Code Scanner Upload */}
          <div className="space-y-2 pt-2">
            <label className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
              <QrCode className="w-4 h-4 text-amber-600" />
              अपना UPI QR कोड स्कैनर (QR Code Scanner Image) अपलोड करें:
            </label>
            <input 
              type="file" 
              ref={qrInputRef}
              accept="image/*" 
              onChange={handleQrUpload} 
              className="hidden" 
            />

            {!qrCodeDataUrl ? (
              <div 
                onClick={() => qrInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 hover:border-amber-500 bg-slate-50 rounded-2xl p-5 text-center cursor-pointer transition-all group"
              >
                <div className="w-10 h-10 rounded-full bg-amber-500/10 text-amber-600 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                  <Upload className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-stone-800 block">QR कोड स्कैनर फोटो चुनें</span>
                <span className="text-[11px] text-stone-500 block mt-0.5">छात्र इस स्कैनर पर सीधे स्कैन करके पेमेंट कर पाएंगे</span>
              </div>
            ) : (
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex items-center gap-4">
                <div className="w-24 h-24 bg-white border border-slate-300 rounded-xl overflow-hidden flex items-center justify-center shrink-0 shadow-xs">
                  <img src={qrCodeDataUrl} alt="UPI QR Code Scanner" className="w-full h-full object-contain" />
                </div>
                <div className="space-y-1.5 flex-1">
                  <div className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> QR स्कैनर सफलतापूर्वक अपलोड है
                  </div>
                  <p className="text-[11px] text-stone-500">
                    छात्र अब क्रैश कोर्स खरीदते समय इस QR कोड को स्कैन करके सीधे भुगतान कर सकेंगे।
                  </p>
                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => qrInputRef.current?.click()}
                      className="px-3 py-1.5 rounded-lg bg-stone-900 text-white font-bold text-[11px] hover:bg-black transition-colors cursor-pointer"
                      style={{ minHeight: '36px' }}
                    >
                      स्कैनर बदलें
                    </button>
                    <button
                      type="button"
                      onClick={() => setQrCodeDataUrl('')}
                      className="px-3 py-1.5 rounded-lg bg-rose-100 text-rose-700 font-bold text-[11px] hover:bg-rose-200 transition-colors cursor-pointer"
                      style={{ minHeight: '36px' }}
                    >
                      हटाएँ
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* App Logo & DP Manager */}
          <div className="space-y-2 pt-4 border-t border-slate-200/80">
            <label className="text-xs font-bold text-stone-800 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-amber-600" />
                ऐप का आधिकारिक लोगो एवं डीपी (App Official Logo & DP):
              </span>
              <span className="text-[10px] bg-amber-100 text-amber-800 font-black px-2 py-0.5 rounded-full">
                {appLogoUrl ? 'कस्टम डीपी एक्टिव' : 'डिफ़ॉल्ट लोगो एक्टिव'}
              </span>
            </label>
            <input 
              type="file" 
              ref={logoInputRef}
              accept="image/*" 
              onChange={handleLogoUpload} 
              className="hidden" 
            />

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex items-center gap-4">
              <div className="relative shrink-0">
                <div className="w-20 h-20 rounded-full bg-stone-900 border-2 border-amber-400 p-0.5 shadow-md flex items-center justify-center overflow-hidden">
                  {appLogoUrl ? (
                    <img src={appLogoUrl} alt="App DP" className="w-full h-full object-cover rounded-full" />
                  ) : (
                    <AppLogo className="w-full h-full rounded-full" />
                  )}
                </div>
              </div>
              <div className="space-y-1.5 flex-1">
                <div className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> 
                  {appLogoUrl ? 'कस्टम डीपी फोटो सेव है' : 'आधिकारिक "पढ़ेगा BR" लोगो'}
                </div>
                <p className="text-[11px] text-stone-500">
                  यह फोटो पूरे ऐप के हेडर, साइड मेनू, लॉगिन स्क्रीन और डाउनलोड पेज पर दिखाई देगी।
                </p>
                <div className="flex gap-2 pt-1 flex-wrap">
                  <button
                    type="button"
                    onClick={() => logoInputRef.current?.click()}
                    className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 text-white font-black text-xs hover:from-red-700 hover:to-amber-700 transition-all shadow-md cursor-pointer flex items-center gap-1.5 active:scale-95"
                    style={{ minHeight: '38px' }}
                  >
                    <Upload className="w-4 h-4" />
                    📸 अपनी असली फोटो चुनें (सेम टू सेम DP सेट करें)
                  </button>
                  {appLogoUrl && (
                    <button
                      type="button"
                      onClick={async () => {
                        setAppLogoUrl('');
                        await updateSettings({
                          ...appConfig,
                          appLogoUrl: ''
                        });
                        setSuccessMsg('डिफ़ॉल्ट लोगो रीसेट कर दिया गया!');
                        setTimeout(() => setSuccessMsg(''), 3000);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-slate-200 text-stone-800 font-bold text-[11px] hover:bg-slate-300 transition-colors cursor-pointer flex items-center gap-1"
                      style={{ minHeight: '38px' }}
                      title="डिफ़ॉल्ट लोगो वापस लाएँ"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      डिफ़ॉल्ट लोगो पर रीसेट करें
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* VIP Course Pricing Settings */}
        <div className="space-y-4 pt-2">
          <h4 className="text-xs font-black uppercase tracking-wider text-stone-800 border-b border-slate-100 pb-2 flex items-center gap-2">
            <QrCode className="w-4 h-4 text-emerald-600" />
            2. क्रैश कोर्स सदस्यता मूल्य (Pricing Management)
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-700">1 माह डेमो मूल्य (वैकल्पिक) (₹)</label>
              <input
                type="number"
                required
                value={price1Month}
                onChange={(e) => setPrice1Month(e.target.value)}
                placeholder="99"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 font-bold focus:outline-none focus:border-emerald-500"
                style={{ minHeight: '44px' }}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-700">बोर्ड परीक्षा क्रैश कोर्स पूरा मूल्य (₹) *</label>
              <input
                type="number"
                required
                value={price1Year}
                onChange={(e) => setPrice1Year(e.target.value)}
                placeholder="299"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 font-bold focus:outline-none focus:border-emerald-500"
                style={{ minHeight: '44px' }}
              />
              <span className="text-[10px] text-stone-500 block font-bold">डिफ़ॉल्ट ₹299 सेट करें। यही कीमत छात्रों को पॉपअप में दिखेगी।</span>
            </div>
          </div>
        </div>

        {/* Social Media Links */}
        <div className="space-y-4 pt-2">
          <h4 className="text-xs font-black uppercase tracking-wider text-stone-800 border-b border-slate-100 pb-2 flex items-center gap-2">
            <Youtube className="w-4 h-4 text-red-600" />
            3. सोशल मीडिया अकाउंट लिंक्स (Social Media Links)
          </h4>

          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
                <Youtube className="w-3.5 h-3.5 text-red-600" /> YouTube चैनल URL
              </label>
              <input
                type="url"
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                placeholder="https://www.youtube.com/@Vidyaagent2.0"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-stone-900 focus:outline-none focus:border-red-500 font-mono text-[11px]"
                style={{ minHeight: '44px' }}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
                <Instagram className="w-3.5 h-3.5 text-pink-600" /> Instagram प्रोफाइल URL
              </label>
              <input
                type="url"
                value={instagramUrl}
                onChange={(e) => setInstagramUrl(e.target.value)}
                placeholder="https://www.instagram.com/unbroken_raj_01"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-stone-900 focus:outline-none focus:border-pink-500 font-mono text-[11px]"
                style={{ minHeight: '44px' }}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-600" /> WhatsApp ग्रुप URL
                </label>
                <input
                  type="url"
                  value={whatsappGroupUrl}
                  onChange={(e) => setWhatsappGroupUrl(e.target.value)}
                  placeholder="https://wa.me/919241511070"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-stone-900 focus:outline-none focus:border-emerald-500 font-mono text-[11px]"
                  style={{ minHeight: '44px' }}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
                  <Send className="w-3.5 h-3.5 text-sky-600" /> Telegram चैनल URL
                </label>
                <input
                  type="url"
                  value={telegramUrl}
                  onChange={(e) => setTelegramUrl(e.target.value)}
                  placeholder="https://t.me/..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-stone-900 focus:outline-none focus:border-sky-500 font-mono text-[11px]"
                  style={{ minHeight: '44px' }}
                />
              </div>
            </div>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-xs rounded-xl flex items-center gap-2 font-bold">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs rounded-xl flex items-center gap-2 font-bold">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <button
          type="submit"
          className="w-full bg-stone-900 hover:bg-stone-950 text-amber-400 font-black py-3.5 rounded-2xl transition-all shadow-md text-xs sm:text-sm cursor-pointer flex items-center justify-center gap-2"
          style={{ minHeight: '44px' }}
        >
          <Save className="w-4 h-4 text-amber-400" /> सभी सेटिंग्स सेव करें (Save Settings)
        </button>
      </form>
    </div>
  );
}
