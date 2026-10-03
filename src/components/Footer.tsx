import React from 'react';
import { BookOpen, ShieldCheck, Mail, Info, Heart } from 'lucide-react';

interface FooterProps {
  onNavigate: (tab: string) => void;
}

export function Footer({ onNavigate }: FooterProps) {
  return (
    <footer className="w-full bg-stone-900 border-t border-stone-800 text-stone-400 py-6 px-4 pb-28 sm:pb-8 text-xs select-none">
      <div className="max-w-2xl mx-auto space-y-4 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Brand & copyright */}
        <div className="space-y-1">
          <div className="flex items-center justify-center sm:justify-start gap-2 text-white font-black text-sm tracking-tight">
            <span>BSEB</span> <span className="text-amber-400">GURU</span>
          </div>
          <p className="text-[11px] text-stone-400">
            बिहार बोर्ड कक्षा 9वीं और 10वीं (BSEB) संपूर्ण तैयारी • © 2026 BSEB GURU
          </p>
        </div>

        {/* Links to AdSense / Required Pages */}
        <div className="flex items-center gap-4 flex-wrap justify-center font-bold text-stone-300">
          <button
            type="button"
            onClick={() => onNavigate('about')}
            className="hover:text-amber-400 transition-colors cursor-pointer flex items-center gap-1"
          >
            <Info className="w-3.5 h-3.5" />
            <span>About Us</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('contact')}
            className="hover:text-amber-400 transition-colors cursor-pointer flex items-center gap-1"
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Contact Us</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('privacy')}
            className="hover:text-amber-400 transition-colors cursor-pointer flex items-center gap-1"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Privacy Policy</span>
          </button>
        </div>

      </div>
    </footer>
  );
}
