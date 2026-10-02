import React, { useState, useEffect } from 'react';
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
  Gift,
  Clock,
  Sparkles,
  Zap,
  Languages,
  Globe,
  Users,
  Eye
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { LiveClass, LiveWatchRecord } from '../types';
import { ClassAttendanceModal } from './ClassAttendanceModal';
import { subscribeClassAttendance, DEFAULT_BATCH_STUDENTS } from '../services/attendanceTracker';

export function AdminLiveClassesManager() {
  const { liveClasses, addLiveClass, updateLiveClass, deleteLiveClass } = useData();

  const [title, setTitle] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [subjectName, setSubjectName] = useState('संस्कृत');
  const [teacherName, setTeacherName] = useState('राज सर');
  const [publishType, setPublishType] = useState<'instant' | 'scheduled'>('instant');
  const [scheduledDate, setScheduledDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [scheduledTime, setScheduledTime] = useState('19:00');
  const [scheduledAt, setScheduledAt] = useState('आज शाम 7:00 बजे');
  const [isLive, setIsLive] = useState(true);
  const [isVip, setIsVip] = useState(true);
  const [description, setDescription] = useState('');

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Attendance Modal state for this class
  const [attendanceModalClass, setAttendanceModalClass] = useState<LiveClass | null>(null);
  const [activeRecords, setActiveRecords] = useState<LiveWatchRecord[]>([]);

  useEffect(() => {
    if (!attendanceModalClass) {
      setActiveRecords([]);
      return;
    }
    const unsub = subscribeClassAttendance(attendanceModalClass.id, (records) => {
      setActiveRecords(records);
    });
    return () => unsub();
  }, [attendanceModalClass]);

  // Auto-generate human readable scheduledAt label when date/time changes
  const handleScheduleChange = (dateVal: string, timeVal: string) => {
    setScheduledDate(dateVal);
    setScheduledTime(timeVal);
    try {
      const today = new Date().toISOString().split('T')[0];
      const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
      
      const [hStr, mStr] = timeVal.split(':');
      let h = parseInt(hStr, 10);
      const m = mStr || '00';
      const ampm = h >= 12 ? 'शाम' : 'सुबह';
      if (h > 12) h -= 12;
      if (h === 0) h = 12;

      let prefix = '';
      if (dateVal === today) prefix = 'आज';
      else if (dateVal === tomorrow) prefix = 'कल';
      else prefix = dateVal;

      setScheduledAt(`${prefix} ${ampm} ${h}:${m} बजे`);
    } catch {
      setScheduledAt(`${dateVal} ${timeVal}`);
    }
  };

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
      let finalScheduledDateTime = new Date().toISOString();
      if (publishType === 'scheduled') {
        const parsedDt = new Date(`${scheduledDate}T${scheduledTime}:00`);
        if (!isNaN(parsedDt.getTime())) {
          finalScheduledDateTime = parsedDt.toISOString();
        }
      }

      await addLiveClass({
        title: title.trim(),
        youtubeUrl: youtubeUrl.trim(),
        subjectName,
        teacherName: teacherName.trim() || 'राज सर',
        scheduledAt: scheduledAt.trim() || (publishType === 'instant' ? 'अभी लाइव' : 'शेड्यूल्ड'),
        isLive: publishType === 'instant' ? isLive : false,
        isVip,
        description: description.trim(),
        publishType,
        scheduledDateTime: finalScheduledDateTime,
        isUploaded: true
      });

      if (publishType === 'instant') {
        setSuccessMsg('क्लास तुरंत लाइव/पब्लिक हो गई है और सभी छात्रों के ऐप में चालू हो गई है!');
      } else {
        setSuccessMsg(`क्लास सफलतापूर्वक शेड्यूल कर दी गई है! यह अभी छात्रों के ऐप में "⏳ अपलोडिंग / शेड्यूल्ड" दिखेगी और ${scheduledAt} पर अपने आप चलने लगेगी।`);
      }
      setTitle('');
      setYoutubeUrl('');
      setDescription('');
      setTimeout(() => setSuccessMsg(''), 6000);
    } catch (err: any) {
      setErrorMsg('क्लास जोड़ने में त्रुटि: ' + (err?.message || String(err)));
    } finally {
      setLoading(false);
    }
  };

  const handleGoLiveNow = async (id: string, classTitle: string) => {
    try {
      await updateLiveClass(id, {
        publishType: 'instant',
        isLive: true,
        scheduledDateTime: new Date().toISOString(),
        scheduledAt: 'अभी लाइव'
      });
      setSuccessMsg(`"${classTitle}" को तुरंत लाइव/पब्लिक कर दिया गया है!`);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      setErrorMsg('लाइव करने में त्रुटि: ' + (err?.message || String(err)));
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

        {/* Publishing Mode Selection: Instant vs Scheduled */}
        <div className="p-4 bg-stone-900 border border-stone-800 rounded-2xl space-y-2">
          <label className="text-xs font-black text-amber-400 flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-amber-400" />
            <span>प्रकाशन का प्रकार (Publishing Mode) चुनें:</span>
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => setPublishType('instant')}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-2.5 ${
                publishType === 'instant'
                  ? 'bg-red-600/20 border-red-500 text-white shadow-sm ring-1 ring-red-500'
                  : 'bg-stone-950 border-stone-800 text-stone-400 hover:text-stone-200'
              }`}
            >
              <div className="w-3 h-3 rounded-full bg-red-500 shrink-0 mt-0.5 animate-pulse" />
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-1">
                  <span>🟢 तुरंत लाइव / पब्लिक (Instant)</span>
                </div>
                <p className="text-[11px] text-stone-400 mt-0.5">
                  यह क्लास तुरंत सभी बच्चों के ऐप में लाइव चलने लगेगी।
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setPublishType('scheduled')}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-2.5 ${
                publishType === 'scheduled'
                  ? 'bg-amber-500/20 border-amber-500 text-white shadow-sm ring-1 ring-amber-500'
                  : 'bg-stone-950 border-stone-800 text-stone-400 hover:text-stone-200'
              }`}
            >
              <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-1">
                  <span>⏰ समय पर शेड्यूल करें (Schedule)</span>
                </div>
                <p className="text-[11px] text-stone-400 mt-0.5">
                  तब तक "अपलोडिंग/शेड्यूल" दिखेगा, और तय समय पर अपने आप चलने लगेगा।
                </p>
              </div>
            </button>
          </div>

          {/* Date & Time Picker when Scheduled is selected */}
          {publishType === 'scheduled' && (
            <div className="pt-3 border-t border-stone-800 grid grid-cols-1 sm:grid-cols-2 gap-3 animate-in fade-in duration-200">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-stone-300 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-amber-400" />
                  <span>शेड्यूल तारीख (Date)</span>
                </label>
                <input
                  type="date"
                  value={scheduledDate}
                  onChange={(e) => handleScheduleChange(e.target.value, scheduledTime)}
                  className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-stone-300 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>शेड्यूल समय (Time)</span>
                </label>
                <input
                  type="time"
                  value={scheduledTime}
                  onChange={(e) => handleScheduleChange(scheduledDate, e.target.value)}
                  className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="sm:col-span-2 bg-amber-500/10 border border-amber-500/30 rounded-xl p-2.5 text-xs text-amber-300 flex items-center justify-between">
                <span>🔔 ऐप में दिखने वाला समय: <b>{scheduledAt}</b></span>
                <span className="text-[10px] bg-amber-500/20 px-2 py-0.5 rounded font-black text-amber-400">
                  ऑटो-स्टार्ट सक्षम
                </span>
              </div>
            </div>
          )}
        </div>

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
                    {cls.publishType === 'scheduled' && cls.scheduledDateTime && new Date(cls.scheduledDateTime).getTime() > Date.now() ? (
                      <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1 animate-pulse">
                        <Clock className="w-3 h-3 text-amber-400" /> ⏳ शेड्यूल्ड (तय समय पर चालू होगा)
                      </span>
                    ) : cls.isLive ? (
                      <span className="bg-red-500/20 text-red-400 border border-red-500/30 text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" /> LIVE
                      </span>
                    ) : (
                      <span className="bg-stone-800 text-stone-300 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        RECORDED
                      </span>
                    )}
                    {cls.isVip ? (
                      <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Lock className="w-2.5 h-2.5" /> केवल पेड छात्र (VIP)
                      </span>
                    ) : (
                      <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Gift className="w-2.5 h-2.5" /> फ्री डेमो (सभी बच्चे)
                      </span>
                    )}
                    <span className="bg-stone-800 text-stone-300 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {cls.subjectName}
                    </span>
                    <span className="bg-stone-850 text-stone-300 border border-stone-700 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                      {cls.language === 'english' ? '🇬🇧 English' : '🇮🇳 हिंदी'}
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

                <div className="flex items-center gap-2 self-end sm:self-center shrink-0 flex-wrap">
                  {/* If scheduled for future: show Go Live Now button */}
                  {cls.publishType === 'scheduled' && cls.scheduledDateTime && new Date(cls.scheduledDateTime).getTime() > Date.now() && (
                    <button
                      type="button"
                      onClick={() => handleGoLiveNow(cls.id, cls.title)}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-xl border border-emerald-500 flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm active:scale-95"
                      title="तय समय से पहले अभी तुरंत लाइव करें"
                    >
                      <Zap className="w-3.5 h-3.5 fill-white" />
                      <span>अभी लाइव करें</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleToggleVip(cls.id, !!cls.isVip)}
                    className={`text-xs font-bold px-3 py-1.5 rounded-xl border flex items-center gap-1.5 transition-colors cursor-pointer ${
                      cls.isVip
                        ? 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border-amber-500/40'
                        : 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border-emerald-500/40'
                    }`}
                    title="क्लिक करके स्थिति बदलें (VIP या फ्री)"
                  >
                    {cls.isVip ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                    <span>{cls.isVip ? 'VIP लॉक है' : 'फ्री डेमो है'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAttendanceModalClass(cls)}
                    className="bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 text-xs font-bold px-3 py-1.5 rounded-xl border border-emerald-500/40 flex items-center gap-1.5 transition-colors cursor-pointer"
                    title="इस क्लास में जुड़े छात्र और वॉच-टाइम देखें"
                  >
                    <Users className="w-3.5 h-3.5 text-emerald-400" />
                    <span>अटेंडेंस देखें</span>
                  </button>

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

      {/* Class Attendance Modal */}
      {attendanceModalClass && (
        <ClassAttendanceModal
          isOpen={!!attendanceModalClass}
          onClose={() => setAttendanceModalClass(null)}
          classTitle={attendanceModalClass.title}
          isLive={attendanceModalClass.isLive}
          activeRecords={activeRecords}
          allBatchStudents={DEFAULT_BATCH_STUDENTS}
          isAdmin={true}
        />
      )}
    </div>
  );
}
