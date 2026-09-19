import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, onSnapshot, doc } from 'firebase/firestore';
import { safeSetDoc, safeDeleteDoc, isQuotaError } from '../utils/firestoreSafe';
import { 
  Users, 
  Search, 
  Crown, 
  Mail, 
  Calendar, 
  ShieldCheck, 
  UserCheck, 
  Copy, 
  Check, 
  Sparkles,
  AlertCircle,
  Hourglass,
  Clock,
  Plus,
  RefreshCw,
  X
} from 'lucide-react';
import { calculateVipExpiry, checkVipExpiryStatus } from '../utils/vipHelper';

interface StudentRecord {
  id: string;
  name: string;
  email: string;
  lastLogin?: string;
  createdAt?: string;
}

interface VipRecord {
  email: string;
  isVip: boolean;
  plan?: string;
  planDuration?: string;
  planPrice?: number;
  validFrom?: string;
  expiresAt?: string;
  addedAt?: string;
}

export function AdminStudentsList() {
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [vips, setVips] = useState<Record<string, VipRecord>>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);
  const [filterVip, setFilterVip] = useState<'all' | 'active_vip' | 'expired_vip' | 'free'>('all');
  const [processingEmail, setProcessingEmail] = useState<string | null>(null);
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  // Modal for granting / extending VIP
  const [selectedStudentForVip, setSelectedStudentForVip] = useState<StudentRecord | null>(null);
  const [selectedPlanToGrant, setSelectedPlanToGrant] = useState<'1month' | '1year'>('1month');

  useEffect(() => {
    // 1. Listen to students collection
    const unsubStudents = onSnapshot(collection(db, 'students'), (snap) => {
      const list: StudentRecord[] = [];
      snap.forEach(docSnap => {
        list.push({ id: docSnap.id, ...docSnap.data() } as StudentRecord);
      });
      list.sort((a, b) => {
        const tA = new Date(a.lastLogin || a.createdAt || 0).getTime();
        const tB = new Date(b.lastLogin || b.createdAt || 0).getTime();
        return tB - tA;
      });
      setStudents(list);
      setLoading(false);
    }, (err) => {
      console.warn('Students fetch notice:', err?.message || String(err));
      setLoading(false);
    });

    // 2. Listen to vip_users collection
    const unsubVips = onSnapshot(collection(db, 'vip_users'), (snap) => {
      const map: Record<string, VipRecord> = {};
      snap.forEach(docSnap => {
        map[docSnap.id.toLowerCase()] = { email: docSnap.id, ...docSnap.data() } as VipRecord;
      });
      setVips(map);
    }, (err) => {
      console.warn('Vip users fetch notice:', err?.message || String(err));
    });

    return () => {
      unsubStudents();
      unsubVips();
    };
  }, []);

  const handleCopy = (email: string) => {
    navigator.clipboard?.writeText(email);
    setCopiedEmail(email);
    setTimeout(() => setCopiedEmail(null), 2000);
  };

  // Grant or Renew VIP with specified plan
  const handleGrantVip = async (student: StudentRecord, plan: '1month' | '1year') => {
    const cleanEmail = student.email.trim().toLowerCase();
    setProcessingEmail(cleanEmail);
    setActionMsg(null);

    try {
      const existingVip = vips[cleanEmail];
      const expiry = calculateVipExpiry(plan, existingVip?.expiresAt);

      const ok = await safeSetDoc(doc(db, 'vip_users', cleanEmail), {
        isVip: true,
        plan,
        planDuration: expiry.planDurationText,
        planPrice: plan === '1month' ? 99 : 600,
        studentName: student.name,
        validFrom: expiry.validFrom,
        expiresAt: expiry.expiresAt,
        addedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }, { merge: true });

      const expiryDateFormatted = new Date(expiry.expiresAt).toLocaleDateString('hi-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });

      if (ok) {
        setActionMsg(`छात्र ${student.name} (${cleanEmail}) का ${expiry.planDurationText} VIP प्लान सक्रिय हो गया (वैधता: ${expiryDateFormatted} तक)।`);
      } else {
        setActionMsg(`सूचना: आज की दैनिक राइट लिमिट पूरी होने के कारण यह बदलाव कल क्लाउड पर सिंक होगा।`);
      }
      setSelectedStudentForVip(null);
    } catch (err: any) {
      if (isQuotaError(err)) {
        setActionMsg('सूचना: आज की Firestore दैनिक राइट लिमिट पूरी हो चुकी है।');
      } else {
        alert('त्रुटि: ' + err?.message);
      }
    } finally {
      setProcessingEmail(null);
    }
  };

  // Revoke VIP
  const handleRevokeVip = async (student: StudentRecord) => {
    const cleanEmail = student.email.trim().toLowerCase();
    if (!confirm(`क्या आप ${student.name} (${cleanEmail}) का VIP एक्सेस रद्द करना चाहते हैं?`)) {
      return;
    }

    setProcessingEmail(cleanEmail);
    try {
      await safeDeleteDoc(doc(db, 'vip_users', cleanEmail));
      setActionMsg(`छात्र ${student.name} का VIP एक्सेस हटा दिया गया।`);
    } catch (err: any) {
      if (isQuotaError(err)) {
        setActionMsg('सूचना: आज की Firestore दैनिक लिमिट पूरी हो चुकी है।');
      } else {
        alert('त्रुटि: ' + err?.message);
      }
    } finally {
      setProcessingEmail(null);
    }
  };

  // Categorize students
  const studentStatuses = students.map(s => {
    const cleanEmail = s.email?.toLowerCase();
    const vip = vips[cleanEmail];
    if (!vip || !vip.isVip) {
      return { ...s, isVipActive: false, isVipExpired: false, vipInfo: null };
    }
    const expiry = checkVipExpiryStatus(vip.expiresAt);
    return {
      ...s,
      isVipActive: !expiry.isExpired,
      isVipExpired: expiry.isExpired,
      vipInfo: {
        ...vip,
        daysRemaining: expiry.daysRemaining,
        formattedExpiry: expiry.formattedExpiry,
        isExpired: expiry.isExpired
      }
    };
  });

  const activeVipCount = studentStatuses.filter(s => s.isVipActive).length;
  const expiredVipCount = studentStatuses.filter(s => s.isVipExpired).length;
  const freeCount = studentStatuses.filter(s => !s.isVipActive && !s.isVipExpired).length;

  const filteredStudents = studentStatuses.filter(s => {
    if (filterVip === 'active_vip' && !s.isVipActive) return false;
    if (filterVip === 'expired_vip' && !s.isVipExpired) return false;
    if (filterVip === 'free' && (s.isVipActive || s.isVipExpired)) return false;

    if (search.trim()) {
      const q = search.toLowerCase();
      return s.name?.toLowerCase().includes(q) || s.email?.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-6 relative z-10">
      {/* Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-stone-950 p-4 rounded-2xl border border-stone-800">
          <div className="text-xs font-bold text-stone-400 flex items-center gap-1.5 mb-1">
            <Users className="w-3.5 h-3.5 text-amber-500" />
            कुल पंजीकृत छात्र
          </div>
          <div className="text-2xl font-black text-white">{students.length}</div>
        </div>

        <div className="bg-emerald-950/30 p-4 rounded-2xl border border-emerald-500/30">
          <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 mb-1">
            <Crown className="w-3.5 h-3.5 text-emerald-400" />
            सक्रिय VIP छात्र
          </div>
          <div className="text-2xl font-black text-emerald-400">{activeVipCount}</div>
        </div>

        <div className="bg-amber-950/30 p-4 rounded-2xl border border-amber-500/30">
          <div className="text-xs font-bold text-amber-400 flex items-center gap-1.5 mb-1">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            समाप्त VIP (Expired)
          </div>
          <div className="text-2xl font-black text-amber-400">{expiredVipCount}</div>
        </div>

        <div className="bg-stone-950 p-4 rounded-2xl border border-stone-800">
          <div className="text-xs font-bold text-stone-400 flex items-center gap-1.5 mb-1">
            <UserCheck className="w-3.5 h-3.5 text-stone-400" />
            फ्री छात्र
          </div>
          <div className="text-2xl font-black text-stone-300">{freeCount}</div>
        </div>
      </div>

      {actionMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 flex items-center justify-between gap-3 text-sm animate-fade-in">
          <div className="flex items-center gap-2 font-medium">
            <Check className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{actionMsg}</span>
          </div>
          <button onClick={() => setActionMsg(null)} className="text-stone-400 hover:text-white cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center">
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setFilterVip('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              filterVip === 'all' ? 'bg-amber-500 text-stone-950' : 'bg-stone-900 text-stone-400 hover:text-white border border-stone-800'
            }`}
          >
            सभी ({students.length})
          </button>
          <button
            onClick={() => setFilterVip('active_vip')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 whitespace-nowrap ${
              filterVip === 'active_vip' ? 'bg-emerald-500 text-stone-950' : 'bg-stone-900 text-emerald-400 hover:text-white border border-stone-800'
            }`}
          >
            <Crown className="w-3 h-3" /> सक्रिय VIP ({activeVipCount})
          </button>
          <button
            onClick={() => setFilterVip('expired_vip')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 whitespace-nowrap ${
              filterVip === 'expired_vip' ? 'bg-amber-500 text-stone-950' : 'bg-stone-900 text-amber-400 hover:text-white border border-stone-800'
            }`}
          >
            <Clock className="w-3 h-3" /> समाप्त VIP ({expiredVipCount})
          </button>
          <button
            onClick={() => setFilterVip('free')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              filterVip === 'free' ? 'bg-stone-700 text-white' : 'bg-stone-900 text-stone-400 hover:text-white border border-stone-800'
            }`}
          >
            फ्री ({freeCount})
          </button>
        </div>

        <div className="relative min-w-[220px]">
          <Search className="w-3.5 h-3.5 text-stone-500 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="छात्र का नाम या जीमेल खोजें..."
            className="w-full bg-stone-950 border border-stone-800 rounded-xl pl-8 pr-3 py-2 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-amber-500"
          />
        </div>
      </div>

      {/* Students List */}
      {loading ? (
        <div className="p-12 text-center text-stone-400 text-sm">
          छात्रों का विवरण लोड हो रहा है...
        </div>
      ) : filteredStudents.length === 0 ? (
        <div className="bg-stone-950 p-12 rounded-2xl border border-stone-800 text-center space-y-2">
          <Users className="w-10 h-10 text-stone-600 mx-auto" />
          <h4 className="text-white font-bold text-sm">कोई छात्र नहीं मिला</h4>
          <p className="text-stone-500 text-xs">
            दिए गए फ़िल्टर के अनुसार कोई छात्र रिकॉर्ड उपलब्ध नहीं है।
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredStudents.map((s) => {
            const cleanEmail = s.email?.toLowerCase();
            const vipInfo = s.vipInfo;
            const isBusy = processingEmail === cleanEmail;

            return (
              <div 
                key={s.id || s.email}
                className={`bg-stone-950/90 border rounded-2xl p-4 transition-all ${
                  s.isVipActive 
                    ? 'border-emerald-500/30 shadow-md shadow-emerald-950/20' 
                    : s.isVipExpired
                    ? 'border-amber-500/40 bg-amber-950/10'
                    : 'border-stone-800'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  {/* Left: Avatar & Info */}
                  <div className="flex items-start sm:items-center gap-3">
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-sm shrink-0 ${
                      s.isVipActive 
                        ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-stone-950 shadow-md shadow-amber-900/40' 
                        : s.isVipExpired
                        ? 'bg-amber-950 border border-amber-500/40 text-amber-400'
                        : 'bg-stone-800 text-stone-300'
                    }`}>
                      {s.name?.charAt(0)?.toUpperCase() || 'S'}
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="font-bold text-white text-sm">{s.name}</h4>

                        {/* Status Badges */}
                        {s.isVipActive && (
                          <span className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Crown className="w-3 h-3 text-emerald-400" />
                            VIP सक्रिय ({vipInfo?.plan === '1month' ? '1 माह' : '1 वर्ष'}) • {vipInfo?.daysRemaining} दिन शेष
                          </span>
                        )}

                        {s.isVipExpired && (
                          <span className="bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Clock className="w-3 h-3 text-amber-400" />
                            प्लान समाप्त (Expired)
                          </span>
                        )}

                        {!s.isVipActive && !s.isVipExpired && (
                          <span className="bg-stone-800 text-stone-400 text-[10px] font-medium px-2 py-0.5 rounded-full">
                            साधारण (मुफ्त)
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-xs text-stone-400 mt-1">
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3 text-stone-500 shrink-0" />
                          <span className="font-mono text-stone-300">{s.email}</span>
                          <button
                            type="button"
                            onClick={() => handleCopy(s.email)}
                            className="hover:text-amber-400 cursor-pointer p-0.5"
                            title="जीमेल कॉपी करें"
                          >
                            {copiedEmail === s.email ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          </button>
                        </span>

                        {s.lastLogin && (
                          <span className="text-[10px] text-stone-500 hidden sm:inline border-l border-stone-800 pl-2">
                            लॉगिन: {new Date(s.lastLogin).toLocaleDateString('hi-IN')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Plan Dates & Actions */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-800/80">
                    {/* Validity Info */}
                    {vipInfo && (
                      <div className="text-left sm:text-right text-[11px] bg-stone-900/80 px-3 py-1.5 rounded-xl border border-stone-800/80">
                        <div className="text-stone-400 flex items-center sm:justify-end gap-1">
                          <Hourglass className="w-3 h-3 text-amber-400" />
                          <span>वैधता: <strong className="text-white">{vipInfo.formattedExpiry} तक</strong></span>
                        </div>
                        <div className="text-[10px] text-stone-500">
                          {s.isVipActive ? `${vipInfo.daysRemaining} दिन बाकी` : 'प्लान अवधि पूर्ण हो चुकी है'}
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex items-center gap-1.5">
                      {s.isVipActive ? (
                        <>
                          <button
                            type="button"
                            onClick={() => setSelectedStudentForVip(s)}
                            disabled={isBusy}
                            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500/15 hover:bg-amber-500/25 text-amber-400 border border-amber-500/30 transition-all cursor-pointer flex items-center gap-1"
                            title="वैधता बढ़ाएँ (Extend)"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>वैधता बढ़ाएँ</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleRevokeVip(s)}
                            disabled={isBusy}
                            className="px-2.5 py-1.5 rounded-xl text-xs text-stone-400 hover:text-rose-400 hover:bg-rose-950/30 border border-stone-800 transition-colors cursor-pointer"
                            title="VIP रद्द करें"
                          >
                            रद्द करें
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setSelectedStudentForVip(s)}
                          disabled={isBusy}
                          className="px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 shadow-md shadow-amber-950/40"
                        >
                          <Crown className="w-3.5 h-3.5" />
                          <span>{s.isVipExpired ? 'पुनः रिन्यू करें' : 'VIP एक्सेस दें'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Grant / Extend VIP Modal */}
      {selectedStudentForVip && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-stone-900 border border-amber-500/40 rounded-3xl max-w-md w-full p-6 shadow-2xl relative space-y-5">
            <button
              onClick={() => setSelectedStudentForVip(null)}
              className="absolute top-4 right-4 text-stone-400 hover:text-white bg-stone-800 p-2 rounded-full cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto mb-2 font-black text-lg">
                <Crown className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">VIP सदस्यता अवधि चुनें</h3>
              <p className="text-xs text-stone-400 mt-0.5">
                छात्र: <strong className="text-white">{selectedStudentForVip.name}</strong> ({selectedStudentForVip.email})
              </p>
            </div>

            {/* Plan Duration Choices */}
            <div className="grid grid-cols-2 gap-3">
              <div
                onClick={() => setSelectedPlanToGrant('1month')}
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                  selectedPlanToGrant === '1month'
                    ? 'bg-amber-950/60 border-amber-500 text-white shadow-lg shadow-amber-950/50'
                    : 'bg-stone-950 border-stone-800 text-stone-400 hover:border-stone-700'
                }`}
              >
                <div className="font-bold text-xs uppercase tracking-wide text-amber-400">1 माह प्लान</div>
                <div className="text-2xl font-black text-white mt-1">₹99</div>
                <div className="text-[11px] text-stone-300 mt-1 flex items-center gap-1">
                  <Hourglass className="w-3 h-3 text-amber-400" />
                  30 दिन की वैधता
                </div>
                <div className="text-[10px] text-stone-500 mt-1">
                  30 दिन बाद स्वतः समाप्त
                </div>
              </div>

              <div
                onClick={() => setSelectedPlanToGrant('1year')}
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                  selectedPlanToGrant === '1year'
                    ? 'bg-amber-950/60 border-amber-500 text-white shadow-lg shadow-amber-950/50'
                    : 'bg-stone-950 border-stone-800 text-stone-400 hover:border-stone-700'
                }`}
              >
                <div className="font-bold text-xs uppercase tracking-wide text-amber-400">1 वर्ष प्लान</div>
                <div className="text-2xl font-black text-white mt-1">₹600</div>
                <div className="text-[11px] text-stone-300 mt-1 flex items-center gap-1">
                  <Hourglass className="w-3 h-3 text-amber-400" />
                  365 दिन की वैधता
                </div>
                <div className="text-[10px] text-stone-500 mt-1">
                  1 साल बाद स्वतः समाप्त
                </div>
              </div>
            </div>

            <p className="text-[11px] text-stone-400 bg-stone-950 p-3 rounded-xl border border-stone-800">
              💡 यह अवधि पूरी होते ही छात्र का VIP एक्सेस अपने आप डीएक्टिवेट हो जाएगा। यदि छात्र बाद में दोबारा पेमेंट करता है तो फिर से नया प्लान एक्टिवेट हो जाएगा।
            </p>

            <button
              type="button"
              onClick={() => handleGrantVip(selectedStudentForVip, selectedPlanToGrant)}
              disabled={processingEmail === selectedStudentForVip.email}
              className="w-full bg-amber-500 hover:bg-amber-400 text-stone-950 font-black py-3 rounded-xl transition-all shadow-md cursor-pointer text-sm flex items-center justify-center gap-2"
            >
              <Crown className="w-4 h-4" />
              <span>
                {selectedPlanToGrant === '1month' ? '1 माह (30 दिन) VIP एक्टिवेट करें' : '1 वर्ष (365 दिन) VIP एक्टिवेट करें'}
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
