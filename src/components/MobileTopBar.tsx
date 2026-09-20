import React from 'react';
import { Menu, Bell, Crown, ShieldCheck, Mail } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface MobileTopBarProps {
  onOpenDrawer: () => void;
  onOpenNotifications: () => void;
  onOpenVip: () => void;
  onOpenAdmin: () => void;
  onOpenGmailAuth?: () => void;
  unreadCount?: number;
}

export function MobileTopBar({
  onOpenDrawer,
  onOpenNotifications,
  onOpenVip,
  onOpenAdmin,
  onOpenGmailAuth,
  unreadCount = 2
}: MobileTopBarProps) {
  const { isVIP, isAdmin, vipDetails, user } = useAuth();
  const daysLeft = vipDetails?.daysRemaining;

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/90 px-3 sm:px-4 py-2.5 flex items-center justify-between shadow-xs">
      {/* Left: Hamburger Menu Button & Brand */}
      <div className="flex items-center gap-2 min-w-0">
        <button
          onClick={onOpenDrawer}
          className="w-9 h-9 rounded-xl flex items-center justify-center text-stone-800 hover:bg-slate-100 hover:text-red-700 transition-colors cursor-pointer shrink-0"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Brand / Logo */}
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-600 to-red-800 text-white flex items-center justify-center font-black text-xs shadow-sm border border-amber-300 shrink-0">
            10th
          </div>
          <div className="leading-none min-w-0">
            <span className="text-xs sm:text-sm font-black text-stone-900 tracking-tight block truncate">
              पढ़ेगा <span className="text-red-600">बिहार</span>
            </span>
            <span className="text-[9px] font-bold text-amber-600 tracking-wider uppercase block truncate">
              टॉपर बैच 2027
            </span>
          </div>
        </div>
      </div>

      {/* Right: VIP Pill + Notifications + Admin */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        {/* VIP Button */}
        <button
          onClick={onOpenVip}
          className={`text-[11px] font-extrabold px-2.5 py-1.5 rounded-full flex items-center gap-1 transition-all cursor-pointer shadow-xs shrink-0 ${
            isVIP
              ? 'bg-amber-100 text-amber-900 border border-amber-300 hover:bg-amber-200'
              : vipDetails?.isExpired
              ? 'bg-rose-100 text-rose-800 border border-rose-300 animate-pulse'
              : 'bg-gradient-to-r from-red-600 to-amber-600 text-white hover:brightness-105 shadow-red-900/20'
          }`}
          title="VIP प्लान देखें"
        >
          <Crown className="w-3.5 h-3.5 fill-current shrink-0" />
          <span className="whitespace-nowrap">
            {isVIP
              ? daysLeft && daysLeft < 999 ? `${daysLeft}d VIP` : 'VIP Active'
              : vipDetails?.isExpired
              ? 'रिन्यू करें'
              : '₹99 VIP'}
          </span>
        </button>

        {/* Notification Bell (Matches user screenshot) */}
        <button
          onClick={onOpenNotifications}
          className="w-9 h-9 rounded-xl flex items-center justify-center text-stone-700 hover:bg-slate-100 hover:text-red-700 transition-colors relative cursor-pointer shrink-0"
          title="सूचनाएं (Notifications)"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-red-600 text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-white">
              {unreadCount}
            </span>
          )}
        </button>

        {/* Admin Link if Admin */}
        {isAdmin && (
          <button
            onClick={onOpenAdmin}
            className="w-9 h-9 rounded-xl flex items-center justify-center bg-stone-900 text-amber-400 hover:bg-black hover:text-amber-300 transition-colors cursor-pointer shrink-0 shadow-md ring-1 ring-amber-500/20"
            title="एडमिन पैनल"
          >
            <ShieldCheck className="w-5 h-5" />
          </button>
        )}

        {/* Gmail Identification / Login */}
        {onOpenGmailAuth && (
          <button
            onClick={onOpenGmailAuth}
            className={`h-8 px-2.5 rounded-xl flex items-center gap-1.5 text-xs font-black transition-all cursor-pointer shrink-0 ${
              isAdmin
                ? 'bg-gradient-to-r from-amber-500 to-amber-400 text-stone-950 hover:from-amber-400 hover:to-amber-300 ring-2 ring-amber-500/30'
                : user?.email
                ? 'bg-slate-100 text-stone-800 hover:bg-slate-200'
                : 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
            }`}
            title={user?.email ? `जीमेल: ${user.email}` : "जीमेल से पहचान करें"}
          >
            <Mail className="w-3.5 h-3.5" />
            <span className="text-[10px]">
              {isAdmin ? 'आप एडमिन हैं (सफलतापूर्वक)' : user?.email ? 'जीमेल' : 'लॉगिन'}
            </span>
          </button>
        )}
      </div>
    </header>
  );
}
