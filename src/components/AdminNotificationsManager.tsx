import React, { useState } from 'react';
import { Bell, Plus, Trash2, CheckCircle2, AlertCircle, X, Send } from 'lucide-react';
import { useData } from '../context/DataContext';

export function AdminNotificationsManager() {
  const { notifications, addNotification, deleteNotification } = useData();

  const [showAddModal, setShowAddModal] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [timeLabel, setTimeLabel] = useState('अभी-अभी (Just Now)');
  const [actionType, setActionType] = useState<'live' | 'vip' | 'courses' | 'none'>('vip');

  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setErrorMsg('कृपया शीर्षक (Title) और संदेश (Description) दर्ज करें।');
      return;
    }

    try {
      await addNotification({
        title: title.trim(),
        description: description.trim(),
        timeLabel: timeLabel.trim() || 'अभी-अभी',
        isNew: true,
        actionType,
        createdAt: new Date().toISOString()
      });

      setSuccessMsg('बधाई हो! सूचना (Notification) सभी छात्रों के ऐप पर भेज दी गई है!');
      setTitle('');
      setDescription('');
      setTimeout(() => {
        setShowAddModal(false);
        setSuccessMsg('');
      }, 1800);
    } catch (err: any) {
      setErrorMsg('त्रुटि: ' + (err?.message || String(err)));
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-black text-stone-900 flex items-center gap-2">
            <Bell className="w-5 h-5 text-red-600 animate-bounce" />
            पुश नोटिफिकेशन्स & ब्रॉडकास्ट (Push Notifications)
          </h3>
          <p className="text-xs text-stone-500">यहाँ से आप जो भी लिखेंगे या लाइव क्लास की सूचना देंगे, वह तुरंत सभी छात्रों के ऐप में नोटिफिकेशन के रूप में पहुँच जाएगी।</p>
        </div>

        <button
          onClick={() => {
            setTitle('');
            setDescription('');
            setErrorMsg('');
            setSuccessMsg('');
            setShowAddModal(true);
          }}
          className="bg-red-700 hover:bg-red-800 text-white text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
        >
          <Send className="w-4 h-4" /> नया नोटिफिकेशन भेजें
        </button>
      </div>

      <div className="space-y-2.5">
        {notifications.map((item) => (
          <div
            key={item.id}
            className="bg-white border border-slate-200/90 rounded-2xl p-3.5 flex items-center justify-between gap-3 shadow-xs"
          >
            <div className="flex items-start gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-red-100 text-red-700 flex items-center justify-center shrink-0 mt-0.5">
                <Bell className="w-4 h-4" />
              </div>
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="font-extrabold text-stone-900 text-xs sm:text-sm">
                    {item.title}
                  </h4>
                  {item.isNew && (
                    <span className="bg-red-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">
                      ACTIVE
                    </span>
                  )}
                </div>
                <p className="text-xs text-stone-600 leading-relaxed">
                  {item.description}
                </p>
                <div className="flex items-center gap-3 text-[11px] text-stone-500">
                  <span>समय: <strong>{item.timeLabel}</strong></span>
                  <span>•</span>
                  <span>एक्शन: <strong className="text-red-700">{item.actionType || 'none'}</strong></span>
                </div>
              </div>
            </div>

            <div className="shrink-0">
              <button
                onClick={() => {
                  if (confirm('क्या आप वाकई इस नोटिफिकेशन को हटाना चाहते हैं?')) {
                    deleteNotification(item.id);
                  }
                }}
                className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-red-100 text-stone-600 hover:text-red-700 flex items-center justify-center transition-colors cursor-pointer"
                title="हटाएं"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Send Notification Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-black text-stone-900 text-base flex items-center gap-2">
                <Bell className="w-5 h-5 text-red-600" />
                छात्रों को नोटिफिकेशन भेजें (Broadcast)
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-stone-600 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSendNotification} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-700">नोटिफिकेशन शीर्षक (Title)</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="उदा: 🔴 10वीं विज्ञान लाइव क्लास शुरू हो गई है!"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-700">संदेश / विवरण (Message Description)</label>
                <textarea
                  required
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="उदा: सभी छात्र तुरंत लाइव क्लास ज्वाइन करें और अपने डाउट्स पूछें।"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-700">समय लेबल (Time Label)</label>
                  <input
                    type="text"
                    value={timeLabel}
                    onChange={(e) => setTimeLabel(e.target.value)}
                    placeholder="उदा: अभी-अभी"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 focus:outline-none focus:border-red-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-700">बटन एक्शन (Action Type)</label>
                  <select
                    value={actionType}
                    onChange={(e: any) => setActionType(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 focus:outline-none focus:border-red-500"
                  >
                    <option value="vip">VIP ऑफर (Vip Modal)</option>
                    <option value="live">लाइव क्लास (Live Classes)</option>
                    <option value="courses">कोर्स / नोट्स (Courses)</option>
                    <option value="none">कोई नहीं (None)</option>
                  </select>
                </div>
              </div>

              {errorMsg && (
                <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-xs rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {successMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs rounded-xl flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-red-700 hover:bg-red-800 text-white font-black py-3 rounded-xl transition-all shadow-md text-xs cursor-pointer mt-2 flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" /> तुरंत ब्रॉडकास्ट करें (Send Notification)
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
