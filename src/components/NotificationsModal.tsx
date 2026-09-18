import React from 'react';
import { X, Bell, Crown, Sparkles, BookOpen, Clock, ChevronRight } from 'lucide-react';
import { useData } from '../context/DataContext';

interface NotificationsModalProps {
  onClose: () => void;
  onOpenVip: () => void;
  onOpenCourse: () => void;
}

export function NotificationsModal({ onClose, onOpenVip, onOpenCourse }: NotificationsModalProps) {
  const { notifications } = useData();

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
          {notifications.map((n) => {
            let actionFn = null;
            let actionText = null;
            if (n.actionType === 'vip') {
              actionFn = onOpenVip;
              actionText = 'ऑफर देखें';
            } else if (n.actionType === 'courses' || n.actionType === 'live') {
              actionFn = onOpenCourse;
              actionText = n.actionType === 'live' ? 'लाइव क्लास देखें' : 'कोर्स खोलें';
            }

            return (
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
                  {n.description}
                </p>

                <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 text-[10px] text-stone-500">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {n.timeLabel || 'अभी-अभी'}
                  </span>

                  {actionFn && (
                    <button
                      onClick={() => {
                        onClose();
                        actionFn();
                      }}
                      className="text-xs font-bold text-red-700 hover:text-red-900 flex items-center gap-0.5 cursor-pointer"
                    >
                      <span>{actionText}</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
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
