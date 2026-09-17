import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Camera,
  Image as ImageIcon,
  X,
  Sparkles,
  Copy,
  Check,
  RotateCcw,
  Volume2,
  VolumeX,
  GraduationCap,
  HelpCircle,
  AlertCircle,
  FileQuestion,
  Layers,
} from 'lucide-react';
import { SubjectId, ChatMessage } from '../types';
import { useData } from '../context/DataContext';

interface AITeacherChatbotProps {
  initialSubject?: string;
  initialChapter?: string;
}

export const AITeacherChatbot: React.FC<AITeacherChatbotProps> = ({
  initialSubject,
  initialChapter,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-msg',
      role: 'assistant',
      content: `नमस्ते प्रिय छात्र! 🙏\n\nमैं आपका **AI Teacher** हूँ। बिहार बोर्ड (BSEB) कक्षा 10वीं NCERT हिंदी माध्यम के किसी भी सवाल, गणितीय गणना, विज्ञान के समीकरण या सामाजिक विज्ञान के प्रश्नों में आपकी सहायता के लिए तैयार हूँ।\n\n📸 आप अपनी किताब या कॉपी के प्रश्न की **फोटो खींचकर** या **लिखकर** सीधे पूछ सकते हैं।\n\nबताइए, आज हम किस प्रश्न को समझें?`,
      timestamp: new Date().toLocaleTimeString('hi-IN', { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [inputPrompt, setInputPrompt] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>(initialSubject || 'गणित (Maths)');
  const [selectedChapter, setSelectedChapter] = useState<string>(initialChapter || '');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageMimeType, setImageMimeType] = useState<string>('image/jpeg');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState<string | null>(null);
  const [activeSpeechUtterance, setActiveSpeechUtterance] = useState<SpeechSynthesisUtterance | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Quick prompt chips
  const quickQuestions = [
    'सिद्ध कीजिए कि √5 एक अपरिमेय संख्या है।',
    'ओम का नियम क्या है और इसे कैसे सत्यापित करते हैं?',
    'मानव नेत्र की समंजन क्षमता से क्या अभिप्राय है?',
    'यूरोप में राष्ट्रवाद के विकास में मेजिनी का क्या योगदान था?',
    'द्विघात समीकरण 2x² - 4x + 3 = 0 के मूलों की प्रकृति बताइए।',
    'मङ्गलम् पाठ के अनुसार सत्य की विजय कैसे होती है?',
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Clean any asterisks from responses
  const cleanStars = (text: string) => {
    return text
      .replace(/\*\*\*([^*]+)\*\*\*/g, '$1')
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/\*([^*\n]+)\*/g, '$1')
      .replace(/^[\t ]*\*[\t ]+/gm, '• ')
      .replace(/\*/g, '');
  };

  // Handle Photo / Image selection
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('कृपया केवल एक चित्र (Image/Photo) फ़ाइल चुनें।');
      return;
    }

    setImageMimeType(file.type);
    const reader = new FileReader();
    reader.onload = (event) => {
      setImagePreview(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSend = async (customPrompt?: string) => {
    const textToSend = (customPrompt !== undefined ? customPrompt : inputPrompt).trim();
    if ((!textToSend && !imagePreview) || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: textToSend || '📸 [छात्र ने प्रश्न की फोटो भेजी है]',
      timestamp: new Date().toLocaleTimeString('hi-IN', { hour: '2-digit', minute: '2-digit' }),
      imageUrl: imagePreview || undefined,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputPrompt('');
    const sentImage = imagePreview;
    const sentMime = imageMimeType;
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    setIsLoading(true);

    try {
      const response = await fetch('/api/gemini/tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: textToSend,
          subject: selectedSubject,
          chapter: selectedChapter || undefined,
          imageBase64: sentImage || undefined,
          mimeType: sentMime || undefined,
          conversationHistory: messages.slice(-4).map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'AI शिक्षक से संपर्क में क्षणिक बाधा आई।');
      }

      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: cleanStars(data.reply),
        timestamp: new Date().toLocaleTimeString('hi-IN', { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      const errorMessage: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: `⚠️ क्षमा करें, उत्तर प्राप्त करने में समस्या आई: ${err.message || 'कृपया कुछ समय बाद दोबारा प्रयास करें।'}`,
        timestamp: new Date().toLocaleTimeString('hi-IN', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSpeak = (text: string, id: string) => {
    if (!('speechSynthesis' in window)) return;

    if (isSpeaking === id) {
      window.speechSynthesis.cancel();
      setIsSpeaking(null);
      return;
    }

    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[*#•]/g, '').trim();
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'hi-IN';
    utterance.rate = 0.95;

    utterance.onend = () => setIsSpeaking(null);
    utterance.onerror = () => setIsSpeaking(null);

    setIsSpeaking(id);
    setActiveSpeechUtterance(utterance);
    window.speechSynthesis.speak(utterance);
  };

  const handleResetChat = () => {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    setIsSpeaking(null);
    setMessages([
      {
        id: 'welcome-msg',
        role: 'assistant',
        content: `नमस्ते प्रिय छात्र! 🙏\n\nमैं आपका **AI Teacher** हूँ। बिहार बोर्ड (BSEB) कक्षा 10वीं के किसी भी प्रश्न का हल पूछने के लिए नीचे लिखें या **फोटो खींचकर** भेजें।`,
        timestamp: new Date().toLocaleTimeString('hi-IN', { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-160px)] min-h-[550px] max-h-[820px] bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden shadow-2xl pb-16 sm:pb-0 animate-fade-in">
      {/* Top Header */}
      <div className="bg-stone-950 px-4 py-3 border-b border-stone-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-600 flex items-center justify-center text-stone-950 font-bold shadow-md shadow-amber-500/20">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white">AI Teacher</h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                Online • Gemini AI
              </span>
            </div>
            <p className="text-xs text-stone-400">
              बिहार बोर्ड NCERT 10वीं — फोटो व टेक्स्ट डाउट समाधान
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Subject Selector */}
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="bg-stone-900 border border-stone-800 text-stone-300 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-amber-500/50"
          >
            <option value="गणित (Maths)">गणित (Maths)</option>
            <option value="विज्ञान (Science)">विज्ञान (Science)</option>
            <option value="सामाजिक विज्ञान">सामाजिक विज्ञान</option>
            <option value="हिंदी (Hindi)">हिंदी (Hindi)</option>
            <option value="संस्कृत (Sanskrit)">संस्कृत (Sanskrit)</option>
            <option value="अंग्रेज़ी (English)">अंग्रेज़ी (English)</option>
          </select>

          <button
            onClick={handleResetChat}
            className="p-2 rounded-lg bg-stone-900 hover:bg-stone-800 text-stone-400 hover:text-stone-200 border border-stone-800 transition-colors"
            title="नई बातचीत शुरू करें"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-stone-950/60">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center text-stone-950 font-bold shrink-0 mt-1 shadow-sm">
                  <GraduationCap className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                  isUser
                    ? 'bg-amber-500 text-stone-950 font-medium rounded-tr-none shadow-md shadow-amber-500/10'
                    : 'bg-stone-900 text-stone-100 border border-stone-800 rounded-tl-none shadow-sm'
                }`}
              >
                {/* Render Attached Image if user sent one */}
                {msg.imageUrl && (
                  <div className="mb-2.5 overflow-hidden rounded-xl border border-stone-800 bg-black/40">
                    <img
                      src={msg.imageUrl}
                      alt="Student question attachment"
                      className="max-h-60 w-auto object-contain rounded-lg"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                )}

                <div className="whitespace-pre-line select-text">
                  {msg.content}
                </div>

                {/* Footer of Message */}
                <div
                  className={`mt-2 pt-2 flex items-center justify-between text-[10px] ${
                    isUser ? 'text-stone-900/70 border-stone-900/20' : 'text-stone-500 border-stone-800'
                  } border-t`}
                >
                  <span>{msg.timestamp}</span>

                  {!isUser && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleSpeak(msg.content, msg.id)}
                        className="hover:text-amber-400 transition-colors p-1"
                        title="आवाज में सुनें"
                      >
                        {isSpeaking === msg.id ? (
                          <VolumeX className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                        ) : (
                          <Volume2 className="w-3.5 h-3.5" />
                        )}
                      </button>
                      <button
                        onClick={() => handleCopy(msg.content, msg.id)}
                        className="hover:text-amber-400 transition-colors p-1"
                        title="उत्तर कॉपी करें"
                      >
                        {copiedId === msg.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center text-stone-950 font-bold shrink-0 shadow-sm animate-pulse">
              <GraduationCap className="w-4 h-4" />
            </div>
            <div className="bg-stone-900 border border-stone-800 rounded-2xl rounded-tl-none p-3.5 flex items-center gap-2 text-xs text-stone-300">
              <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
              <span>AI Teacher उत्तर तैयार कर रहे हैं...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Question Chips */}
      <div className="bg-stone-950/90 px-3 py-2 border-t border-stone-800 overflow-x-auto whitespace-nowrap scrollbar-none flex gap-2">
        {quickQuestions.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(q)}
            disabled={isLoading}
            className="px-2.5 py-1 rounded-lg text-[11px] bg-stone-900 hover:bg-stone-850 text-stone-300 border border-stone-800 hover:border-amber-500/40 hover:text-amber-300 transition-all shrink-0 cursor-pointer"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Selected Image Preview Box */}
      {imagePreview && (
        <div className="bg-stone-950 px-4 py-2 border-t border-stone-800 flex items-center justify-between gap-3 animate-fade-in">
          <div className="flex items-center gap-2.5">
            <div className="relative w-12 h-12 rounded-lg border border-amber-500/50 overflow-hidden bg-black">
              <img
                src={imagePreview}
                alt="Selected question"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <span className="text-xs font-semibold text-amber-400 block">
                प्रश्न की फोटो जोड़ी गई है 📸
              </span>
              <span className="text-[10px] text-stone-400">
                भेजने पर AI शिक्षक चित्र को पढ़कर हल समझाएंगे
              </span>
            </div>
          </div>

          <button
            onClick={removeImage}
            className="p-1.5 rounded-lg bg-stone-900 hover:bg-rose-500/20 text-stone-400 hover:text-rose-300 transition-colors"
            title="फोटो हटाएं"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Input Area */}
      <div className="p-3 bg-stone-950 border-t border-stone-800">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          {/* Photo / Camera button */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageSelect}
            accept="image/*"
            capture="environment"
            className="hidden"
            id="camera-upload-input"
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
              imagePreview
                ? 'bg-amber-500 text-stone-950 border-amber-400 shadow-md shadow-amber-500/20'
                : 'bg-stone-900 text-stone-300 border-stone-800 hover:border-amber-500/50 hover:text-amber-300'
            }`}
            title="प्रश्न की फोटो खींचें या अपलोड करें"
          >
            <Camera className="w-5 h-5" />
          </button>

          {/* Text Input */}
          <input
            type="text"
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            placeholder={
              imagePreview
                ? 'फोटो के साथ कोई विशेष निर्देश लिखें (वैकल्पिक)...'
                : 'अपना सवाल यहाँ लिखें या 📸 फोटो खींचें...'
            }
            className="flex-1 bg-stone-900 border border-stone-800 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500/50 transition-colors"
          />

          {/* Send Button */}
          <button
            type="submit"
            disabled={(!inputPrompt.trim() && !imagePreview) || isLoading}
            className="p-2.5 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-bold shadow-md shadow-amber-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
            title="सेंड करें"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};
