import React, { createContext, useContext, useEffect, useState } from 'react';
import { db } from '../lib/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { useAuth } from './AuthContext';
import { defaultSubjectsData } from '../data/defaultCurriculum';
import { Subject } from '../types';

interface DataContextType {
  subjects: Record<string, Subject>;
  loading: boolean;
  refreshData: () => Promise<void>;
}

const DataContext = createContext<DataContextType | null>(null);

export const DataProvider = ({ children }: any) => {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState<Record<string, Subject>>(defaultSubjectsData);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    if (!user) return;
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
              existingChapters[idx] = { ...existingChapters[idx], ...fCh };
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
      console.error("Data Fetch Error:", e);
      // Fallback to default data on network/permission error
      setSubjects(defaultSubjectsData);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (user) {
      fetchData();
    } else {
      setSubjects(defaultSubjectsData);
    }
  }, [user]);

  return (
    <DataContext.Provider value={{ subjects, loading, refreshData: fetchData }}>
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

