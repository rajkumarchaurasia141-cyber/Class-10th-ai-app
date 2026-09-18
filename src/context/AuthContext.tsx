import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '../lib/firebase';
import { GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

const AuthContext = createContext<any>(null);

export const AuthProvider = ({ children }: any) => {
  const [user, setUser] = useState<any>(null);
  const [isVIP, setIsVIP] = useState(false);
  const [loading, setLoading] = useState(true);

  const isAdmin = user?.email === 'rajkumarchaurasia141@gmail.com';

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        if (u.email === 'rajkumarchaurasia141@gmail.com') {
          setIsVIP(true);
        } else {
          try {
            const docRef = doc(db, 'vip_users', u.email || '');
            const snap = await getDoc(docRef);
            setIsVIP(snap.exists() && snap.data().isVip === true);
          } catch (e) { console.error(e); }
        }
      } else {
        setIsVIP(false);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const login = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const logout = () => signOut(auth);

  return (
    <AuthContext.Provider value={{ user, isAdmin, isVIP, loading, login, logout }}>
      {loading ? <div className="min-h-screen flex items-center justify-center">Loading...</div> : children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
