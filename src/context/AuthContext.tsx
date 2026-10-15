import React, { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext<any>(null);

export const AuthProvider = ({ children }: any) => {
  const [user, setUser] = useState<{ name: string; email: string } | null>(() => {
    try {
      const saved = localStorage.getItem('bseb_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.email) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn("Failed to parse cached user:", e);
    }
    return null;
  });

  // 100% FREE FOR EVERYONE: All VIP features, Full Course, and Crash Course are permanently unlocked!
  const isVIP = true;
  const isPaid = true;
  const hasCrashCourse = true;
  const hasFullCourse = true;

  const vipDetails = {
    isVip: true,
    plan: 'lifetime_free',
    planDurationText: 'VIP Full Access (100% Free)',
    isExpired: false,
    daysRemaining: 9999,
    formattedExpiry: 'सक्रिय (निःशुल्क)'
  };

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cleanUserEmail = user?.email?.trim().toLowerCase() || '';
  const isAdmin = cleanUserEmail === 'rajkumarchaurasia143@gmail.com' || cleanUserEmail === 'rajkumarchaurasia141@gmail.com' || true; // Everyone can access admin or app features fully free

  useEffect(() => {
    try {
      const saved = localStorage.getItem('bseb_user');
      if (saved && !user) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.email) {
          setUser(parsed);
        }
      }
    } catch (e) {}
    setLoading(false);
  }, []);

  const unlockUserCrashCourse = (_cleanEmail: string) => {
    // Already unlocked for everyone
  };

  const lockUserCrashCourse = (_cleanEmail: string) => {
    // Cannot lock - app is 100% free
  };

  const login = async (name: string, email: string) => {
    setError(null);
    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanName) {
      setError('कृपया अपना नाम दर्ज करें।');
      return false;
    }
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setError('कृपया एक मान्य ईमेल (Gmail) दर्ज करें।');
      return false;
    }

    const userData = { name: cleanName, email: cleanEmail };

    try {
      localStorage.setItem('bseb_user', JSON.stringify(userData));
    } catch (e) {
      console.warn("LocalStorage save notice:", e);
    }

    setUser(userData);

    try {
      const storedStudents = JSON.parse(localStorage.getItem('bseb_registered_students') || '{}');
      storedStudents[cleanEmail] = {
        id: cleanEmail,
        name: cleanName,
        email: cleanEmail,
        lastLogin: new Date().toISOString()
      };
      localStorage.setItem('bseb_registered_students', JSON.stringify(storedStudents));
    } catch {}

    return true;
  };

  const logout = () => {
    localStorage.removeItem('bseb_user');
    setUser(null);
    setError(null);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      fbUser: null, 
      isAdmin, 
      isVIP: true, 
      isPaid: true, 
      hasCrashCourse: true, 
      hasFullCourse: true, 
      unlockUserCrashCourse, 
      lockUserCrashCourse, 
      vipDetails, 
      loading, 
      login, 
      logout, 
      error, 
      setError 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
