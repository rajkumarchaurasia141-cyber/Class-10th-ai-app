import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, Sparkles, User, Bot, PhoneCall, HelpCircle, CheckCircle2, RotateCcw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getAccurateDoubtAnswer } from '../utils/doubtKnowledgeEngine';

function FormattedBotMessage({ text }: { text: string }) {
  const lines = text.split('\n');
  return (
    <div className="space-y-1">
      {lines.map((line, lIdx) => {
        if (!line.trim()) {
          return <div key={lIdx} className="h-1.5" />;
        }
        const parts = line.split(/(\*\*.*?\*\*)/g);
        return (
          <p key={lIdx} className="leading-relaxed">
            {parts.map((part, pIdx) => {
              if (part.startsWith('**') && part.endsWith('**')) {
                return (
                  <strong key={pIdx} className="font-bold text-stone-900">
                    {part.slice(2, -2)}
                  </strong>
                );
              }
              return <span key={pIdx}>{part}</span>;
            })}
          </p>
        );
      })}
    </div>
  );
}

export function DoubtChatView({ onOpenVip }: { onOpenVip: () => void }) {
  const { user, isVIP } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'bot' | 'teacher'; text: string; time: string }>>([
    {
      sender: 'bot',
      text: `नमस्ते ${user?.name || 'विद्यार्थी'}! मैं आपका 10th BSEB डाउट असिस्टेंट हूँ। आप किसी भी विषय (संस्कृत, विज्ञान, गणित, सामाजिक विज्ञान, हिंदी, अंग्रेजी) का कोई भी प्रश्न या संदेह यहाँ पूछ सकते हैं।`,
      time: 'अभी'
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const quickQuestions = [
    'मङ्गलम् पाठ के रचनाकार कौन हैं?',
    'सत्यमेव जयते किस उपनिषद से है?',
    'प्रकाश के परावर्तन के नियम क्या हैं?',
    'द्विघात समीकरण का सूत्र बताएं'
  ];

  const handleSend = async (textToSend?: string) => {
    const q = (textToSend || input).trim();
    if (!q) return;

    const userMsg = {
      sender: 'user' as const,
      text: q,
      time: new Date().toLocaleTimeString('hi-IN', { hour: '2-digit', minute: '2-digit' })
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    if (!textToSend) setInput('');
    setIsTyping(true);

    try {
      const res = await fetch('/api/ask-doubt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          question: q,
          history: newMessages.slice(-4)
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data && data.answer) {
          setMessages((prev) => [
            ...prev,
            {
              sender: 'bot' as const,
              text: data.answer,
              time: new Date().toLocaleTimeString('hi-IN', { hour: '2-digit', minute: '2-digit' })
            }
          ]);
          setIsTyping(false);
          return;
        }
      }
      throw new Error('Fallback required');
    } catch (err) {
      // Local knowledge engine fallback so user always gets an accurate answer
      const reply = getAccurateDoubtAnswer(q);

      setMessages((prev) => [
        ...prev,
        {
          sender: 'bot' as const,
          text: reply,
          time: new Date().toLocaleTimeString('hi-IN', { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] max-w-lg mx-auto bg-slate-50 border-x border-slate-200">
      {/* Top Bar */}
      <div className="bg-white border-b border-slate-200 p-3.5 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-red-600 to-amber-600 text-white flex items-center justify-center font-bold shadow-sm">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-stone-900 text-sm leading-tight flex items-center gap-1.5">
              <span>BSEB डाउट सॉल्वर</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            </h3>
            <p className="text-[11px] text-stone-500">24x7 ऑनलाइन शिक्षक सहायता</p>
          </div>
        </div>

        <a
          href="https://whatsapp.com"
          target="_blank"
          rel="noopener noreferrer"
          className="px-3 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1 shadow-sm transition-all"
        >
          <MessageCircle className="w-3.5 h-3.5" />
          <span>WhatsApp शिक्षक</span>
        </a>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed shadow-xs ${
                m.sender === 'user'
                  ? 'bg-red-700 text-white rounded-br-none'
                  : 'bg-white text-stone-800 border border-slate-200 rounded-bl-none'
              }`}
            >
              {m.sender === 'user' ? (
                <p className="whitespace-pre-line">{m.text}</p>
              ) : (
                <FormattedBotMessage text={m.text} />
              )}
            </div>
            <span className="text-[9px] text-stone-400 mt-1 px-1">{m.time}</span>
          </div>
        ))}

        {isTyping && (
          <div className="flex items-center gap-1.5 text-xs text-stone-400 p-2 bg-white rounded-xl border border-slate-200 w-fit">
            <span className="w-2 h-2 rounded-full bg-red-600 animate-bounce"></span>
            <span className="w-2 h-2 rounded-full bg-red-600 animate-bounce delay-100"></span>
            <span className="w-2 h-2 rounded-full bg-red-600 animate-bounce delay-200"></span>
            <span className="text-[10px] ml-1">शिक्षक उत्तर लिख रहे हैं...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Questions Pills */}
      <div className="bg-white border-t border-slate-100 p-2 overflow-x-auto flex gap-1.5 scrollbar-none">
        {quickQuestions.map((q, i) => (
          <button
            key={i}
            onClick={() => handleSend(q)}
            className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-stone-700 text-[10px] font-semibold whitespace-nowrap cursor-pointer transition-colors"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-slate-200 p-2.5 flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="अपना डाउट या सवाल यहाँ लिखें..."
          className="flex-1 bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none focus:border-red-600 focus:bg-white"
        />
        <button
          onClick={() => handleSend()}
          disabled={!input.trim()}
          className="w-9 h-9 rounded-xl bg-red-700 hover:bg-red-800 disabled:opacity-50 text-white flex items-center justify-center transition-colors cursor-pointer shrink-0 shadow-sm"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
