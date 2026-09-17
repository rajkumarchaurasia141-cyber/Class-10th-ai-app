import React, { useState, useRef, useEffect } from 'react';
import { cleanAsterisksAndFormat } from '../utils/notesFormatter';
import { exportToPrintablePdf } from '../utils/exportToPdf';
import {
  Sparkles,
  Send,
  HeartHandshake,
  Compass,
  Clock,
  BookOpen,
  Award,
  Zap,
  RefreshCw,
  Copy,
  Check,
  Download,
  Smile,
  ShieldCheck,
} from 'lucide-react';

interface Message {
  id: string;
  sender: 'user' | 'model';
  text: string;
  timestamp: string;
}

const MOTIVATION_PROMPTS = [
  {
    icon: '🎯',
    title: '90%+ टॉपर टाइम टेबल',
    prompt: 'मुझे बिहार बोर्ड 10वीं में 90%+ अंक लाने के लिए अंतिम महीनों का एक व्यावहारिक दैनिक टाइम-टेबल (Daily Study Routine) और रिविजन रणनीति बताएं।',
  },
  {
    icon: '⚡',
    title: 'पढ़ाई में मन न लगना और आलस',
    prompt: 'सर, मेरा पढ़ाई में मन नहीं लग रहा है, जल्दी थक जाता हूँ और आलस आता है। मुझे एकाग्रता (Focus) बढ़ाने और तुरंत खुद को प्रेरित करने के व्यावहारिक उपाय बताएं।',
  },
  {
    icon: '✍️',
    title: 'बोर्ड कॉपी में पूरे 100 अंक कैसे पाएं?',
    prompt: 'बिहार बोर्ड 10वीं की परीक्षा कॉपी (Answer Sheet) लिखते समय किन-किन बातों का ध्यान रखना चाहिए ताकि परीक्षक एक भी नंबर न काटे?',
  },
  {
    icon: '🧠',
    title: 'कठिन सूत्र व तारीखें याद रखने की तकनीक',
    prompt: 'गणित के त्रिकोणमिति सूत्र, विज्ञान के समीकरण और इतिहास की महत्वपूर्ण तारीखें आसानी से याद रखने की आसान वैज्ञानिक तकनीक क्या है?',
  },
  {
    icon: '🛡️',
    title: 'परीक्षा के डर और तनाव से मुक्ति',
    prompt: 'मुझे बोर्ड परीक्षा को लेकर बहुत ज्यादा डर और घबराहट हो रही है कि कहीं प्रश्न कठिन न आ जाएं। कृपया मेरा मनोबल बढ़ाएं।',
  },
  {
    icon: '⭕',
    title: 'OMR शीट भरने के नियम',
    prompt: 'बिहार बोर्ड के वस्तुनिष्ठ प्रश्नों में OMR शीट भरते समय किन सावधानियों का पालन करना चाहिए ताकि रिजल्ट पेंडिंग न हो?',
  },
];

