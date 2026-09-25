import React, { useState } from 'react';
import { 
  Video, 
  Plus, 
  Trash2, 
  Youtube, 
  CheckCircle, 
  AlertCircle, 
  Radio, 
  Calendar, 
  User, 
  BookOpen,
  PlaySquare,
  Lock,
  Unlock,
  Crown,
  Gift
} from 'lucide-react';
import { useData } from '../context/DataContext';

export function AdminLiveClassesManager() {
  const { liveClasses, addLiveClass, updateLiveClass, deleteLiveClass } = useData();

  const [title, setTitle] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [subjectName, setSubjectName] = useState('संस्कृत');
  const [teacherName, setTeacherName] = useState('राज सर');
  const [scheduledAt, setScheduledAt] = useState('आज शाम 6:00 बजे');
  const [isLive, setIsLive] = useState(true);
  const [isVip, setIsVip] = useState(true);
  const [description, setDescription] = useState('');

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleAddLive = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !youtubeUrl.trim()) {
      setErrorMsg('कृपया शीर्षक और YouTube लिंक दर्ज करें।');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      await addLiveClass({
        title: title.trim(),
        youtubeUrl: youtubeUrl.trim(),
        subjectName,
        teacherName: teacherName.trim() || 'राज सर',
        scheduledAt: scheduledAt.trim() || 'आज',
        isLive,
        isVip,
        description: description.trim()
      });

      setSuccessMsg('लाइव/रिकॉर्डेड क्लास सफलतापूर्वक जोड़ दी गई है! छात्रों के ऐप में तुरंत दिखने लगी है।');
      setTitle('');
      setYoutubeUrl('');
      setDescription('');
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err: any) {
      setErrorMsg('क्लास जोड़ने में त्रुटि: ' + (err?.message || String(err)));
    } finally {
      setLoading(false);
    }
  };

  const handleToggleVip = async (id: string, currentIsVip: boolean) => {
    try {
      await updateLiveClass(id, { isVip: !currentIsVip });
      setSuccessMsg(`क्लास का स्टेटस सफलतापूर्वक बदलकर "${!currentIsVip ? 'VIP लॉक्ड' : 'फ्री डेमो'}" कर दिया गया है।`);
      setTimeout(() => setSuccessMsg(''), 3500);
    } catch (err: any) {
      setErrorMsg('स्टेटस बदलने में त्रुटि: ' + (err?.message || String(err)));
    }
  };

  const handleDelete = async (id: string, classTitle: string) => {
    if (window.confirm(`क्या आप वाकई "${classTitle}" लाइव क्लास को हटाना चाहते हैं?`)) {
      await deleteLiveClass(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-stone-950 p-6 rounded-3xl border border-stone-800 text-white space-y-2">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-red-600/20 text-red-500 border border-red-500/30 flex items-center justify-center font-bold">
            <Radio className="w-5 h-5 animate-pulse text-red-500" />
          </div>
          <div>
            <h3 className="text-lg font-black text-white">YouTube लाइव & रिकॉर्डेड क्लास मैनेजर</h3>
            <p className="text-xs text-stone-400">
              यहाँ YouTube क्लास का लिंक पेस्ट करें। यह तुरंत छात्रों के लाइव सेक्शन में दिखने लगेगा।
            </p>
          </div>
        </div>
      </div>

      {/* Form Card */}
      <form onSubmit={handleAddLive} className="bg-stone-950 p-6 rounded-3xl border border-stone-800 space-y-4">
        <h4 className="text-sm font-bold text-amber-400 flex items-center gap-2">
          <Plus className="w-4 h-4" /> नई लाइव / रिकॉर्डेड क्लास जोड़ें
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-300">क्लास का शीर्षक (Title)</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="उदा: संस्कृत - मङ्गलम् महामौरथन क्लास"
              className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-red-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-300">YouTube वीडियो / लाइव लिंक (URL)</label>
            <input
              type="text"
              required
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              placeholder="उदा: https://www.youtube.com/watch?v=..."
              className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-red-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-300">विषय (Subject)</label>
            <select
              value={subjectName}
              onChange={(e) => setSubjectName(e.target.value)}
              className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-red-500"
            >
              <option value="संस्कृत">संस्कृत (Sanskrit)</option>
              <option value="विज्ञान">विज्ञान (Science)</option>
              <option value="गणित">गणित (Math)</option>
              <option value="हिन्दी">हिन्दी (Hindi)</option>
              <option value="सामाजिक विज्ञान">सामाजिक विज्ञान (Social Science)</option>
              <option value="अंग्रेजी">अंग्रेजी (English)</option>
              <option value="सामान्य">सामान्य (General / Topper Tips)</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-300">शिक्षक का नाम (Teacher)</label>
            <input
              type="text"
              value={teacherName}
              onChange={(e) => setTeacherName(e.target.value)}
              placeholder="उदा: राज सर"
              className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-red-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-300">समय / शेड्यूल (Time)</label>
            <input
              type="text"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              placeholder="उदा: आज शाम 6:00 बजे"
              className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-red-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-300">स्थिति (Status)</label>
            <select
              value={isLive ? 'true' : 'false'}
              onChange={(e) => setIsLive(e.target.value === 'true')}
              className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-red-500"
            >
              <option value="true">🔴 लाइव क्लास (Live Now)</option>
              <option value="false">📼 रिकॉर्डेड क्लास (Recorded)</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5" /> एक्सेस नियंत्रण (VIP Lock Security)
            </label>
            <select
              value={isVip ? 'true' : 'false'}
              onChange={(e) => setIsVip(e.target.value === 'true')}
              className="w-full bg-stone-900 border border-amber-600/40 rounded-xl px-3.5 py-2.5 text-xs text-amber-300 font-bold focus:outline-none focus:border-amber-500"
            >
              <option value="true">🔒 VIP केवल (केवल पेड छात्रों के लिए लॉक रखें - अनुशंसित)</option>
              <option value="false">🎁 फ्री डेमो (सभी छात्रों के लिए खुला)</option>
            </select>
          </div>
        </div>

        <div className="space-y-1.5 pt-1">
          <label className="text-xs font-bold text-stone-300">विवरण (Description - वैकल्पिक)</label>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="क्लास के बारे में संक्षेप में लिखें..."
            className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-red-500"
          />
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-xl flex items-center gap-2">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-red-600 hover:bg-red-500 text-white font-black py-3 rounded-xl transition-all shadow-lg shadow-red-900/30 flex items-center justify-center gap-2 text-xs cursor-pointer disabled:opacity-50"
        >
          {loading ? (
            'जोड़ा जा रहा है...'
          ) : (
            <>
              <Youtube className="w-4 h-4" />
              <span>लाइव क्लास प्रकाशित करें (Publish Live Class)</span>
            </>
          )}
        </button>
      </form>

      {/* Existing Classes List */}
      <div className="bg-stone-950 p-6 rounded-3xl border border-stone-800 space-y-4">
        <h4 className="text-sm font-bold text-white flex items-center justify-between">
          <span className="flex items-center gap-2">
            <PlaySquare className="w-4 h-4 text-red-500" /> प्रकाशित लाइव व रिकॉर्डेड क्लासेस ({liveClasses.length})
          </span>
        </h4>

        <div className="space-y-3">
          {liveClasses.length === 0 ? (
            <div className="text-center py-8 text-stone-500 text-xs">
              कोई लाइव क्लास नहीं है। ऊपर दिए गए फॉर्म से नई क्लास जोड़ें।
            </div>
          ) : (
            liveClasses.map((cls) => (
              <div
                key={cls.id}
                className="bg-stone-900 border border-stone-800 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
              >
                <div className="space-y-1 overflow-hidden">
                  <div className="flex items-center gap-2 flex-wrap">
                    {cls.isLive ? (
                      <span className="bg-red-500/20 text-red-400 border border-red-500/30 text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" /> LIVE
                      </span>
                    ) : (
                      <span className="bg-stone-800 text-stone-300 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        RECORDED
                      </span>
                    )}
                    <span className="bg-stone-800 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {cls.subjectName}
                    </span>
                    <span className="text-[11px] text-stone-400 flex items-center gap-1">
                      <User className="w-3 h-3" /> {cls.teacherName}
                    </span>
                    <span className="text-[11px] text-stone-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> {cls.scheduledAt}
                    </span>
                  </div>

                  <h5 className="font-extrabold text-white text-sm">
                    {cls.title}
                  </h5>

                  {cls.description && (
                    <p className="text-xs text-stone-400 line-clamp-1">
                      {cls.description}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  <a
                    href={cls.youtubeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-red-600/20 hover:bg-red-600/30 text-red-400 text-xs font-bold px-3 py-1.5 rounded-xl border border-red-500/30 flex items-center gap-1.5 transition-colors"
                  >
                    <Youtube className="w-3.5 h-3.5" /> लिंक देखें
                  </a>

                  <button
                    onClick={() => handleDelete(cls.id, cls.title)}
                    className="bg-stone-800 hover:bg-red-950 text-stone-400 hover:text-red-400 p-2 rounded-xl transition-colors cursor-pointer"
                    title="क्लास हटाएं"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
