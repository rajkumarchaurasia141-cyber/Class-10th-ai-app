import React from 'react';
import { X, Bell, Crown, Sparkles, BookOpen, Clock, ChevronRight } from 'lucide-react';

interface NotificationsModalProps {
  onClose: () => void;
  onOpenVip: () => void;
  onOpenCourse: () => void;
}

export function NotificationsModal({ onClose, onOpenVip, onOpenCourse }: NotificationsModalProps) {
  const notifications = [
    {
      id: 'notif-1',
      title: '🎉 टॉपर बैच 2027 स्पेशल ऑफर!',
      desc: 'बिहार बोर्ड 10वीं के सभी 6 विषयों का सम्पूर्ण कोर्स अब मात्र ₹99 (1 माह) या ₹600 (पूरे 1 वर्ष) में उपलब्ध है। अभी VIP बैच अनलॉक करें।',
      time: '10 मिनट पहले',
      isNew: true,
      action: onOpenVip,
      actionText: 'ऑफर देखें'
    },
    {
      id: 'notif-2',
      title: '📝 संस्कृत (मङ्गलम्) के 50 नए VVI MCQs लाइव हैं',
      desc: 'संस्कृत पीयूषम् के प्रथम पाठ के 50 चुनिंदा वस्तुनिष्ठ प्रश्नों का टेस्ट सेट अपलोड कर दिया गया है। अपना स्कोर तुरंत चेक करें।',
      time: 'आज, 09:30 AM',
      isNew: true,
      action: onOpenCourse,
      actionText: 'टेस्ट दें'
    },
    {
      id: 'notif-3',
      title: '📚 NCERT विज्ञान & गणित डिजिटल नोट्स उपलब्ध',
      desc: 'सभी अध्यायों के हस्तलिखित नोट्स, सूत्र एवं बोर्ड परीक्षा मॉडल उत्तर पीडीएफ फॉर्मेट में उपलब्ध हैं।',
      time: 'कल, 06:15 PM',
      isNew: false,
      action: onOpenCourse,
      actionText: 'नोट्स पढ़ें'
    },
    {
      id: 'notif-4',
      title: '⏰ क्लास रूटीन 2027 अपडेट कर दिया गया है',
      desc: 'दैनिक सुबह 6:30 AM से शाम 8:30 PM तक का सम्पूर्ण शेड्यूल ऐप के "Class Routine" सेक्शन में देख सकते हैं।',
      time: '2 दिन पहले',
      isNew: false,
      action: null,
      actionText: null
    }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-slate-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-700 via-red-800 to-stone-900 text-white p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/15 flex items-center justify-center text-amber-300 border border-white/20">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-base sm:text-lg text-white leading-tight">
                सूचनाएं एवं अपडेट्स
              </h3>
              <p className="text-xs text-amber-200">कक्षा 10वीं बिहार बोर्ड दैनिक सूचनाएं</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`p-3.5 rounded-2xl border transition-all space-y-2 ${
                n.isNew
                  ? 'bg-amber-50/50 border-amber-300/80 shadow-xs'
                  : 'bg-slate-50/60 border-slate-200'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <h4 className="font-extrabold text-stone-900 text-sm leading-tight">
                  {n.title}
                </h4>
                {n.isNew && (
                  <span className="bg-red-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full shrink-0">
                    NEW
                  </span>
                )}
              </div>

              <p className="text-xs text-stone-600 leading-relaxed">
                {n.desc}
              </p>

              <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 text-[10px] text-stone-500">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {n.time}
                </span>

                {n.action && (
                  <button
                    onClick={() => {
                      onClose();
                      n.action?.();
                    }}
                    className="text-xs font-bold text-red-700 hover:text-red-900 flex items-center gap-0.5 cursor-pointer"
                  >
                    <span>{n.actionText}</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 text-center">
          <button
            onClick={onClose}
            className="w-full py-2 bg-slate-200 hover:bg-slate-300 text-stone-800 font-bold text-xs rounded-xl transition-colors cursor-pointer"
          >
            सभी सूचनाएं पढ़ लीं
          </button>
        </div>
      </div>
    </div>
  );
}
