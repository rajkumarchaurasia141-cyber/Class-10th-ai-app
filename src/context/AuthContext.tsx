import React, { createContext, useContext, useState, useEffect } from 'react';

export interface User {
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  isVIP: boolean;
  login: (name: string, email: string) => void;
  logout: () => void;
  showPaywall: boolean;
  setShowPaywall: (show: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const unlockedStudents = [
  "Rajkumarchaurasia576@gmail.com",
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [showPaywall, setShowPaywall] = useState(false);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('pb_user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (e) {
      console.error("Error reading user from localStorage");
    }
  }, []);

  const login = (name: string, email: string) => {
    const newUser = { name, email };
    setUser(newUser);
    localStorage.setItem('pb_user', JSON.stringify(newUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('pb_user');
  };

  const isVIP = user ? unlockedStudents.some(email => email.toLowerCase() === user.email.toLowerCase()) : false;

  return (
    <AuthContext.Provider value={{ user, isVIP, login, logout, showPaywall, setShowPaywall }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
