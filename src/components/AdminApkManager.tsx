import React, { useState } from 'react';
import { Smartphone, Download, Copy, CheckCircle2, Share2, Globe, Send, MessageCircle, Save, AlertCircle, FileCode, ExternalLink, HelpCircle, Flame, Check } from 'lucide-react';
import { useData } from '../context/DataContext';

export function AdminApkManager() {
  const { appConfig, updateSettings } = useData();

  const [apkUrl, setApkUrl] = useState(appConfig.apkUrl || '');
  const [aabUrl, setAabUrl] = useState(appConfig.aabUrl || '');
  
  const [copiedApk, setCopiedApk] = useState(false);
  const [copiedWeb, setCopiedWeb] = useState(false);
  const [copiedAab, setCopiedAab] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const webDownloadLink = `${window.location.origin}/?download=apk`;
  const primaryShareLink = apkUrl.trim() || webDownloadLink;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    // Warn if user put the website URL into APK URL
    if (apkUrl.includes('run.app') && !apkUrl.endsWith('.apk') && !apkUrl.includes('uc?export=download')) {
      setErrorMsg('चेतावनी: आपने ऐप की वेबसाइट का लिंक (.) APK यूआरएल में डाल दिया है। कृपया असली .apk फाइल या Google Drive का डायरेक्ट डाउनलोड लिंक डालें ताकि सीधे मोबाइल में ऐप डाउनलोड हो सके!');
      return;
    }

    try {
      await updateSettings({
        ...appConfig,
        apkUrl: apkUrl.trim(),
        aabUrl: aabUrl.trim()
      });
      setSuccessMsg('APK और AAB फाइल लिंक्स सफलतापूर्वक अपडेट और सेव हो गए हैं!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: any) {
      setErrorMsg('सेव करने में त्रुटि: ' + (err?.message || String(err)));
    }
  };

  const copyToClipboard = (text: string, type: 'apk' | 'web' | 'aab') => {
    navigator.clipboard.writeText(text);
    if (type === 'apk') {
      setCopiedApk(true);
      setTimeout(() => setCopiedApk(false), 2500);
    } else if (type === 'web') {
      setCopiedWeb(true);
      setTimeout(() => setCopiedWeb(false), 2500);
    } else {
      setCopiedAab(true);
      setTimeout(() => setCopiedAab(false), 2500);
    }
  };

  const shareOnWhatsApp = (url: string) => {
    const text = encodeURIComponent(`🔥 बिहार बोर्ड 2027 (10th BSEB) ऑफिशियल टॉपर ऐप डाउनलोड करें!\n\n📥 सीधे मोबाइल में APK डाउनलोड करने के लिए यहाँ क्लिक करें:\n${url}\n\nइस ऐप में सभी विषयों के चैप्टर नोट्स, लाइव क्लासेस और 50 MCQ टेस्ट बिल्कुल फ्री हैं!`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const shareOnTelegram = (url: string) => {
    const text = encodeURIComponent(`🔥 बिहार बोर्ड 2027 (10th BSEB) ऑफिशियल टॉपर ऐप डाउनलोड करें!\n\n📥 डायरेक्ट APK डाउनलोड लिंक:\n${url}`);
    window.open(`https://t.me/share/url?url=${url}&text=${text}`, '_blank');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-black text-stone-900 flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-emerald-600" />
            डायरेक्ट APK डाउनलोड और बायो लिंक मैनेजर (Bio Link & App Distribution)
          </h3>
          <p className="text-xs text-stone-500">YouTube और Instagram Bio/Description में लगाने के लिए सही APK डाउनलोड लिंक यहाँ सेट करें।</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
        {successMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs rounded-xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="p-3 bg-red-50 border border-red-100 text-red-700 text-xs rounded-xl flex items-center gap-2 font-medium">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Master Guide */}
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-4 space-y-2 text-xs text-amber-950">
          <div className="flex items-center gap-2 font-black text-amber-900">
            <Flame className="w-4 h-4 text-amber-600 shrink-0" />
            <span>फिक्स समाधान: ब्राउज़र में खुलने की समस्या को कैसे रोकें?</span>
          </div>
          <p className="leading-relaxed">
            यदि छात्र लिंक पर क्लिक करते हैं और ब्राउज़र में वेबसाइट खुल जाती है, तो इसका कारण यह है कि आपने वेबसाइट का लिंक डाल रखा है। 
            <strong className="block mt-1 text-stone-900 font-bold">
              असली समाधान: अपनी .apk फाइल को Google Drive पर अपलोड करके उसका 'Anyone with the link can view' लिंक यहाँ डालें, या Google Drive Direct Download Link format का उपयोग करें।
            </strong>
          </p>
        </div>

        {/* Direct APK File URL Section */}
        <div className="space-y-3 bg-slate-50 border border-slate-200 rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-black uppercase tracking-wider text-stone-900 flex items-center gap-2">
              <Download className="w-4 h-4 text-amber-600" />
              वास्तविक .apk फाइल का डायरेक्ट लिंक (Google Drive / Direct .apk URL)
            </h4>
            <span className="bg-amber-100 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded">
              Bio & Description Link
            </span>
          </div>

          <div className="space-y-2">
            <input
              type="url"
              required
              value={apkUrl}
              onChange={(e) => setApkUrl(e.target.value)}
              placeholder="उदा: https://drive.google.com/uc?export=download&id=YOUR_FILE_ID"
              className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 font-mono focus:outline-none focus:border-amber-500"
            />
            <span className="text-[11px] text-stone-500 block">
              यह लिंक आपके YouTube डिस्क्रिप्शन और Instagram Bio में पेस्ट करने के लिए है। इस पर क्लिक करते ही फोन में APK डाउनलोड होना शुरू हो जाएगा।
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-2">
            <button
              type="button"
              onClick={() => copyToClipboard(primaryShareLink, 'apk')}
              className="px-4 py-2.5 bg-stone-900 hover:bg-black text-amber-400 font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
            >
              <Copy className="w-3.5 h-3.5" /> {copiedApk ? 'बायो लिंक कॉपी हो गया!' : '📋 बायो/डिस्क्रिप्शन लिंक कॉपी करें'}
            </button>

            <button
              type="button"
              onClick={() => shareOnWhatsApp(primaryShareLink)}
              className="px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
            >
              <MessageCircle className="w-3.5 h-3.5" /> WhatsApp पर शेयर करें
            </button>

            <button
              type="button"
              onClick={() => shareOnTelegram(primaryShareLink)}
              className="px-3.5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
            >
              <Send className="w-3.5 h-3.5" /> Telegram पर शेयर करें
            </button>
          </div>
        </div>

        {/* Fallback Web Download Center Link */}
        <div className="space-y-3 bg-stone-50 border border-slate-200 rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-black uppercase tracking-wider text-stone-800 flex items-center gap-2">
              <ExternalLink className="w-4 h-4 text-emerald-600" />
              वैकल्पिक: ऑनलाइन डाउनलोड पेज लिंक (Web Landing Page)
            </h4>
            <span className="bg-slate-200 text-stone-700 text-[10px] font-bold px-2 py-0.5 rounded">
              Landing Page
            </span>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              readOnly
              value={webDownloadLink}
              className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 font-mono focus:outline-none"
            />
            <button
              type="button"
              onClick={() => copyToClipboard(webDownloadLink, 'web')}
              className="px-4 py-2.5 bg-stone-200 hover:bg-stone-300 text-stone-800 font-bold text-xs rounded-xl transition-all cursor-pointer shrink-0 flex items-center gap-1"
            >
              <Copy className="w-3.5 h-3.5" /> {copiedWeb ? 'कॉपी हो गया!' : 'कॉपी'}
            </button>
          </div>
        </div>

        {/* AAB Section */}
        <div className="space-y-3 bg-slate-50 border border-slate-200 rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-black uppercase tracking-wider text-stone-900 flex items-center gap-2">
              <FileCode className="w-4 h-4 text-amber-600" />
              AAB फाइल लिंक (Google Play Console App Bundle)
            </h4>
            <span className="bg-amber-100 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded">
              Play Store Build (.aab)
            </span>
          </div>

          <div className="space-y-2">
            <input
              type="url"
              value={aabUrl}
              onChange={(e) => setAabUrl(e.target.value)}
              placeholder="https://.../app-release.aab"
              className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 font-mono focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={() => copyToClipboard(aabUrl, 'aab')}
              className="px-3.5 py-2 bg-stone-900 hover:bg-black text-amber-400 font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
            >
              <Copy className="w-3.5 h-3.5" /> {copiedAab ? 'AAB लिंक कॉपी हो गया!' : 'AAB लिंक कॉपी करें'}
            </button>
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-stone-900 hover:bg-stone-950 text-amber-400 font-black py-3.5 rounded-2xl transition-all shadow-md text-xs sm:text-sm cursor-pointer flex items-center justify-center gap-2"
        >
          <Save className="w-4 h-4 text-amber-400" /> APK & AAB लिंक्स सेव करें (Save Changes)
        </button>
      </form>
    </div>
  );
}
