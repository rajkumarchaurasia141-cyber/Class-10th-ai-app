import React, { createContext, useContext, useEffect, useState } from 'react';
import { db } from '../lib/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';

const DataContext = createContext<any>(null);

export const DataProvider = ({ children }: any) => {
  const [subjects, setSubjects] = useState<any>({});
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const subsSnap = await getDocs(collection(db, 'subjects'));
      const data: any = {};
      for (const docSnap of subsSnap.docs) {
        const sub = docSnap.data();
        const subId = docSnap.id;
        const chSnap = await getDocs(query(collection(db, 'subjects', subId, 'chapters'), orderBy('chapter_no', 'asc')));
        data[subId] = {
          ...sub,
          id: subId,
          chapters: chSnap.docs.map(d => ({ id: d.id, ...d.data() }))
        };
      }
      setSubjects(data);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <DataContext.Provider value={{ subjects, loading, refreshData: fetchData }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => useContext(DataContext);
