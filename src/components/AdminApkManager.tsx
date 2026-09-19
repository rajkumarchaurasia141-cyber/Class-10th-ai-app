import React, { useState } from 'react';
import { Smartphone, Download, Copy, CheckCircle2, Share2, Globe, Send, MessageCircle, Save, AlertCircle, FileCode } from 'lucide-react';
import { useData } from '../context/DataContext';

export function AdminApkManager() {
  const { appConfig, updateSettings } = useData();

  const [apkUrl, setApkUrl] = useState(appConfig.apkUrl || 'https://ais-dev-k35g6pjdntzyqazh4vjcv2-479527350739.asia-east1.run.app');
  const [aabUrl, setAabUrl] = useState(appConfig.aabUrl || 'https://ais-dev-k35g6pjdntzyqazh4vjcv2-479527350739.asia-east1.run.app');
  
  const [copiedApk, setCopiedApk] = useState(false);
  const [copiedAab, setCopiedAab] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

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

  const copyToClipboard = (text: string, type: 'apk' | 'aab') => {
    navigator.clipboard.writeText(text);
    if (type === 'apk') {
      setCopiedApk(true);
      setTimeout(() => setCopiedApk(false), 2500);
    } else {
      setCopiedAab(true);
      setTimeout(() => setCopiedAab(false), 2500);
    }
  };

  const shareOnWhatsApp = (url: string, fileType: string) => {
    const text = encodeURIComponent(`🔥 बिहार बोर्ड 2027 (10th BSEB) ऑफिशियल ${fileType} ऐप डाउनलोड करें!\n\nडाउनलोड लिंक: ${url}\n\nइस ऐप में सभी विषयों के चैप्टर नोट्स, लाइव क्लासेस और 50 MCQ टेस्ट फ्री हैं!`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const shareOnTelegram = (url: string, fileType: string) => {
    const text = encodeURIComponent(`🔥 बिहार बोर्ड 2027 (10th BSEB) ऑफिशियल ${fileType} ऐप डाउनलोड करें!\n\nलिंक: ${url}`);
    window.open(`https://t.me/share/url?url=${url}&text=${text}`, '_blank');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-black text-stone-900 flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-emerald-600" />
            एंड्रॉइड ऐप (APK & AAB) फाइल और शेयर मैनेजर (App Distribution)
          </h3>
          <p className="text-xs text-stone-500">यहाँ से आप अपनी ऐप की APK और AAB फाइल/लिंक को मैनेज कर सकते हैं, कॉपी कर सकते हैं और छात्रों के साथ शेयर कर सकते हैं।</p>
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
          <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* APK Section */}
        <div className="space-y-3 bg-slate-50 border border-slate-200 rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-black uppercase tracking-wider text-stone-900 flex items-center gap-2">
              <Download className="w-4 h-4 text-emerald-600" />
              1. APK फाइल / डायरेक्ट डाउनलोड लिंक (Android App)
            </h4>
            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">
              Ready for Students
            </span>
          </div>

          <div className="space-y-2">
            <input
              type="url"
              required
              value={apkUrl}
              onChange={(e) => setApkUrl(e.target.value)}
              placeholder="https://.../app-release.apk"
              className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 font-mono focus:outline-none focus:border-emerald-500"
            />
            <span className="text-[11px] text-stone-500 block">
              आप इस लिंक को Google Drive, Firebase Storage या अपनी होस्टिंग पर अपलोड करके यहाँ डाल सकते हैं।
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-2">
            <button
              type="button"
              onClick={() => copyToClipboard(apkUrl, 'apk')}
              className="px-3.5 py-2 bg-stone-900 hover:bg-black text-amber-400 font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
            >
              <Copy className="w-3.5 h-3.5" /> {copiedApk ? 'लिंक कॉपी हो गया!' : 'APK लिंक कॉपी करें'}
            </button>

            <button
              type="button"
              onClick={() => shareOnWhatsApp(apkUrl, 'APK')}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
            >
              <MessageCircle className="w-3.5 h-3.5" /> WhatsApp पर शेयर करें
            </button>

            <button
              type="button"
              onClick={() => shareOnTelegram(apkUrl, 'APK')}
              className="px-3.5 py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
            >
              <Send className="w-3.5 h-3.5" /> Telegram पर शेयर करें
            </button>

            <a
              href={apkUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 bg-slate-200 hover:bg-slate-300 text-stone-800 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5"
            >
              <Globe className="w-3.5 h-3.5" /> ओपन करें
            </a>
          </div>
        </div>

        {/* AAB Section */}
        <div className="space-y-3 bg-slate-50 border border-slate-200 rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-black uppercase tracking-wider text-stone-900 flex items-center gap-2">
              <FileCode className="w-4 h-4 text-amber-600" />
              2. AAB फाइल / प्ले स्टोर बंडल लिंक (Google Play Console App Bundle)
            </h4>
            <span className="bg-amber-100 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded">
              Play Store Build (.aab)
            </span>
          </div>

          <div className="space-y-2">
            <input
              type="url"
              required
              value={aabUrl}
              onChange={(e) => setAabUrl(e.target.value)}
              placeholder="https://.../app-release.aab"
              className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 font-mono focus:outline-none focus:border-amber-500"
            />
            <span className="text-[11px] text-stone-500 block">
              Google Play Console पर पब्लिश करने के लिए `.aab` (Android App Bundle) फाइल लिंक यहाँ सुरक्षित रख सकते हैं।
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-2">
            <button
              type="button"
              onClick={() => copyToClipboard(aabUrl, 'aab')}
              className="px-3.5 py-2 bg-stone-900 hover:bg-black text-amber-400 font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
            >
              <Copy className="w-3.5 h-3.5" /> {copiedAab ? 'लिंक कॉपी हो गया!' : 'AAB लिंक कॉपी करें'}
            </button>

            <button
              type="button"
              onClick={() => shareOnWhatsApp(aabUrl, 'AAB')}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
            >
              <MessageCircle className="w-3.5 h-3.5" /> WhatsApp पर शेयर करें
            </button>

            <button
              type="button"
              onClick={() => shareOnTelegram(aabUrl, 'AAB')}
              className="px-3.5 py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
            >
              <Send className="w-3.5 h-3.5" /> Telegram पर शेयर करें
            </button>
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-stone-900 hover:bg-stone-950 text-amber-400 font-black py-3.5 rounded-2xl transition-all shadow-md text-xs sm:text-sm cursor-pointer flex items-center justify-center gap-2"
        >
          <Save className="w-4 h-4 text-amber-400" /> APK & AAB लिंक्स सेव करें (Save Links)
        </button>
      </form>
    </div>
  );
}
