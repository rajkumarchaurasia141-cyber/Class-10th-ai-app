import React, { useState } from 'react';
import { db } from '../lib/firebase';
import { doc, setDoc, collection } from 'firebase/firestore';
import { ShieldCheck, UserPlus, CheckCircle, ArrowLeft, UploadCloud, Database } from 'lucide-react';
import { useData } from '../context/DataContext';

export function AdminPanel({ onBack }: any) {
  const { refreshData } = useData();
  const [activeTab, setActiveTab] = useState<'vip' | 'content'>('vip');
  
  // VIP State
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Content State
  const [cMsg, setCMsg] = useState('');
  const [cLoading, setCLoading] = useState(false);
  const [formData, setFormData] = useState({
    subjectId: 'sanskrit',
    subjectName: 'Sanskrit',
    subjectNameHindi: 'संस्कृत',
    chapterNo: '',
    chapterNameHindi: '',
    notesHindi: '',
    mcqJson: '[]',
    qnaJson: '[]'
  });

  const handleAddVIP = async (e: any) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      await setDoc(doc(db, 'vip_users', email.trim().toLowerCase()), {
        isVip: true,
        addedAt: new Date().toISOString()
      });
      setMsg(`${email} को VIP अनलॉक कर दिया गया है!`);
      setEmail('');
    } catch (e) {
      setMsg('VIP जोड़ने में त्रुटि हुई।');
    }
    setLoading(false);
  };

  const handleUploadContent = async (e: any) => {
    e.preventDefault();
    setCLoading(true);
    setCMsg('');
    try {
      const subId = formData.subjectId.trim().toLowerCase();
      // Ensure subject document exists
      await setDoc(doc(db, 'subjects', subId), {
        subject_name: formData.subjectName,
        subject_name_hindi: formData.subjectNameHindi
      }, { merge: true });

      let mcq = [];
      let qna = [];
      try { mcq = JSON.parse(formData.mcqJson); } catch(e) {}
      try { qna = JSON.parse(formData.qnaJson); } catch(e) {}

      const chNo = Number(formData.chapterNo);
      const chapterRef = doc(db, 'subjects', subId, 'chapters', `ch${chNo}`);
      
      await setDoc(chapterRef, {
        chapter_no: chNo,
        chapter_name_hindi: formData.chapterNameHindi,
        notes_hindi: formData.notesHindi,
        mcq: mcq,
        subjective_qa: qna
      }, { merge: true });

      setCMsg(`अध्याय ${chNo} सफलतापूर्वक अपलोड हो गया!`);
      setFormData(prev => ({ ...prev, chapterNo: '', chapterNameHindi: '', notesHindi: '', mcqJson: '[]', qnaJson: '[]' }));
      refreshData();
    } catch (e: any) {
      setCMsg('अपलोड में त्रुटि: ' + e.message);
    }
    setCLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 mt-8">
      <button onClick={onBack} className="text-amber-500 mb-6 flex items-center gap-2 font-medium hover:text-amber-400 transition-colors">
        <ArrowLeft className="w-4 h-4" /> मुख्य पेज पर वापस जाएँ
      </button>

      <div className="bg-stone-900 border border-amber-900/30 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl"></div>
        
        <div className="flex items-center gap-4 mb-8 relative z-10">
          <div className="p-4 bg-amber-500/10 rounded-2xl">
            <ShieldCheck className="w-8 h-8 text-amber-500" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white">एडमिन पैनल</h2>
            <p className="text-stone-400 mt-1">ऐप का पूरा नियंत्रण (VIP & Content)</p>
          </div>
        </div>

        <div className="flex border-b border-stone-800 mb-8 relative z-10">
          <button 
            onClick={() => setActiveTab('vip')} 
            className={`pb-4 px-4 font-bold flex items-center gap-2 transition-colors ${activeTab === 'vip' ? 'border-b-2 border-amber-500 text-amber-500' : 'text-stone-400 hover:text-stone-300'}`}
          >
            <UserPlus className="w-4 h-4" /> VIP एक्सेस
          </button>
          <button 
            onClick={() => setActiveTab('content')} 
            className={`pb-4 px-4 font-bold flex items-center gap-2 transition-colors ${activeTab === 'content' ? 'border-b-2 border-amber-500 text-amber-500' : 'text-stone-400 hover:text-stone-300'}`}
          >
            <UploadCloud className="w-4 h-4" /> कंटेंट अपलोड
          </button>
        </div>

        {activeTab === 'vip' && (
          <form onSubmit={handleAddVIP} className="space-y-6 relative z-10 max-w-xl">
            <div>
              <label className="block text-sm font-medium text-stone-300 mb-2">छात्र का Gmail Address डालें:</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="student@gmail.com"
                className="w-full bg-stone-950 border border-stone-800 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-amber-500 transition-colors"
                required
              />
            </div>
            <button 
              type="submit" 
              disabled={loading || !email}
              className="w-full bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-bold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors"
            >
              {loading ? 'प्रक्रिया चल रही है...' : <><UserPlus className="w-5 h-5" /> अनलॉक करें (VIP बनाएँ)</>}
            </button>
            {msg && (
              <div className="mt-4 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-start gap-3">
                <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <p className="font-medium">{msg}</p>
              </div>
            )}
          </form>
        )}

        {activeTab === 'content' && (
          <form onSubmit={handleUploadContent} className="space-y-6 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-stone-300 mb-2">Subject ID (e.g. sanskrit)</label>
                <input type="text" value={formData.subjectId} onChange={e => setFormData({...formData, subjectId: e.target.value})} className="w-full bg-stone-950 border border-stone-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-300 mb-2">Subject Name (Eng)</label>
                <input type="text" value={formData.subjectName} onChange={e => setFormData({...formData, subjectName: e.target.value})} className="w-full bg-stone-950 border border-stone-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-300 mb-2">Subject Name (Hindi)</label>
                <input type="text" value={formData.subjectNameHindi} onChange={e => setFormData({...formData, subjectNameHindi: e.target.value})} className="w-full bg-stone-950 border border-stone-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500" required />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-stone-300 mb-2">Chapter Number</label>
                <input type="number" value={formData.chapterNo} onChange={e => setFormData({...formData, chapterNo: e.target.value})} className="w-full bg-stone-950 border border-stone-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-300 mb-2">Chapter Name (Hindi)</label>
                <input type="text" value={formData.chapterNameHindi} onChange={e => setFormData({...formData, chapterNameHindi: e.target.value})} className="w-full bg-stone-950 border border-stone-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500" required />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-300 mb-2">Notes (Hindi) - Type or Paste notes</label>
              <textarea value={formData.notesHindi} onChange={e => setFormData({...formData, notesHindi: e.target.value})} rows={6} className="w-full bg-stone-950 border border-stone-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-stone-300 mb-2">MCQ JSON format</label>
                <textarea value={formData.mcqJson} onChange={e => setFormData({...formData, mcqJson: e.target.value})} rows={6} className="w-full bg-stone-950 border border-stone-800 rounded-xl px-4 py-3 text-emerald-400 font-mono text-sm focus:outline-none focus:border-amber-500" placeholder='[{"question":"...","options":["A","B"],"correct_answer":0,"explanation":"..."}]' />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-300 mb-2">Q&A JSON format</label>
                <textarea value={formData.qnaJson} onChange={e => setFormData({...formData, qnaJson: e.target.value})} rows={6} className="w-full bg-stone-950 border border-stone-800 rounded-xl px-4 py-3 text-emerald-400 font-mono text-sm focus:outline-none focus:border-amber-500" placeholder='[{"question":"...","answer":"..."}]' />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={cLoading || !formData.chapterNo}
              className="w-full bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-bold py-4 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors"
            >
              {cLoading ? 'अपलोड हो रहा है...' : <><Database className="w-5 h-5" /> डेटाबेस में सेव करें</>}
            </button>
            {cMsg && (
              <div className="mt-4 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-start gap-3">
                <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <p className="font-medium">{cMsg}</p>
              </div>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
