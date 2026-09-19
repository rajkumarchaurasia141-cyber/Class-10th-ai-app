import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, Bot, Mic, MicOff, Camera, Image as ImageIcon, X, Sparkles, Volume2, VolumeX } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getAccurateDoubtAnswer } from '../utils/doubtKnowledgeEngine';
import { speakHindiText, stopHindiSpeech } from '../utils/speechHelper';

function FormattedBotMessage({ text, onReadAloud }: { text: string; onReadAloud: () => void }) {
  const lines = text.split('\n');
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between pb-1 mb-1 border-b border-slate-100">
        <span className="text-[10px] font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded-md flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-red-600" /> सटीक एवं VVI उत्तर
        </span>
        <button
          onClick={onReadAloud}
          className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-stone-950 font-black rounded-lg text-[10px] flex items-center gap-1 shadow-xs cursor-pointer transition-all"
          title="उत्तर बोलकर सुनें (Read Aloud)"
        >
          <Volume2 className="w-3.5 h-3.5" /> सुनकर पढ़ें
        </button>
      </div>

      {lines.map((line, lIdx) => {
        if (!line.trim()) {
          return <div key={lIdx} className="h-1.5" />;
        }
        const parts = line.split(/(\*\*.*?\*\*)/g);
        return (
          <p key={lIdx} className="leading-relaxed text-stone-800">
            {parts.map((part, pIdx) => {
              if (part.startsWith('**') && part.endsWith('**')) {
                return (
                  <strong key={pIdx} className="font-bold text-stone-950">
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
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'bot'; text: string; time: string; image?: string }>>([
    {
      sender: 'bot',
      text: `नमस्ते ${user?.name || 'विद्यार्थी'}! मैं आपका 10th BSEB डाउट सॉल्वर हूँ। आप **लिखकर (Text)**, **बोलकर (Voice)** या **फोटो खींचकर (Camera/Image)** अपना कोई भी डाउट पूछ सकते हैं।`,
      time: 'अभी'
    }
  ]);
  const [input, setInput] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [activeSpeakingIndex, setActiveSpeakingIndex] = useState<number | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, selectedImage]);

  useEffect(() => {
    return () => {
      stopHindiSpeech();
    };
  }, []);

  const quickQuestions = [
    'मङ्गलम् पाठ के रचनाकार कौन हैं?',
    'सत्यमेव जयते किस उपनिषद से है?',
    'प्रकाश के परावर्तन के नियम क्या हैं?',
    'द्विघात समीकरण का सूत्र बताएं'
  ];

  // Speech Recognition (Bol kar poochhein)
  const handleStartListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('आपका ब्राउज़र वॉइस रिकॉर्डिंग (Speech Recognition) सपोर्ट नहीं करता है। कृपया लिखकर या फोटो खींचकर पूछें।');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'hi-IN'; // Hindi
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const speechText = event.results[0][0].transcript;
        setInput(speechText);
        setIsListening(false);
        // Automatically send question for instant answer!
        handleSend(speechText);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (e) {
      setIsListening(false);
      alert('माइक्रोफ़ोन चालू करने में त्रुटि हुई।');
    }
  };

  // Image selection handler
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSend = async (textToSend?: string) => {
    const q = (textToSend || input).trim();
    if (!q && !selectedImage) return;

    const currentImage = selectedImage;
    const userMsg = {
      sender: 'user' as const,
      text: q || (currentImage ? '📷 [फोटो आधारित डाउट]' : ''),
      time: new Date().toLocaleTimeString('hi-IN', { hour: '2-digit', minute: '2-digit' }),
      image: currentImage || undefined
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    if (!textToSend) setInput('');
    setSelectedImage(null);
    setIsTyping(true);

    try {
      const res = await fetch('/api/ask-doubt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          question: q,
          image: currentImage,
          history: newMessages.slice(-4)
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data && data.answer) {
          const answerText = data.answer;
          setMessages((prev) => [
            ...prev,
            {
              sender: 'bot' as const,
              text: answerText,
              time: new Date().toLocaleTimeString('hi-IN', { hour: '2-digit', minute: '2-digit' })
            }
          ]);
          setIsTyping(false);

          // Automatically read aloud the answer for lightning-fast voice experience!
          const newIdx = newMessages.length;
          setActiveSpeakingIndex(newIdx);
          speakHindiText(
            answerText,
            () => setActiveSpeakingIndex(newIdx),
            () => setActiveSpeakingIndex(null)
          );
          return;
        }
      }
      throw new Error('Fallback required');
    } catch (err) {
      const reply = getAccurateDoubtAnswer(q || 'गणित या विज्ञान का प्रश्न');
      const newIdx = newMessages.length;
      setMessages((prev) => [
        ...prev,
        {
          sender: 'bot' as const,
          text: reply,
          time: new Date().toLocaleTimeString('hi-IN', { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      setIsTyping(false);
      setActiveSpeakingIndex(newIdx);
      speakHindiText(
        reply,
        () => setActiveSpeakingIndex(newIdx),
        () => setActiveSpeakingIndex(null)
      );
    }
  };

  const handleSpeakMessage = (text: string, idx: number) => {
    if (activeSpeakingIndex === idx) {
      stopHindiSpeech();
      setActiveSpeakingIndex(null);
      return;
    }
    setActiveSpeakingIndex(idx);
    speakHindiText(
      text,
      () => setActiveSpeakingIndex(idx),
      () => setActiveSpeakingIndex(null)
    );
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
              <span>BSEB स्मार्ट डाउट सॉल्वर</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            </h3>
            <p className="text-[11px] text-stone-500">लिखकर, बोलकर या फोटो से तुरंत उत्तर पाएं</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => cameraInputRef.current?.click()}
            className="px-2.5 py-1 rounded-xl bg-red-50 text-red-700 hover:bg-red-100 text-xs font-bold flex items-center gap-1 transition-all cursor-pointer border border-red-200"
            title="फोटो खींचकर पूछें"
          >
            <Camera className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">कैमरा</span>
          </button>
          <a
            href="https://whatsapp.com"
            target="_blank"
            rel="noopener noreferrer"
            className="px-2.5 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1 shadow-sm transition-all"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>व्हाट्सएप</span>
          </a>
        </div>
      </div>

      {/* Hidden inputs for camera and gallery */}
      <input
        type="file"
        ref={cameraInputRef}
        accept="image/*"
        capture="environment"
        onChange={handleImageSelect}
        className="hidden"
      />
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        onChange={handleImageSelect}
        className="hidden"
      />

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed shadow-xs space-y-2 ${
                m.sender === 'user'
                  ? 'bg-red-700 text-white rounded-br-none'
                  : 'bg-white text-stone-800 border border-slate-200 rounded-bl-none'
              }`}
            >
              {m.image && (
                <img
                  src={m.image}
                  alt="Doubt photo"
                  className="w-full max-h-48 object-cover rounded-xl border border-white/20"
                />
              )}
              {m.sender === 'user' ? (
                <p className="whitespace-pre-line">{m.text}</p>
              ) : (
                <FormattedBotMessage
                  text={m.text}
                  onReadAloud={() => handleSpeakMessage(m.text, idx)}
                />
              )}

              {/* Active audio speaking indicator */}
              {activeSpeakingIndex === idx && (
                <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-900 px-2.5 py-1 rounded-xl text-[10px] font-bold">
                  <span className="w-2 h-2 rounded-full bg-red-600 animate-ping"></span>
                  <span>शिक्षक बोलकर पढ़ा रहे हैं...</span>
                </div>
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
            <span className="text-[10px] ml-1">फटाक से उत्तर तैयार हो रहा है...</span>
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

      {/* Selected Image Preview Box */}
      {selectedImage && (
        <div className="bg-stone-900 p-2.5 px-4 flex items-center justify-between border-t border-slate-200">
          <div className="flex items-center gap-3">
            <img src={selectedImage} alt="Preview" className="w-12 h-12 rounded-lg object-cover border border-stone-700" />
            <div>
              <span className="text-white text-xs font-bold block">फोटो संलग्न है (Photo Attached)</span>
              <span className="text-stone-400 text-[10px]">अब अपना सवाल लिखकर या सीधे भेजें</span>
            </div>
          </div>
          <button
            onClick={() => setSelectedImage(null)}
            className="w-7 h-7 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300 flex items-center justify-center cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Listening Indicator Bar */}
      {isListening && (
        <div className="bg-red-600 text-white px-4 py-2 flex items-center justify-between text-xs font-bold animate-pulse">
          <div className="flex items-center gap-2">
            <Mic className="w-4 h-4 animate-bounce" />
            <span>बोलिए, हम सुन रहे हैं... (Listening & Transcribing...)</span>
          </div>
          <span className="text-[10px] bg-red-700 px-2 py-0.5 rounded">बोलकर पूछें</span>
        </div>
      )}

      {/* Input Area (Text, Voice, Photo) */}
      <div className="bg-white border-t border-slate-200 p-2.5 flex items-center gap-2">
        {/* Camera / Gallery photo upload button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-stone-700 flex items-center justify-center transition-colors cursor-pointer shrink-0"
          title="गैलरी से फोटो चुनें"
        >
          <ImageIcon className="w-4 h-4 text-indigo-600" />
        </button>

        {/* Voice Speech Recognition button */}
        <button
          type="button"
          onClick={handleStartListening}
          className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
            isListening ? 'bg-red-600 text-white animate-pulse' : 'bg-slate-100 hover:bg-slate-200 text-stone-700'
          }`}
          title="बोलकर पूछें (Voice Search)"
        >
          {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-red-600" />}
        </button>

        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="अपना सवाल लिखकर या बोलकर पूछें..."
          className="flex-1 bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none focus:border-red-600 focus:bg-white"
        />

        <button
          type="button"
          onClick={() => handleSend()}
          disabled={!input.trim() && !selectedImage}
          className="w-9 h-9 rounded-xl bg-red-700 hover:bg-red-800 disabled:opacity-50 text-white flex items-center justify-center transition-colors cursor-pointer shrink-0 shadow-sm"
          title="भेजें"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
