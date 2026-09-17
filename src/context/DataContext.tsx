import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { SubjectWithChapters, Class10ChapterData } from '../data/class10SubjectData';

interface DataContextType {
  subjectsData: Record<string, SubjectWithChapters>;
  loading: boolean;
  refreshData: () => Promise<void>;
  lastFetched: Date | null;
}

const DataContext = createContext<DataContextType>({
  subjectsData: {},
  loading: true,
  refreshData: async () => {},
  lastFetched: null,
});

export const useData = () => useContext(DataContext);

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const [subjectsData, setSubjectsData] = useState<Record<string, SubjectWithChapters>>({});
  const [loading, setLoading] = useState(true);
  const [lastFetched, setLastFetched] = useState<Date | null>(null);

  const refreshData = useCallback(async () => {
    setLoading(true);
    try {
      const subjectsSnap = await getDocs(collection(db, 'subjects'));
      const newData: Record<string, SubjectWithChapters> = {};
      
      for (const subjectDoc of subjectsSnap.docs) {
        const subject = subjectDoc.data() as any;
        const subjectId = subjectDoc.id;
        
        // Fetch chapters
        const chaptersSnap = await getDocs(query(collection(db, 'subjects', subjectId, 'chapters'), orderBy('chapter_no', 'asc')));
        const chapters: Class10ChapterData[] = chaptersSnap.docs.map(doc => doc.data() as Class10ChapterData);
        
        newData[subjectId] = {
          subject_id: subjectId,
          subject_name: subject.subject_name || subject.subject_name_hindi,
          subject_name_hindi: subject.subject_name_hindi || subject.subject_name,
          icon: subject.icon,
          tagline: subject.tagline,
          color: subject.color,
          chapters: chapters,
        };
      }
      
      setSubjectsData(newData);
      setLastFetched(new Date());
    } catch (error) {
      console.error("Error fetching data from Firestore:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  return (
    <DataContext.Provider value={{ subjectsData, loading, refreshData, lastFetched }}>
      {children}
    </DataContext.Provider>
  );
};
