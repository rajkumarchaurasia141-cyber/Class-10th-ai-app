import React, { useEffect } from 'react';
import { Smartphone, Download, CheckCircle2, ShieldCheck, Sparkles, ArrowLeft, BookOpen, Award } from 'lucide-react';
import { useData } from '../context/DataContext';

export function DownloadPage({ onBackToApp }: { onBackToApp: () => void }) {
  const { appConfig } = useData();
  const apkUrl = appConfig.apkUrl || 'https://ais-dev-k35g6pjdntzyqazh4vjcv2-479527350739.asia-east1.run.app';

  useEffect(() => {
    // Automatically trigger download after 800ms
    const timer = setTimeout(() => {
      try {
        const link = document.createElement('a');
        link.href = apkUrl;
        link.setAttribute('download', 'BSEB_10th_Topper_2027.apk');
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (e) {
        window.open(apkUrl, '_blank');
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [apkUrl]);

  const handleDownload = () => {
    window.open(apkUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-900 via-red-950 to-stone-950 text-white flex flex-col items-center justify-start p-4 sm:p-6 selection:bg-amber-500/30">
      <div className="w-full max-w-md mx-auto space-y-6 pt-4 pb-12">
        {/* Top bar */}
        <div className="flex items-center justify-between">
          <button
            onClick={onBackToApp}
            className="flex items-center gap-1.5 text-stone-300 hover:text-white bg-white/10 hover:bg-white/20 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> ऐप पर वापस जाएँ
          </button>
          <span className="bg-amber-400 text-stone-950 font-black text-[10px] px-2.5 py-1 rounded-full uppercase tracking-wider">
            Official APK v2.7
          </span>
        </div>

        {/* Hero Card */}
        <div className="bg-stone-900/90 border border-amber-500/30 rounded-3xl p-6 text-center space-y-4 shadow-2xl backdrop-blur-md relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none"></div>

          <div className="w-20 h-20 bg-gradient-to-tr from-amber-500 to-red-600 rounded-2xl mx-auto flex items-center justify-center shadow-lg border border-amber-300/30 animate-pulse">
            <Smartphone className="w-10 h-10 text-stone-950" />
          </div>

          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1 bg-emerald-500/20 text-emerald-300 text-[11px] font-bold px-3 py-1 rounded-full border border-emerald-500/30">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" /> ऑटो-डाउनलोड शुरू हो रहा है...
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              10th BSEB Topper App 2027
            </h1>
            <p className="text-xs text-stone-300">
              बिहार बोर्ड परीक्षा की संपूर्ण तैयारी (Live Classes, Notes & 50 MCQ Tests)
            </p>
          </div>

          {/* Big Prominent Download Button */}
          <div className="pt-2 space-y-3">
            <button
              onClick={handleDownload}
              className="w-full bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-stone-950 font-black py-4 px-6 rounded-2xl shadow-xl hover:shadow-amber-500/20 transition-all transform hover:-translate-y-0.5 cursor-pointer flex items-center justify-center gap-2 text-sm sm:text-base group"
            >
              <Download className="w-5 h-5 animate-bounce text-stone-950" />
              📥 यहाँ क्लिक करके APK डाउनलोड करें
            </button>
            <p className="text-[11px] text-stone-400 flex items-center justify-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> 100% सुरक्षित और वायरस-मुक्त (Size: ~12 MB)
            </p>
          </div>
        </div>

        {/* Features Highlights */}
        <div className="bg-stone-900/60 border border-white/10 rounded-2xl p-5 space-y-3 backdrop-blur-sm">
          <h3 className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
            <Award className="w-4 h-4 text-amber-400" /> ऐप की मुख्य विशेषताएँ:
          </h3>
          <div className="grid grid-cols-1 gap-2.5 text-xs text-stone-300">
            <div className="flex items-center gap-2 bg-white/5 p-2 rounded-xl">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>हस्तलिखित चैप्टर नोट्स (Chapterwise PDF Download)</span>
            </div>
            <div className="flex items-center gap-2 bg-white/5 p-2 rounded-xl">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>प्रत्येक अध्याय के 50 महत्वपूर्ण ऑब्जेक्टिव MCQ टेस्ट</span>
            </div>
            <div className="flex items-center gap-2 bg-white/5 p-2 rounded-xl">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>संस्कृत पीयूषम् सम्पूर्ण श्लोक और शब्दार्थ</span>
            </div>
            <div className="flex items-center gap-2 bg-white/5 p-2 rounded-xl">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>लाइव कक्षाएं एवं डाउट समाधान</span>
            </div>
          </div>
        </div>

        {/* Installation Instructions */}
        <div className="bg-stone-900/60 border border-white/10 rounded-2xl p-5 space-y-3 backdrop-blur-sm">
          <h3 className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-amber-400" /> मोबाइल में इनस्टॉल कैसे करें?
          </h3>
          <ol className="list-decimal list-inside space-y-2 text-xs text-stone-300 leading-relaxed">
            <li>डाउनलोड पूरी होने के बाद नोटिफिकेशन या डाउनलोड फोल्डर में APK पर क्लिक करें।</li>
            <li>यदि ब्राउज़र या फोन चेतावनी दे, तो <strong className="text-white">"Settings &gt; Allow from this source"</strong> या <strong className="text-white">"Download Anyway"</strong> पर क्लिक करें।</li>
            <li><strong className="text-amber-400">"Install"</strong> बटन दबाएं और अपनी पढ़ाई शुरू करें!</li>
          </ol>
        </div>

        <div className="text-center text-[11px] text-stone-500 pt-2">
          Bihar School Examination Board (BSEB) 2027 Prep App • Powered by Vidya Agent
        </div>
      </div>
    </div>
  );
}
