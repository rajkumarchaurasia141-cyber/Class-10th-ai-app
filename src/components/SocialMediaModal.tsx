import React, { useState } from 'react';
import { X, MessageCircle, Send, Youtube, Phone, Copy, Check, ExternalLink, Share2, Users } from 'lucide-react';

interface SocialMediaModalProps {
  onClose: () => void;
}

export function SocialMediaModal({ onClose }: SocialMediaModalProps) {
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  const channels = [
    {
      id: 'whatsapp',
      name: 'WhatsApp स्टडी ग्रुप (10th BSEB)',
      desc: 'डेली क्लास अपडेट्स, PDF नोट्स, परीक्षा गाइडेंस एवं शिक्षक से बातचीत।',
      members: '12,500+ छात्र जुड़े हैं',
      icon: MessageCircle,
      iconColor: 'bg-emerald-500 text-white',
      borderColor: 'border-emerald-200 hover:border-emerald-400 bg-emerald-50/40',
      actionText: 'ग्रुप में जुड़ें',
      actionColor: 'bg-emerald-600 hover:bg-emerald-700 text-white',
      link: 'https://whatsapp.com'
    },
    {
      id: 'telegram',
      name: 'Telegram ऑफिशियल चैनल',
      desc: 'सभी अध्यायों के हाई-क्वालिटी हस्तलिखित PDF नोट्स और डेली क्विज़ पोल्स।',
      members: '28,000+ सब्सक्राइबर्स',
      icon: Send,
      iconColor: 'bg-sky-500 text-white',
      borderColor: 'border-sky-200 hover:border-sky-400 bg-sky-50/40',
      actionText: 'टेलीग्राम ज्वाइन करें',
      actionColor: 'bg-sky-600 hover:bg-sky-700 text-white',
      link: 'https://telegram.org'
    },
    {
      id: 'youtube',
      name: 'YouTube लाइव क्लासेस',
      desc: 'मैराथन क्लासेस, मॉडल पेपर सॉल्यूशन एवं लाइव डाउट क्लासेज वीडियो।',
      members: '1.5 लाख+ विद्यार्थी',
      icon: Youtube,
      iconColor: 'bg-red-600 text-white',
      borderColor: 'border-red-200 hover:border-red-400 bg-red-50/40',
      actionText: 'सब्सक्राइब करें',
      actionColor: 'bg-red-600 hover:bg-red-700 text-white',
      link: 'https://youtube.com'
    },
    {
      id: 'helpline',
      name: 'स्टूडेंट हेल्पलाइन & एडमिशन सपोर्ट',
      desc: 'VIP बैच एक्टिवेशन, पेमेंट सहायता एवं किसी भी तकनीकी समस्या के लिए संपर्क करें।',
      members: 'सुबह 8:00 AM से रात्रि 9:00 PM',
      icon: Phone,
      iconColor: 'bg-stone-800 text-amber-400',
      borderColor: 'border-stone-200 hover:border-stone-400 bg-stone-50',
      actionText: 'हेल्पलाइन कॉल',
      actionColor: 'bg-stone-900 hover:bg-black text-white',
      link: 'tel:919999999999'
    }
  ];

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedLink(id);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-slate-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-pink-700 via-rose-700 to-red-800 text-white p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/15 flex items-center justify-center text-pink-200 border border-white/20">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-base sm:text-lg text-white leading-tight">
                सोशल मीडिया & कम्युनिटी
              </h3>
              <p className="text-xs text-pink-200">बिहार बोर्ड 10वीं के हजारों छात्रों के साथ जुड़ें</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Channels List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {channels.map((c) => {
            const Icon = c.icon;
            return (
              <div
                key={c.id}
                className={`p-4 rounded-2xl border ${c.borderColor} transition-all shadow-xs space-y-2`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-2xl ${c.iconColor} flex items-center justify-center shadow-md shrink-0`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-stone-900 text-sm">{c.name}</h4>
                      <div className="flex items-center gap-1.5 text-[11px] text-stone-500 font-medium">
                        <Users className="w-3 h-3 text-stone-400" />
                        <span>{c.members}</span>
                      </div>
                    </div>
                  </div>

                  <a
                    href={c.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`px-3.5 py-1.5 rounded-xl ${c.actionColor} text-xs font-bold flex items-center gap-1 shadow-sm transition-all cursor-pointer shrink-0`}
                  >
                    <span>{c.actionText}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <p className="text-xs text-stone-600 leading-snug">
                  {c.desc}
                </p>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-3.5 bg-slate-50 border-t border-slate-200 text-center flex items-center justify-between">
          <span className="text-xs text-stone-500">
            किसी भी सहायता हेतु तुरंत मैसेज करें
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-stone-800 font-bold text-xs transition-colors cursor-pointer"
          >
            बंद करें
          </button>
        </div>
      </div>
    </div>
  );
}