export const StudentMentorAI: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'model',
      text: `नमस्ते प्रिय विद्यार्थी! मैं आपका Google AI शिक्षा व प्रेरणा साथी हूँ।

बिहार बोर्ड (BSEB) 10वीं परीक्षा आपकी मेहनत और सपनों को साकार करने का सुनहरा अवसर है। 

आप मुझसे बिना किसी झिझक के:
• पढ़ाई से जुड़ा कोई भी कठिन डाउट या सवाल पूछ सकते हैं
• जब मन उदास हो, परीक्षा का डर लगे तो प्रेरणा (Motivation) ले सकते हैं
• टॉपर टाइम टेबल, रिविजन प्लान और बोर्ड कॉपी लिखने की सही तकनीक सीख सकते हैं

बताइए, आज मैं आपकी क्या सहायता कर सकता हूँ?`,
      timestamp: 'अभी',
    },
  ]);

  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputQuery).trim();
    if (!query || loading) return;

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString('hi-IN', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setLoading(true);

    try {
      const res = await fetch('/api/gemini/mentor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          history: messages.slice(-6).map((m) => ({ sender: m.sender, text: m.text })),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'AI गुरु से संपर्क में क्षणिक बाधा आई।');
      }

      const botMsg: Message = {
        id: `m-${Date.now()}`,
        sender: 'model',
        text: cleanAsterisksAndFormat(data.reply),
        timestamp: new Date().toLocaleTimeString('hi-IN', { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      const errorMsg: Message = {
        id: `err-${Date.now()}`,
        sender: 'model',
        text: `क्षमा करें, आपके प्रश्न का उत्तर प्राप्त करने में क्षणिक बाधा आई। कृपया पुनः पूछें। (${err.message || ''})`,
        timestamp: 'त्रुटि',
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(cleanAsterisksAndFormat(text));
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExportChatPdf = () => {
    let html = '';
    messages.forEach((m) => {
      const isBot = m.sender === 'model';
      html += `
        <div style="margin-bottom: 18px; padding: 12px 16px; border-radius: 8px; background: ${isBot ? '#fffbeb' : '#f5f5f4'}; border-left: 4px solid ${isBot ? '#d97706' : '#78716c'};">
          <div style="font-size: 10pt; font-weight: 700; color: ${isBot ? '#92400e' : '#44403c'}; margin-bottom: 4px;">
            ${isBot ? '🎓 Google AI शिक्षा व प्रेरणा साथी' : '🧑‍🎓 छात्र का प्रश्न'} • ${m.timestamp}
          </div>
          <div style="font-size: 12pt; color: #1c1917; line-height: 1.7; white-space: pre-line;">
            ${cleanAsterisksAndFormat(m.text)}
          </div>
        </div>
      `;
    });

    exportToPrintablePdf({
      title: 'Google AI शिक्षा, डाउट समाधान एवं प्रेरणा संवाद',
      subtitle: 'बिहार बोर्ड (BSEB) कक्षा 10वीं • विशेष छात्र परामर्श व प्रेरणा संकलन',
      badge: 'BSEB 10वीं छात्र परामर्श व मार्गदर्शन',
      contentHtml: html,
    });
  };

  return (
    <div className="space-y-4">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-950/70 via-stone-900 to-amber-950/70 border border-amber-500/30 rounded-2xl p-5 sm:p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Google AI समर्थित विशेष छात्र परामर्श व शिक्षा केंद्र</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white flex items-center gap-2">
              <HeartHandshake className="w-6 h-6 text-amber-400" />
              <span>Google AI शिक्षा व प्रेरणा साथी (Zero-Doubt & Motivation)</span>
            </h2>
            <p className="text-xs sm:text-sm text-stone-300 max-w-2xl leading-relaxed">
              कोई भी संशय मन में न रखें! पढ़ाई में मन न लगे, परीक्षा का तनाव हो, या किसी विषय का कोई कठिन सवाल—यहाँ बेझिझक पूछें और सकारात्मक, प्रेरक समाधान पाएं।
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleExportChatPdf}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 hover:text-white border border-stone-700 text-xs font-bold transition-all shadow-sm"
              title="परामर्श संवाद को PDF में सेव करें"
            >
              <Download className="w-4 h-4 text-amber-400" />
              <span>संवाद PDF डाउनलोड</span>
            </button>
            <button
              onClick={() => {
                setMessages([
                  {
                    id: 'welcome-reset',
                    sender: 'model',
                    text: `बातचीत रीसेट हो गई है। प्रिय विद्यार्थी, आप अपना कोई भी नया डाउट या समस्या बेझिझक पूछ सकते हैं।`,
                    timestamp: 'अभी',
                  },
                ]);
              }}
              className="p-2 rounded-xl bg-stone-850 hover:bg-stone-800 text-stone-400 hover:text-stone-200 border border-stone-800 transition-colors"
              title="नया संवाद प्रारंभ करें"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Suggested Motivation & Doubts Chips */}
      <div className="bg-stone-900 border border-stone-800 rounded-xl p-3.5">
        <div className="text-xs text-stone-400 font-bold mb-2 flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <span>छात्रों द्वारा अक्सर पूछे जाने वाले प्रमुख प्रश्न (एक क्लिक में पूछें):</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {MOTIVATION_PROMPTS.map((p, idx) => (
            <button
              key={idx}
              id={`quick-prompt-${idx}`}
              onClick={() => handleSendMessage(p.prompt)}
              disabled={loading}
              className="text-left p-2.5 rounded-lg bg-stone-850 hover:bg-stone-800 border border-stone-800 hover:border-amber-500/40 text-xs text-stone-200 transition-all flex items-start gap-2 group disabled:opacity-50 cursor-pointer"
            >
              <span className="text-base shrink-0">{p.icon}</span>
              <div className="min-w-0">
                <div className="font-bold text-amber-300 group-hover:text-amber-200">
                  {p.title}
                </div>
                <div className="text-stone-400 line-clamp-1 mt-0.5 text-[11px]">
                  {p.prompt}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Chat Stream */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden shadow-xl flex flex-col h-[520px]">
        {/* Messages list */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
          {messages.map((m) => {
            const isBot = m.sender === 'model';
            return (
              <div
                key={m.id}
                className={`flex gap-3 ${isBot ? 'justify-start' : 'justify-end'}`}
              >
                {isBot && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-stone-950 font-bold flex items-center justify-center shrink-0 shadow-md text-xs">
                    गुरु
                  </div>
                )}

                <div
                  className={`max-w-2xl rounded-2xl p-4 space-y-2 ${
                    isBot
                      ? 'bg-stone-850 border border-stone-800 text-stone-100 rounded-tl-sm'
                      : 'bg-amber-500 text-stone-950 font-medium rounded-tr-sm shadow-md'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3 text-xs opacity-75 border-b border-black/10 pb-1">
                    <span className="font-bold">
                      {isBot ? '🎓 Google AI शिक्षा व प्रेरणा साथी' : '🧑‍🎓 आप'}
                    </span>
                    <span>{m.timestamp}</span>
                  </div>

                  <div className="text-xs sm:text-sm leading-relaxed whitespace-pre-line">
                    {cleanAsterisksAndFormat(m.text)}
                  </div>

                  {isBot && (
                    <div className="pt-1 flex items-center justify-end gap-1">
                      <button
                        onClick={() => handleCopyMessage(m.id, m.text)}
                        className="p-1 rounded text-stone-400 hover:text-stone-200 text-xs flex items-center gap-1 transition-colors"
                        title="उत्तर कॉपी करें"
                      >
                        {copiedId === m.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span className="text-[10px] text-emerald-400">कॉपी हुआ</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span className="text-[10px]">कॉपी</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>

                {!isBot && (
                  <div className="w-8 h-8 rounded-full bg-stone-700 text-stone-200 font-bold flex items-center justify-center shrink-0 text-xs">
                    छात्र
                  </div>
                )}
              </div>
            );
          })}

          {loading && (
            <div className="flex gap-3 justify-start items-center">
              <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 font-bold flex items-center justify-center shrink-0 animate-pulse text-xs">
                गुरु
              </div>
              <div className="bg-stone-850 border border-stone-800 rounded-2xl px-4 py-3 text-stone-300 text-xs flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-amber-400 animate-bounce"></div>
                <div
                  className="w-2 h-2 rounded-full bg-amber-400 animate-bounce"
                  style={{ animationDelay: '0.2s' }}
                ></div>
                <div
                  className="w-2 h-2 rounded-full bg-amber-400 animate-bounce"
                  style={{ animationDelay: '0.4s' }}
                ></div>
                <span className="ml-1 text-stone-400 font-medium">
                  AI गुरु सोच रहे हैं और समाधान तैयार कर रहे हैं...
                </span>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-3 sm:p-4 bg-stone-950 border-t border-stone-800">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              id="mentor-chat-input"
              type="text"
              placeholder="कोई भी सवाल, पढ़ाई का डाउट या अपनी चिंता बेझिझक यहाँ लिखें..."
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              disabled={loading}
              className="flex-1 bg-stone-900 border border-stone-700 rounded-xl px-4 py-3 text-xs sm:text-sm text-white placeholder-stone-500 focus:outline-none focus:border-amber-500 transition-colors disabled:opacity-50"
            />
            <button
              id="mentor-chat-send-btn"
              type="submit"
              disabled={!inputQuery.trim() || loading}
              className="px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-stone-950 font-bold text-xs sm:text-sm flex items-center gap-2 transition-all shadow-md shadow-amber-500/10 cursor-pointer shrink-0"
            >
              <span>पूछें</span>
              <Send className="w-4 h-4" />
            </button>
          </form>
          <div className="flex items-center justify-between text-[11px] text-stone-500 mt-2 px-1">
            <span>💡 टिप: गणित, विज्ञान या किसी भी विषय का नाम लिखकर पूछें।</span>
            <span className="hidden sm:inline">100% शुद्ध हिंदी माध्यम • धैर्यवान एवं प्रेरक शिक्षक</span>
          </div>
        </div>
      </div>
    </div>
  );
};
