import React, { useState } from 'react';
import { Smartphone, Copy, CheckCircle2, Share2, Sparkles, PlusSquare, ExternalLink, Globe } from 'lucide-react';
import { useData } from '../context/DataContext';

export function AdminApkManager() {
  const { appConfig } = useData();
  const [copiedApp, setCopiedApp] = useState(false);
  const [copiedAdLink, setCopiedAdLink] = useState(false);

  const currentDomain = typeof window !== 'undefined' ? window.location.origin : 'https://ais-pre-k35g6pjdntzyqazh4vjcv2-479527350739.asia-east1.run.app';
  
  // Clean App URL for Ads & Promotion
  const adCampaignUrl = currentDomain;

  const copyToClipboard = async (text: string, type: 'app' | 'ad') => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === 'app') {
        setCopiedApp(true);
        setTimeout(() => setCopiedApp(false), 2500);
      } else {
        setCopiedAdLink(true);
        setTimeout(() => setCopiedAdLink(false), 2500);
      }
    } catch (e) {
      prompt("लिंक कॉपी करें:", text);
    }
  };

  const shareOnWhatsApp = (url: string) => {
    const text = encodeURIComponent(`🔥 बिहार बोर्ड 10th (BSEB) की संपूर्ण तैयारी के लिए ऑफिशियल टॉपर वेब ऐप!\n\n📲 बिना किसी भारी APK के सीधे अपने फोन में इनस्टॉल करें:\n${url}\n\n✨ हस्तलिखित चैप्टर नोट्स, 50 MCQ टेस्ट और लाइव क्लासेस!`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-black text-stone-900 flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-emerald-600" />
            वेब ऐप (PWA) एवं विज्ञापन लिंक प्रबंधक (Web App & Ad Campaign Manager)
          </h3>
          <p className="text-xs text-stone-500">
            यह एक हाई-परफॉर्मेंस प्रोग्रेसिव वेब ऐप है। Google Ads, Facebook Ads, YouTube और Instagram Bio के लिए इसका सीधा लिंक उपयोग करें।
          </p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
        
        {/* Info Box explaining PWA & Ads */}
        <div className="bg-gradient-to-r from-emerald-950 via-stone-900 to-stone-950 text-white rounded-3xl p-5 border border-emerald-500/40 shadow-xl space-y-4">
          <div className="flex items-center gap-2.5 border-b border-white/10 pb-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-md">
              <Globe className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h4 className="font-black text-sm sm:text-base text-white">
                🌐 ऑफिशियल प्रोग्रेसिव वेब ऐप (PWA Standalone)
              </h4>
              <p className="text-xs text-emerald-200">
                APK की कोई ज़रूरत नहीं — यूजर के फोन में सीधे 1-टैप में ऐप जैसा इंस्टॉल होता है और विज्ञापन स्मूथली चलते हैं!
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-stone-300">
            <div className="flex items-start gap-2 bg-white/5 p-3 rounded-2xl">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span><strong>Google AdSense & Ad Networks:</strong> वेब ऐप पर एड्स 100% सही तरीके से रेंडर होते हैं।</span>
            </div>
            <div className="flex items-start gap-2 bg-white/5 p-3 rounded-2xl">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span><strong>No APK Security Warnings:</strong> फोन में कोई "Unknown Sources" या वायरस की चेतावनी नहीं आती।</span>
            </div>
          </div>
        </div>

        {/* Ad Campaign & Bio Link Section */}
        <div className="space-y-3 bg-slate-50 border border-slate-200 rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-black uppercase tracking-wider text-stone-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-600" />
              Ads Campaign एवं YouTube / Instagram Bio लिंक
            </h4>
            <span className="bg-emerald-100 text-emerald-900 text-[10px] font-bold px-2 py-0.5 rounded">
              Active Official Link
            </span>
          </div>

          <div className="space-y-2">
            <input
              type="text"
              readOnly
              value={adCampaignUrl}
              className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 font-mono focus:outline-none"
            />
            <span className="text-[11px] text-stone-500 block">
              Google Ads, Facebook Ads, YouTube Description और Instagram Bio में यही लिंक डालें। जब छात्र इस पर क्लिक करेंगे तो सीधे ऐप खुलेगा और होम स्क्रीन पर ऐड करने का विकल्प मिलेगा।
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-2">
            <button
              type="button"
              onClick={() => copyToClipboard(adCampaignUrl, 'ad')}
              className="px-4 py-2.5 bg-stone-900 hover:bg-black text-amber-400 font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
            >
              <Copy className="w-3.5 h-3.5" /> 
              {copiedAdLink ? 'विज्ञापन लिंक कॉपी हो गया!' : '📋 विज्ञापन / बायो लिंक कॉपी करें'}
            </button>

            <button
              type="button"
              onClick={() => shareOnWhatsApp(adCampaignUrl)}
              className="px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
            >
              <Share2 className="w-3.5 h-3.5" /> WhatsApp पर शेयर करें
            </button>
          </div>
        </div>

        {/* How users install it */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 space-y-2 text-xs text-amber-950">
          <div className="flex items-center gap-2 font-black text-amber-900">
            <PlusSquare className="w-4 h-4 text-amber-600 shrink-0" />
            <span>यूजर के फोन में ऐप कैसे इनस्टॉल होगा?</span>
          </div>
          <ol className="list-decimal list-inside space-y-1.5 text-stone-700 text-xs">
            <li>यूजर जब आपके विज्ञापन या बायो लिंक पर क्लिक करेगा, तो वेब ऐप तुरंत खुल जाएगा।</li>
            <li>नीचे स्क्रीन पर और लॉगिन पेज पर <strong>"फोन में ऐप जोड़ें"</strong> का बटन अपने आप दिखेगा।</li>
            <li>यूजर 1-क्लिक दबाते ही ऐप फोन की होम स्क्रीन पर असली एंड्रॉयड ऐप जैसा इंस्टॉल हो जाएगा।</li>
          </ol>
        </div>

      </div>
    </div>
  );
}
