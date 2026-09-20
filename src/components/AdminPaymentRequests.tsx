import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, onSnapshot, doc, query, where, serverTimestamp } from 'firebase/firestore';
import { safeSetDoc, safeDeleteDoc, isQuotaError } from '../utils/firestoreSafe';
import { 
  Receipt, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Trash2, 
  ExternalLink, 
  Search, 
  ZoomIn, 
  X, 
  Crown, 
  Mail, 
  User, 
  Calendar, 
  Sparkles,
  Copy,
  Check,
  ShieldCheck,
  DollarSign,
  Hourglass
} from 'lucide-react';
import { calculateVipExpiry } from '../utils/vipHelper';

export interface PaymentRequestItem {
  id: string;
  studentName: string;
  studentEmail: string;
  plan: '1month' | '1year';
  planTitle: string;
  planAmount: string;
  planPrice: number;
  screenshotDataUrl: string;
  utr?: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  approvedAt?: string;
}

export function AdminPaymentRequests() {
  const [requests, setRequests] = useState<PaymentRequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [search, setSearch] = useState('');
  const [selectedImage, setSelectedImage] = useState<PaymentRequestItem | null>(null);
  const [actionMsg, setActionMsg] = useState<string | null>(null);
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    const mergeWithLocal = (remoteItems: PaymentRequestItem[]) => {
      let merged = [...remoteItems];
      try {
        const localItems: PaymentRequestItem[] = JSON.parse(localStorage.getItem('bseb_payment_requests') || '[]');
        const remoteIds = new Set(remoteItems.map(i => i.id));
        for (const loc of localItems) {
          if (!remoteIds.has(loc.id)) {
            merged.push(loc);
          }
        }
      } catch (e) {
        console.warn('Local requests merge notice:', e);
      }

      // Sort by submittedAt descending (newest first)
      merged.sort((a, b) => {
        const tA = new Date(a.submittedAt || 0).getTime();
        const tB = new Date(b.submittedAt || 0).getTime();
        return tB - tA;
      });

      setRequests(merged);
      setLoading(false);
    };

    try {
      // Query the 'payment_requests' collection where status == 'pending' as requested (STEP 3)
      const q = query(collection(db, 'payment_requests'), where('status', '==', 'pending'));
      const unsub = onSnapshot(q, (snapshot) => {
        const items: PaymentRequestItem[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          items.push({
            id: docSnap.id,
            userId: data.userId || data.uid || '',
            studentName: data.userName || data.studentName || 'विद्यार्थी',
            studentEmail: data.userEmail || data.studentEmail || data.email || '',
            plan: data.plan || '1year',
            planTitle: data.planTitle || '1 वर्ष बैच',
            planAmount: data.planAmount || '₹600',
            planPrice: data.planPrice || (data.plan === '1month' ? 99 : 600),
            screenshotDataUrl: data.screenshotUrl || data.screenshotDataUrl || '',
            utr: data.utr || '',
            status: data.status || 'pending',
            submittedAt: data.createdAt?.toDate?.()?.toISOString() || data.submittedAt || new Date().toISOString()
          } as any);
        });
        mergeWithLocal(items);
      }, (err) => {
        console.warn('Payment requests fetch notice:', err?.message || String(err));
        // Fallback to local storage if Firestore snapshot fails
        mergeWithLocal([]);
      });

      return () => unsub();
    } catch (e: any) {
      console.warn('Payment requests setup notice:', e?.message || String(e));
      mergeWithLocal([]);
    }
  }, []);

  const handleCopy = (email: string) => {
    navigator.clipboard?.writeText(email);
    setCopiedEmail(email);
    setTimeout(() => setCopiedEmail(null), 2000);
  };

  // 1-Click Approve VIP
  const handleApprove = async (req: any) => {
    setProcessingId(req.id);
    setActionMsg(null);
    try {
      const cleanEmail = req.studentEmail.trim().toLowerCase();
      const planKey = req.plan === '1year' ? '1year' : '1month';
      const expiry = calculateVipExpiry(planKey);
      const userId = req.userId || `simulated_${cleanEmail.replace(/[^a-zA-Z0-9]/g, '_')}`;

      let dbSuccess1 = false;
      let dbSuccess2 = false;

      // 1. Grant VIP in users collection (STEP 3 - Approve: isActive = true)
      try {
        await safeSetDoc(doc(db, 'users', userId), {
          isActive: true,
          email: cleanEmail,
          name: req.studentName || ''
        }, { merge: true }, 5000, true);
        dbSuccess1 = true;
      } catch (err) {
        console.warn('Firestore active status update failed:', err);
      }

      // Also support legacy vip_users collection
      try {
        await safeSetDoc(doc(db, 'vip_users', cleanEmail), {
          isVip: true,
          plan: planKey,
          planDuration: expiry.planDurationText,
          planPrice: req.planPrice || (planKey === '1month' ? 99 : 600),
          studentName: req.studentName || '',
          validFrom: expiry.validFrom,
          expiresAt: expiry.expiresAt,
          addedAt: new Date().toISOString(),
          activatedByAdmin: true
        }, { merge: true }, 5000, true);
      } catch (err) {
        console.warn('Legacy VIP user grant failed:', err);
      }

      // 2. Mark request as approved in payments and payment_requests
      try {
        const updatePayload = {
          status: 'approved',
          approvedAt: new Date().toISOString(),
          expiresAt: expiry.expiresAt
        };
        await safeSetDoc(doc(db, 'payments', req.id), updatePayload, { merge: true }, 5000, true);
        await safeSetDoc(doc(db, 'payment_requests', req.id), updatePayload, { merge: true }, 5000, true);
        dbSuccess2 = true;
      } catch (err) {
        console.warn('Firestore update request status failed:', err);
      }

      // 3. Keep local storage synced (Always do this as robust fallback)
      try {
        const localItems: PaymentRequestItem[] = JSON.parse(localStorage.getItem('bseb_payment_requests') || '[]');
        const updated = localItems.map(item => item.id === req.id ? { ...item, status: 'approved' as const, approvedAt: new Date().toISOString() } : item);
        localStorage.setItem('bseb_payment_requests', JSON.stringify(updated));

        const localVips = JSON.parse(localStorage.getItem('bseb_vip_users') || '{}');
        localVips[cleanEmail] = {
          isVip: true,
          plan: planKey,
          planDuration: expiry.planDurationText,
          planPrice: req.planPrice || (planKey === '1month' ? 99 : 600),
          studentName: req.studentName || '',
          validFrom: expiry.validFrom,
          expiresAt: expiry.expiresAt,
          addedAt: new Date().toISOString(),
          activatedByAdmin: true
        };
        localStorage.setItem('bseb_vip_users', JSON.stringify(localVips));
      } catch {}

      // Update in-memory state immediately
      setRequests(prev => prev.map(item => item.id === req.id ? { ...item, status: 'approved' as const, approvedAt: new Date().toISOString() } : item));

      // Trigger "Baccha Active Ho Gaya" Toast (STEP 3)
      setToastMessage("🎉 Baccha Active Ho Gaya!");
      setTimeout(() => setToastMessage(null), 3000);

      const expiryDateFormatted = new Date(expiry.expiresAt).toLocaleDateString('hi-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });

      if (dbSuccess1 && dbSuccess2) {
        setActionMsg(`सफलता! छात्र ${req.studentName} का VIP बैच अनलॉक हो गया (वैधता: ${expiryDateFormatted} तक)।`);
      } else {
        setActionMsg(`सूचना: छात्र ${req.studentName} का VIP बैच स्थानीय रूप से अनलॉक कर दिया गया है।`);
      }
      if (selectedImage?.id === req.id) {
        setSelectedImage(prev => prev ? { ...prev, status: 'approved' } : null);
      }
    } catch (err: any) {
      if (isQuotaError(err)) {
        setActionMsg('सूचना: दैनिक लिमिट पूरी हो चुकी है। बदलाव स्थानीय रूप से सहेज लिया गया है।');
      } else {
        console.warn('Approve failed notice:', err?.message || String(err));
        alert('स्वीकृति में त्रुटि: ' + (err?.message || 'पुनः प्रयास करें'));
      }
    } finally {
      setProcessingId(null);
    }
  };

  // Reject Request
  const handleReject = async (req: PaymentRequestItem) => {
    if (!confirm(`क्या आप ${req.studentName} के इस पेमेंट रिक्वेस्ट को अस्वीकृत करना चाहते हैं?`)) return;
    setProcessingId(req.id);
    try {
      await safeSetDoc(doc(db, 'payments', req.id), { status: 'rejected' }, { merge: true });
      await safeSetDoc(doc(db, 'payment_requests', req.id), { status: 'rejected' }, { merge: true });

      // Update local storage
      try {
        const localItems: PaymentRequestItem[] = JSON.parse(localStorage.getItem('bseb_payment_requests') || '[]');
        const updated = localItems.map(item => item.id === req.id ? { ...item, status: 'rejected' as const } : item);
        localStorage.setItem('bseb_payment_requests', JSON.stringify(updated));
      } catch {}

      setRequests(prev => prev.map(item => item.id === req.id ? { ...item, status: 'rejected' as const } : item));

      if (selectedImage?.id === req.id) {
        setSelectedImage(prev => prev ? { ...prev, status: 'rejected' } : null);
      }
    } catch (err: any) {
      if (isQuotaError(err)) {
        setActionMsg('सूचना: आज की Firestore दैनिक लिमिट पूरी हो चुकी है।');
      } else {
        alert('त्रुटि: ' + err?.message);
      }
    } finally {
      setProcessingId(null);
    }
  };

  // Delete Request
  const handleDelete = async (id: string) => {
    if (!confirm('क्या आप इस पेमेंट रिक्वेस्ट रिकॉर्ड को हटाना चाहते हैं?')) return;
    try {
      await safeDeleteDoc(doc(db, 'payments', id));
      await safeDeleteDoc(doc(db, 'payment_requests', id));

      // Remove from local storage
      try {
        const localItems: PaymentRequestItem[] = JSON.parse(localStorage.getItem('bseb_payment_requests') || '[]');
        const updated = localItems.filter(item => item.id !== id);
        localStorage.setItem('bseb_payment_requests', JSON.stringify(updated));
      } catch {}

      setRequests(prev => prev.filter(item => item.id !== id));
      if (selectedImage?.id === id) setSelectedImage(null);
    } catch (err: any) {
      if (isQuotaError(err)) {
        setActionMsg('सूचना: आज की Firestore दैनिक लिमिट पूरी हो चुकी है।');
      } else {
        alert('डिलीट में त्रुटि: ' + err?.message);
      }
    }
  };

  // Filtered requests
  const filteredRequests = requests.filter(item => {
    if (filter !== 'all' && item.status !== filter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchName = item.studentName?.toLowerCase().includes(q);
      const matchEmail = item.studentEmail?.toLowerCase().includes(q);
      const matchUtr = item.utr?.toLowerCase().includes(q);
      return matchName || matchEmail || matchUtr;
    }
    return true;
  });

  const pendingCount = requests.filter(r => r.status === 'pending').length;
  const approvedCount = requests.filter(r => r.status === 'approved').length;
  const totalRevenue = requests
    .filter(r => r.status === 'approved')
    .reduce((acc, curr) => acc + (curr.planPrice || (curr.plan === '1month' ? 99 : 600)), 0);

  return (
    <div className="space-y-6 relative z-10">
      {/* Real-time Toast Notification (STEP 3) */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-emerald-500 text-stone-950 font-black px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-bounce border-2 border-white">
          <CheckCircle2 className="w-6 h-6 text-stone-950 shrink-0" />
          <span className="text-sm tracking-wide">{toastMessage}</span>
        </div>
      )}

      {/* Overview Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-stone-950 p-4 rounded-2xl border border-stone-800">
          <div className="text-xs font-bold text-stone-400 flex items-center gap-1.5 mb-1">
            <Receipt className="w-3.5 h-3.5 text-amber-500" />
            कुल रिक्वेस्ट
          </div>
          <div className="text-2xl font-black text-white">{requests.length}</div>
        </div>

        <div className="bg-amber-950/30 p-4 rounded-2xl border border-amber-500/30">
          <div className="text-xs font-bold text-amber-400 flex items-center gap-1.5 mb-1">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            लंबित (Pending)
          </div>
          <div className="text-2xl font-black text-amber-400">{pendingCount}</div>
        </div>

        <div className="bg-emerald-950/30 p-4 rounded-2xl border border-emerald-500/30">
          <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 mb-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            स्वीकृत (Approved)
          </div>
          <div className="text-2xl font-black text-emerald-400">{approvedCount}</div>
        </div>

        <div className="bg-stone-950 p-4 rounded-2xl border border-stone-800">
          <div className="text-xs font-bold text-stone-400 flex items-center gap-1.5 mb-1">
            <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
            कुल कमाई (Revenue)
          </div>
          <div className="text-2xl font-black text-white">₹{totalRevenue}</div>
        </div>
      </div>

      {actionMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 flex items-center justify-between gap-3 text-sm animate-fade-in">
          <div className="flex items-center gap-2 font-medium">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{actionMsg}</span>
          </div>
          <button onClick={() => setActionMsg(null)} className="text-stone-400 hover:text-white cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center">
        {/* Filter Chips */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filter === 'all' ? 'bg-amber-500 text-stone-950' : 'bg-stone-900 text-stone-400 hover:text-white border border-stone-800'
            }`}
          >
            सभी ({requests.length})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              filter === 'pending' ? 'bg-amber-500 text-stone-950' : 'bg-stone-900 text-amber-400 hover:text-white border border-stone-800'
            }`}
          >
            <Clock className="w-3 h-3" />
            लंबित ({pendingCount})
          </button>
          <button
            onClick={() => setFilter('approved')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              filter === 'approved' ? 'bg-emerald-500 text-stone-950' : 'bg-stone-900 text-emerald-400 hover:text-white border border-stone-800'
            }`}
          >
            <CheckCircle2 className="w-3 h-3" />
            स्वीकृत ({approvedCount})
          </button>
          <button
            onClick={() => setFilter('rejected')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filter === 'rejected' ? 'bg-rose-500 text-white' : 'bg-stone-900 text-rose-400 hover:text-white border border-stone-800'
            }`}
          >
            अस्वीकृत
          </button>
        </div>

        {/* Search Field */}
        <div className="relative min-w-[220px]">
          <Search className="w-3.5 h-3.5 text-stone-500 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="नाम, जीमेल या UTR खोजें..."
            className="w-full bg-stone-950 border border-stone-800 rounded-xl pl-8 pr-3 py-2 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-amber-500"
          />
        </div>
      </div>

      {/* Requests List */}
      {loading ? (
        <div className="p-12 text-center text-stone-400 text-sm">
          डेटा लोड हो रहा है...
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="bg-stone-950 p-12 rounded-2xl border border-stone-800 text-center space-y-2">
          <Receipt className="w-10 h-10 text-stone-600 mx-auto" />
          <h4 className="text-white font-bold text-sm">कोई पेमेंट रिक्वेस्ट नहीं मिली</h4>
          <p className="text-stone-500 text-xs max-w-sm mx-auto">
            {filter === 'pending' 
              ? 'वर्तमान में कोई लंबित पेमेंट रिक्वेस्ट नहीं है। जैसे ही कोई छात्र स्क्रीनशॉट अपलोड करेगा, वह यहाँ तुरंत दिखेगा।' 
              : 'दिए गए फ़िल्टर के अनुसार कोई रिकॉर्ड उपलब्ध नहीं है।'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredRequests.map((item) => {
            const isApproved = item.status === 'approved';
            const isPending = item.status === 'pending';
            const isRejected = item.status === 'rejected';
            const isProcessing = processingId === item.id;

            return (
              <div 
                key={item.id}
                className={`bg-stone-950/80 rounded-2xl p-4 border transition-all space-y-3 relative ${
                  isPending 
                    ? 'border-amber-500/40 shadow-lg shadow-amber-950/20' 
                    : isApproved 
                    ? 'border-emerald-500/30' 
                    : 'border-stone-800'
                }`}
              >
                {/* Header: Student Info & Status */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 font-black text-sm flex items-center justify-center shrink-0">
                      {item.studentName?.charAt(0)?.toUpperCase() || 'S'}
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm leading-tight flex items-center gap-1.5">
                        {item.studentName}
                        {isApproved && (
                          <span className="bg-amber-500/20 text-amber-400 text-[10px] font-black px-1.5 py-0.2 rounded border border-amber-500/30">
                            VIP
                          </span>
                        )}
                      </h4>
                      <div className="flex items-center gap-1 text-[11px] text-stone-400 mt-0.5">
                        <Mail className="w-3 h-3 text-stone-500" />
                        <span className="font-mono">{item.studentEmail}</span>
                        <button
                          type="button"
                          onClick={() => handleCopy(item.studentEmail)}
                          className="hover:text-amber-400 p-0.5 cursor-pointer"
                          title="जीमेल कॉपी करें"
                        >
                          {copiedEmail === item.studentEmail ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div>
                    {isPending && (
                      <span className="bg-amber-500/15 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1">
                        <Clock className="w-3 h-3" /> लंबित
                      </span>
                    )}
                    {isApproved && (
                      <span className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> स्वीकृत
                      </span>
                    )}
                    {isRejected && (
                      <span className="bg-rose-500/15 text-rose-400 border border-rose-500/30 px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1">
                        <XCircle className="w-3 h-3" /> अस्वीकृत
                      </span>
                    )}
                  </div>
                </div>

                {/* Plan & Transaction details */}
                <div className="grid grid-cols-2 gap-2 bg-stone-900/90 p-2.5 rounded-xl text-xs border border-stone-800/80">
                  <div>
                    <span className="text-[10px] text-stone-500 block uppercase font-bold">प्लान</span>
                    <span className="font-bold text-amber-400 flex items-center gap-1 mt-0.5">
                      <Crown className="w-3 h-3 text-amber-400" />
                      {item.planTitle || (item.plan === '1month' ? '1 माह (₹99)' : '1 वर्ष (₹600)')}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-stone-500 block uppercase font-bold">राशि</span>
                    <span className="font-black text-white text-sm">
                      {item.planAmount || (item.plan === '1month' ? '₹99' : '₹600')}
                    </span>
                  </div>

                  {item.utr && (
                    <div className="col-span-2 pt-1 border-t border-stone-800">
                      <span className="text-[10px] text-stone-500 block font-bold">UTR / UPI Ref ID:</span>
                      <span className="font-mono text-stone-200 text-xs">{item.utr}</span>
                    </div>
                  )}

                  <div className="col-span-2 pt-1 border-t border-stone-800 flex items-center justify-between text-[11px]">
                    <span className="text-stone-400 flex items-center gap-1">
                      <Hourglass className="w-3 h-3 text-amber-400" />
                      प्लान वैधता: <strong className="text-white">{item.plan === '1month' ? '30 दिन (1 माह)' : '365 दिन (1 वर्ष)'}</strong>
                    </span>
                    {item.status === 'approved' && (item as any).expiresAt && (
                      <span className="text-emerald-400 font-semibold text-[10px]">
                        समाप्ति: {new Date((item as any).expiresAt).toLocaleDateString('hi-IN')}
                      </span>
                    )}
                  </div>

                  <div className="col-span-2 text-[10px] text-stone-500 flex items-center gap-1 pt-0.5">
                    <Calendar className="w-3 h-3" />
                    <span>सबमिट: {item.submittedAt ? new Date(item.submittedAt).toLocaleString('hi-IN') : 'हाल ही में'}</span>
                  </div>
                </div>

                {/* Screenshot Image Preview Container */}
                {item.screenshotDataUrl ? (
                  <div 
                    onClick={() => setSelectedImage(item)}
                    className="relative group cursor-pointer overflow-hidden rounded-xl border border-stone-800 bg-black/60 aspect-[16/9] flex items-center justify-center"
                  >
                    <img 
                      src={item.screenshotDataUrl} 
                      alt="Payment proof" 
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white font-bold text-xs">
                      <ZoomIn className="w-4 h-4 text-amber-400" />
                      <span>फोटो बड़ा करके देखें</span>
                    </div>
                    <span className="absolute bottom-2 right-2 bg-black/70 text-[10px] text-stone-300 px-2 py-0.5 rounded backdrop-blur-sm">
                      क्लिक करके ज़ूम करें
                    </span>
                  </div>
                ) : (
                  <div className="p-3 bg-stone-900 rounded-xl text-center text-xs text-stone-500">
                    कोई फोटो अपलोड नहीं है
                  </div>
                )}

                {/* Actions Buttons */}
                <div className="flex items-center gap-2 pt-1">
                  {!isApproved ? (
                    <button
                      type="button"
                      onClick={() => handleApprove(item)}
                      disabled={isProcessing}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 text-xs transition-colors cursor-pointer shadow-md shadow-emerald-950/50"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{isProcessing ? 'सक्रिय हो रहा है...' : '✓ VIP अनलॉक करें'}</span>
                    </button>
                  ) : (
                    <div className="flex-1 bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span>VIP एक्टिवेट हो चुका है</span>
                    </div>
                  )}

                  {isPending && (
                    <button
                      type="button"
                      onClick={() => handleReject(item)}
                      disabled={isProcessing}
                      className="bg-stone-900 hover:bg-rose-950/40 text-stone-400 hover:text-rose-400 border border-stone-800 p-2.5 rounded-xl transition-colors cursor-pointer"
                      title="अस्वीकृत करें"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => handleDelete(item.id)}
                    className="bg-stone-900 hover:bg-stone-800 text-stone-500 hover:text-stone-300 border border-stone-800 p-2.5 rounded-xl transition-colors cursor-pointer"
                    title="रिकॉर्ड हटाएँ"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Full-Screen Screenshot Lightbox Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-stone-900 border border-stone-800 rounded-3xl max-w-2xl w-full p-5 shadow-2xl relative max-h-[95vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-stone-800 pb-3 mb-3">
              <div>
                <h3 className="font-bold text-white text-base flex items-center gap-2">
                  <span>पेमेंट स्क्रीनशॉट: {selectedImage.studentName}</span>
                  {selectedImage.status === 'approved' ? (
                    <span className="bg-emerald-500/20 text-emerald-400 text-xs px-2 py-0.5 rounded-full font-bold">स्वीकृत</span>
                  ) : (
                    <span className="bg-amber-500/20 text-amber-400 text-xs px-2 py-0.5 rounded-full font-bold">लंबित</span>
                  )}
                </h3>
                <p className="text-xs text-stone-400 font-mono mt-0.5">
                  {selectedImage.studentEmail} • {selectedImage.planTitle} ({selectedImage.planAmount})
                </p>
              </div>

              <button
                onClick={() => setSelectedImage(null)}
                className="text-stone-400 hover:text-white bg-stone-800 p-2 rounded-full cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body: Image */}
            <div className="flex-1 overflow-auto bg-black rounded-2xl flex items-center justify-center p-2 mb-4">
              <img
                src={selectedImage.screenshotDataUrl}
                alt="Payment proof full"
                referrerPolicy="no-referrer"
                className="max-h-[60vh] max-w-full object-contain rounded-lg"
              />
            </div>

            {/* Modal Footer Controls */}
            <div className="flex items-center justify-between gap-3 pt-2">
              <div className="text-xs text-stone-400">
                {selectedImage.utr && <span>UTR: <strong className="text-white font-mono">{selectedImage.utr}</strong></span>}
              </div>

              <div className="flex items-center gap-2">
                {selectedImage.status !== 'approved' && (
                  <button
                    onClick={() => handleApprove(selectedImage)}
                    disabled={processingId === selectedImage.id}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 px-5 rounded-xl text-xs flex items-center gap-2 cursor-pointer shadow-lg shadow-emerald-950/50"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>✓ इस छात्र का VIP तुरंत अनलॉक करें</span>
                  </button>
                )}
                <button
                  onClick={() => setSelectedImage(null)}
                  className="bg-stone-800 hover:bg-stone-700 text-stone-300 font-medium py-2.5 px-4 rounded-xl text-xs cursor-pointer"
                >
                  बंद करें
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
