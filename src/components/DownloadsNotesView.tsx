import React, { useState } from 'react';
import { 
  DownloadCloud, 
  FileText, 
  Crown, 
  CheckCircle2, 
  Lock, 
  ChevronRight, 
  Sparkles, 
  BookOpen,
  ArrowDownToLine
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';

interface DownloadsNotesViewProps {
  onOpenSubject: (subjectId: string) => void;
  onOpenVip: () => void;
}

export function DownloadsNotesView({ onOpenSubject, onOpenVip }: DownloadsNotesViewProps) {
  const { subjects } = useData();
  const { isVIP } = useAuth();
  const [downloadedItems, setDownloadedItems] = useState<Record<string, boolean>>({
    'sanskrit-ch1': true,
    'science-ch1': true
  });
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const subList = Object.values(subjects);

  const handleDownload = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isVIP && id !== 'sanskrit-ch1') {
      onOpenVip();
      return;
    }
    setDownloadingId(id);
    setTimeout(() => {
      setDownloadedItems((prev) => ({ ...prev, [id]: true }));
      setDownloadingId(null);
    }, 1000);
  };

  return (
    <div className="max-w-lg mx-auto p-4 space-y-4 pb-20">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-red-700 via-red-800 to-stone-900 text-white p-4 rounded-3xl shadow-sm space-y-1">
        <div className="flex items-center gap-2">
          <DownloadCloud className="w-5 h-5 text-amber-300" />
          <h3 className="font-black text-base text-white">डिजिटल नोट्स & पीडीएफ लाइब्रेरी</h3>
        </div>
        <p className="text-xs text-stone-200">
          कक्षा 10वीं के सभी 6 विषयों के सम्पूर्ण हस्तलिखित नोट्स व बोर्ड मॉडल प्रश्नोत्तर।
        </p>
      </div>

      {/* Subjects & Notes List */}
      <div className="space-y-3">
        {subList.map((sub: any) => {
          const chapters = sub.chapters || [];
          return (
            <div
              key={sub.id}
              className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-50 text-red-700 flex items-center justify-center font-black text-xs">
                    10th
                  </div>
                  <div>
                    <h4 className="font-extrabold text-stone-900 text-sm">
                      {sub.subject_name_hindi || sub.subject_name}
                    </h4>
                    <span className="text-[11px] text-stone-500">
                      {chapters.length} अध्याय उपलब्ध
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => onOpenSubject(sub.id)}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-stone-700 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <span>खोलें</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Sample chapters preview */}
              <div className="divide-y divide-slate-100 bg-slate-50 rounded-xl p-2 text-xs space-y-1">
                {chapters.slice(0, 3).map((ch: any) => {
                  const isLocked = ch.chapter_no > 1 && !isVIP;
                  const noteKey = `${sub.id}-ch${ch.chapter_no}`;
                  const isDownloaded = downloadedItems[noteKey];

                  return (
                    <div
                      key={ch.chapter_no}
                      onClick={() => onOpenSubject(sub.id)}
                      className="py-1.5 px-2 flex items-center justify-between hover:bg-white rounded-lg transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <FileText className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                        <span className="truncate text-stone-800 font-medium">
                          पाठ {ch.chapter_no}: {ch.chapter_name_hindi || ch.chapter_name}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {isLocked ? (
                          <span className="flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-100/80 px-2 py-0.5 rounded">
                            <Lock className="w-3 h-3" /> VIP
                          </span>
                        ) : (
                          <button
                            onClick={(e) => handleDownload(noteKey, e)}
                            className="p-1 text-stone-500 hover:text-emerald-600 cursor-pointer"
                            title={isDownloaded ? 'डाउनलोड किया गया' : 'डाउनलोड करें'}
                          >
                            {isDownloaded ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            ) : downloadingId === noteKey ? (
                              <span className="text-[10px] text-red-600 font-bold">डाउनलोडिंग...</span>
                            ) : (
                              <ArrowDownToLine className="w-4 h-4" />
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
