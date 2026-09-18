import React from 'react';
import { useAuth } from '../context/AuthContext';
import { BookOpen } from 'lucide-react';

export function LoginScreen() {
  const { login } = useAuth();
  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-950 p-4 text-center">
      <div className="bg-stone-900 p-8 rounded-2xl border border-stone-800 max-w-sm w-full shadow-2xl">
        <BookOpen className="w-16 h-16 mx-auto mb-4 text-amber-500" />
        <h1 className="text-3xl font-extrabold text-amber-500 mb-2">BSEB 10th</h1>
        <p className="text-stone-400 mb-8">स्वागत है! कृपया अपनी पढ़ाई शुरू करने के लिए लॉगिन करें।</p>
        <button onClick={login} className="w-full bg-white hover:bg-stone-200 text-black font-bold p-3 rounded-xl transition-colors flex items-center justify-center gap-2">
          Sign in with Google
        </button>
      </div>
    </div>
  );
}
