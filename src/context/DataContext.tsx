import React, { createContext, useContext, useEffect, useState } from 'react';
import { db } from '../lib/firebase';
import { collection, getDocs, query, orderBy, onSnapshot, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { useAuth } from './AuthContext';
import { defaultSubjectsData } from '../data/defaultCurriculum';
import { defaultPaidPdfNotes } from '../data/defaultPdfNotes';
import { Subject, PaidPdfNote } from '../types';
import { syncInitialCurriculumToFirestore } from '../utils/firestoreCurriculumSync';

interface DataContextType {
  subjects: Record<string, Subject>;
  paidNotes: PaidPdfNote[];
  loading: boolean;
  refreshData: () => Promise<void>;
  addPaidNote: (note: Omit<PaidPdfNote, 'id'>) => Promise<string>;
  deletePaidNote: (id: string) => Promise<void>;
}

const DataContext = createContext<DataContextType | null>(null);

export const DataProvider = ({ children }: any) => {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState<Record<string, Subject>>(defaultSubjectsData);
  const [paidNotes, setPaidNotes] = useState<PaidPdfNote[]>(() => {
    try {
      const cached = localStorage.getItem('bseb_paid_notes_cache');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return defaultPaidPdfNotes;
  });
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const subsSnap = await getDocs(collection(db, 'subjects'));
      const firestoreData: Record<string, any> = {};

      for (const docSnap of subsSnap.docs) {
        const sub = docSnap.data();
        const subId = docSnap.id;
        const chSnap = await getDocs(query(collection(db, 'subjects', subId, 'chapters'), orderBy('chapter_no', 'asc')));
        firestoreData[subId] = {
          ...sub,
          id: subId,
          chapters: chSnap.docs.map(d => ({ id: d.id, ...d.data() }))
        };
      }

      // Merge: Start with default subjects, then overlay firestore data
      const merged: Record<string, Subject> = { ...defaultSubjectsData };

      Object.keys(firestoreData).forEach((subKey) => {
        if (!merged[subKey]) {
          merged[subKey] = firestoreData[subKey];
        } else {
          // Merge chapters
          const existingChapters = [...(merged[subKey].chapters || [])];
          const firestoreChapters = firestoreData[subKey].chapters || [];

          firestoreChapters.forEach((fCh: any) => {
            const idx = existingChapters.findIndex(c => c.chapter_no === fCh.chapter_no);
            if (idx >= 0) {
              const current = existingChapters[idx];
              existingChapters[idx] = {
                ...current,
                ...fCh,
                chapter_name_hindi: fCh.chapter_name_hindi || current.chapter_name_hindi,
                intro_hindi: fCh.intro_hindi || current.intro_hindi || '',
                notes_hindi: fCh.notes_hindi || current.notes_hindi || '',
                topper_tips: fCh.topper_tips || current.topper_tips || '',
                mcq: (fCh.mcq && fCh.mcq.length > 0) ? fCh.mcq : (current.mcq || []),
                subjective_qa: (fCh.subjective_qa && fCh.subjective_qa.length > 0) ? fCh.subjective_qa : (current.subjective_qa || [])
              };
            } else {
              existingChapters.push(fCh);
            }
          });

          existingChapters.sort((a, b) => a.chapter_no - b.chapter_no);

          merged[subKey] = {
            ...merged[subKey],
            ...firestoreData[subKey],
            chapters: existingChapters
          };
        }
      });

      setSubjects(merged);
    } catch (e: any) {
      console.warn("Data Fetch Notice:", e?.message || String(e));
      // Fallback to default data on network/permission error
      setSubjects(defaultSubjectsData);
    }
    setLoading(false);
  };

  // Real-time listener for paid_notes collection
  useEffect(() => {
    try {
      const unsub = onSnapshot(collection(db, 'paid_notes'), (snapshot) => {
        if (!snapshot.empty) {
          const notesFromDb: PaidPdfNote[] = [];
          snapshot.forEach((docSnap) => {
            notesFromDb.push({ id: docSnap.id, ...(docSnap.data() as any) });
          });
          // Merge with default notes if not present
          const mergedNotes = [...notesFromDb];
          defaultPaidPdfNotes.forEach((def) => {
            if (!mergedNotes.some(n => n.id === def.id || (n.subjectId === def.subjectId && n.chapterNo === def.chapterNo))) {
              mergedNotes.push(def);
            }
          });
          setPaidNotes(mergedNotes);
          try {
            localStorage.setItem('bseb_paid_notes_cache', JSON.stringify(mergedNotes));
          } catch {}
        } else {
          setPaidNotes(defaultPaidPdfNotes);
        }
      }, (err) => {
        console.warn("Paid notes snapshot warning:", err?.message || String(err));
      });
      return () => unsub();
    } catch (err: any) {
      console.warn("Paid notes listener error:", err?.message || String(err));
    }
  }, []);

  const addPaidNote = async (noteData: Omit<PaidPdfNote, 'id'>): Promise<string> => {
    const id = 'note_' + Date.now();
    const newNote: PaidPdfNote = {
      id,
      ...noteData,
      uploadedAt: noteData.uploadedAt || new Date().toISOString()
    };

    // Update local state immediately for instant responsive UI
    setPaidNotes((prev) => [newNote, ...prev]);
    try {
      const updated = [newNote, ...paidNotes];
      localStorage.setItem('bseb_paid_notes_cache', JSON.stringify(updated));
    } catch {}

    // Persist in Firestore
    try {
      await setDoc(doc(db, 'paid_notes', id), newNote);
    } catch (e: any) {
      console.warn("Firestore note save notice:", e?.message || String(e));
    }
    return id;
  };

  const deletePaidNote = async (id: string): Promise<void> => {
    setPaidNotes((prev) => prev.filter((n) => n.id !== id));
    try {
      const updated = paidNotes.filter((n) => n.id !== id);
      localStorage.setItem('bseb_paid_notes_cache', JSON.stringify(updated));
    } catch {}

    try {
      await deleteDoc(doc(db, 'paid_notes', id));
    } catch (e: any) {
      console.warn("Firestore note delete notice:", e?.message || String(e));
    }
  };

  useEffect(() => {
    fetchData();
    // Silently sync Sanskrit & Hindi Chapter 1 to Firestore if connected
    syncInitialCurriculumToFirestore().catch(() => {});
  }, [user]);

  return (
    <DataContext.Provider value={{ 
      subjects, 
      paidNotes, 
      loading, 
      refreshData: fetchData,
      addPaidNote,
      deletePaidNote
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

