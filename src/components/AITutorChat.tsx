import React, { useState, useRef, useEffect } from 'react';
import Markdown from 'react-markdown';
import { SubjectId, QuestionFormat, ChatMessage, Chapter } from '../types';
import { BSEB_SUBJECTS } from '../data/bsebSyllabus';
import {
  Send,
  Sparkles,
  Copy,
  Check,
  RotateCcw,
  Volume2,
  VolumeX,
  Printer,
  HelpCircle,
  ListChecks,
  FileText,
  BookOpen,
} from 'lucide-react';

interface AITutorChatProps {
  selectedSubjectId: SubjectId;
  selectedChapter: Chapter | null;
}

export const AITutorChat: React.FC<AITutorChatProps> = ({
  selectedSubjectId,
  selectedChapter,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    return [
      {
        id: 'welcome-msg',
        role: 'assistant',
        content: `नमस्ते प्रिय छात्र! 🙏\n\nमैं आपका **बिहार बोर्ड (BSEB) कक्षा 10वीं का AI शिक्षक और मार्गदर्शक** हूँ।\n\nआप मुझसे किसी भी विषय—**गणित, विज्ञान (भौतिकी, रसायन, जीवविज्ञान), सामाजिक विज्ञान, हिंदी, संस्कृत अथवा अंग्रेज़ी**—का कोई भी प्रश्न, सूत्र, प्रमेय, संख्यात्मक सवाल (Numericals) या अध्याय के नोट्स पूछ सकते हैं।\n\n**मैं आपके प्रश्नों के उत्तर इन प्रारूपों में दे सकता हूँ:**\n- 🎯 **वस्तुनिष्ठ प्रश्न (MCQ)**: 4 विकल्प, सही उत्तर व सरल व्याख्या\n- 📌 **लघु उत्तरीय उत्तर**: 2-3 अंकों के अनुसार सटीक व मुख्य बिंदुओं में\n- 🏆 **दीर्घ उत्तरीय उत्तर**: 5 अंकों के अनुसार विस्तृत, भूमिका, सूत्र, समीकरण व निष्कर्ष सहित\n- 📑 **अध्यायवार नोट्स**: संक्षिप्त परिचय, मुख्य परिभाषाएं, सूत्र एवं VVI प्रश्न\n\nबताइए, आज आप किस विषय या अध्याय की तैयारी करना चाहते हैं?`,
        timestamp: new Date().toLocaleTimeString('hi-IN', { hour: '2-digit', minute: '2-digit' }),
      },
    ];
  });

  const [inputPrompt, setInputPrompt] = useState('');
  const [selectedFormat, setSelectedFormat] = useState<QuestionFormat | 'doubt'>('doubt');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentSubject = BSEB_SUBJECTS.find((s) => s.id === selectedSubjectId) || BSEB_SUBJECTS[0];

  // Quick subject-specific prompt pills
  const samplePrompts: Record<SubjectId, string[]> = {
    maths: [
      'सिद्ध करें कि √5 एक अपरिमेय संख्या है।',
      'द्विघात सूत्र (श्रीधराचार्य नियम) से मूल कैसे ज्ञात करें?',
      'त्रिकोणमिति के सभी महत्वपूर्ण सूत्र और मान सारणी बताएं।',
      'थेल्स प्रमेय (आधारभूत समानुपातिकता प्रमेय) का कथन व प्रमाण।',
    ],
    science: [
      'प्रकाश का परावर्तन क्या है? इसके दोनों नियम स्पष्ट करें।',
      'ओम का नियम क्या है और इसे प्रयोग द्वारा कैसे सत्यापित करें?',
      'अम्ल और क्षार में प्रमुख अंतर उदाहरण सहित बताएं।',
      'मानव हृदय की संरचना और दोहरा परिसंचरण समझाइए।',
    ],
    social_science: [
      'यूरोप में राष्ट्रवाद के उदय में मेजिनी, काबूर और गैरीबाल्डी का योगदान।',
      'भारत में असहयोग आंदोलन के प्रमुख कारण और प्रभाव।',
      'लोकतंत्र में सत्ता की साझेदारी क्यों आवश्यक है?',
      'बाढ़ आपदा के मुख्य कारण और बचाव के उपाय बताएं।',
    ],
    hindi: [
      'श्रम विभाजन और जाति प्रथा पाठ का सारांश और आंबेडकर जी के विचार।',
      'दही वाली मंगम्मा कहानी का मुख्य संदेश और मंगम्मा का चरित्र-चित्रण।',
      'संधि और समास में मुख्य अंतर उदाहरण सहित स्पष्ट करें।',
      'बोर्ड परीक्षा में आवेदन पत्र और निबंध लिखने का सही प्रारूप।',
    ],
    sanskrit: [
      'मङ्गलम् पाठ के आधार पर सत्य के स्वरूप का वर्णन करें।',
      'पाटलिपुत्रवैभवम् पाठ का संक्षेप में परिचय दें।',
      'अलसकथा पाठ से हमें क्या शिक्षा मिलती है?',
      'संस्कृत में कारक-विभक्ति और प्रमुख अनुवाद के नियम बताएं।',
    ],
    english: [
      'Write the central theme of "The Pace for Living" in simple Hindi & English.',
      'Character sketch of Gillu by Mahadevi Verma.',
      'Explain Active and Passive voice rules with BSEB Board examples.',
      'How to translate Hindi sentences to English accurately?',
    ],
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (customPrompt?: string) => {
    const textToSend = customPrompt || inputPrompt.trim();
    if (!textToSend || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: textToSend,
      timestamp: new Date().toLocaleTimeString('hi-IN', { hour: '2-digit', minute: '2-digit' }),
      subjectId: selectedSubjectId,
      chapter: selectedChapter?.name,
      questionFormat: selectedFormat === 'doubt' ? undefined : (selectedFormat as QuestionFormat),
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!customPrompt) setInputPrompt('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/gemini/tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: textToSend,
          subject: currentSubject.hindiName,
          chapter: selectedChapter ? selectedChapter.name : undefined,
          format: selectedFormat === 'doubt' ? undefined : selectedFormat,
          conversationHistory: messages.slice(-4).map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'सर्वर से उत्तर प्राप्त करने में समस्या आई।');
      }

      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: data.reply,
        timestamp: new Date().toLocaleTimeString('hi-IN', { hour: '2-digit', minute: '2-digit' }),
        subjectId: selectedSubjectId,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      const errorMessage: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: `⚠️ **त्रुटि:** ${err.message || 'क्षमा करें, उत्तर प्राप्त नहीं हो सका। कृपया पुनः प्रयास करें।'}`,
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
    if ('speechSynthesis' in window) {
      if (isSpeaking === id) {
        window.speechSynthesis.cancel();
        setIsSpeaking(null);
        return;
      }
      window.speechSynthesis.cancel();
      // Strip markdown symbols for natural reading
      const cleanText = text.replace(/[#*`_$\\[\\]]/g, '').trim();
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = 'hi-IN';
      utterance.rate = 0.95;
      utterance.onend = () => setIsSpeaking(null);
      utterance.onerror = () => setIsSpeaking(null);
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(id);
    }
  };

  const handlePrint = (content: string) => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>BSEB कक्षा 10वीं अध्ययन नोट्स</title>
          <style>
            body { font-family: 'Noto Sans Devanagari', Arial, sans-serif; padding: 24px; line-height: 1.6; color: #111; }
            h1, h2, h3 { color: #854d0e; }
            pre { background: #f4f4f4; padding: 12px; border-radius: 4px; }
            hr { border: 1px solid #ddd; margin: 16px 0; }
          </style>
        </head>
        <body>
          <h2>बिहार बोर्ड (BSEB) 10वीं परीक्षा अध्ययन सामग्री</h2>
          <hr/>
          <div>${content.replace(/\n/g, '<br/>')}</div>
        </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-14rem)] min-h-[550px] bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden shadow-xl">
      {/* Top Context Bar */}
      <div className="bg-stone-850 px-4 py-2.5 border-b border-stone-800 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="font-semibold text-stone-200">
            सक्रिय विषय: <span className="text-amber-400 font-bold">{currentSubject.hindiName}</span>
          </span>
          {selectedChapter && (
            <span className="text-stone-400 bg-stone-800 px-2 py-0.5 rounded truncate max-w-[200px] sm:max-w-xs">
              {selectedChapter.name}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            id="clear-chat-btn"
            onClick={() => setMessages([messages[0]])}
            className="flex items-center gap-1 text-stone-400 hover:text-stone-200 px-2 py-1 rounded hover:bg-stone-800 transition-colors"
            title="नया वार्तालाप शुरू करें"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>नया प्रश्न</span>
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-full`}
            >
              <div className="flex items-center gap-2 mb-1 px-1 text-[11px] text-stone-500 font-medium">
                <span>{isUser ? 'आप (छात्र)' : 'बिहार बोर्ड AI शिक्षक'}</span>
                <span>•</span>
                <span>{msg.timestamp}</span>
              </div>

              <div
                className={`group relative rounded-2xl p-4 sm:p-5 max-w-[92%] sm:max-w-[85%] text-sm sm:text-base leading-relaxed ${
                  isUser
                    ? 'bg-amber-500 text-stone-950 font-medium rounded-br-none shadow-md shadow-amber-500/10'
                    : 'bg-stone-800/90 text-stone-100 border border-stone-700/60 rounded-bl-none shadow-md'
                }`}
              >
                {isUser ? (
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                ) : (
                  <div className="prose prose-invert max-w-none prose-headings:text-amber-300 prose-headings:font-bold prose-h1:text-xl prose-h2:text-lg prose-h3:text-base prose-p:my-2 prose-ul:my-2 prose-li:my-0.5 prose-strong:text-amber-200 prose-hr:my-3 prose-hr:border-stone-700">
                    <Markdown>{msg.content}</Markdown>
                  </div>
                )}

                {/* Assistant Action Bar */}
                {!isUser && (
                  <div className="mt-3 pt-3 border-t border-stone-700/60 flex items-center justify-between text-xs text-stone-400">
                    <span className="text-[11px] text-stone-400 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-400" /> BSEB 10वीं मानक
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleSpeak(msg.content, msg.id)}
                        className="p-1.5 rounded hover:bg-stone-700 text-stone-400 hover:text-stone-200"
                        title={isSpeaking === msg.id ? 'रोकें' : 'बोलकर सुनें (Text to Speech)'}
                      >
                        {isSpeaking === msg.id ? (
                          <VolumeX className="w-4 h-4 text-amber-400 animate-pulse" />
                        ) : (
                          <Volume2 className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        onClick={() => handleCopy(msg.content, msg.id)}
                        className="p-1.5 rounded hover:bg-stone-700 text-stone-400 hover:text-stone-200"
                        title="उत्तर कॉपी करें"
                      >
                        {copiedId === msg.id ? (
                          <Check className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        onClick={() => handlePrint(msg.content)}
                        className="p-1.5 rounded hover:bg-stone-700 text-stone-400 hover:text-stone-200"
                        title="प्रिंट या पीडीएफ बनाएं"
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex flex-col items-start max-w-[85%]">
            <div className="flex items-center gap-2 mb-1 px-1 text-[11px] text-stone-500 font-medium">
              <span>बिहार बोर्ड AI शिक्षक सोच रहे हैं...</span>
            </div>
            <div className="bg-stone-800/90 text-stone-300 border border-stone-700/60 rounded-2xl rounded-bl-none p-4 flex items-center gap-3">
              <div className="w-5 h-5 rounded-full border-2 border-amber-500 border-t-transparent animate-spin"></div>
              <span className="text-xs sm:text-sm font-medium">
                सरल, शुद्ध हिंदी में सटीक उत्तर व बोर्ड परीक्षा टिप्स तैयार किए जा रहे हैं...
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompts Bar */}
      <div className="px-4 py-2 bg-stone-950/60 border-t border-stone-800/80 overflow-x-auto scrollbar-none flex items-center gap-2">
        <span className="text-[11px] font-semibold text-stone-400 whitespace-nowrap">
          महत्वपूर्ण प्रश्न:
        </span>
        {(samplePrompts[selectedSubjectId] || []).map((prompt, idx) => (
          <button
            key={idx}
            id={`suggested-prompt-${idx}`}
            onClick={() => handleSend(prompt)}
            disabled={isLoading}
            className="text-xs px-2.5 py-1 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white border border-stone-700 whitespace-nowrap transition-colors flex items-center gap-1.5"
          >
            <span>{prompt}</span>
          </button>
        ))}
      </div>

      {/* Input and Format Controller */}
      <div className="p-3 sm:p-4 bg-stone-850 border-t border-stone-800">
        {/* Format Selector Pills */}
        <div className="flex items-center gap-1.5 mb-2 overflow-x-auto scrollbar-none">
          <span className="text-[11px] font-medium text-stone-400 whitespace-nowrap mr-1">
            उत्तर प्रारूप:
          </span>
          {[
            { id: 'doubt', label: 'सामान्य संदेह', icon: HelpCircle },
            { id: 'mcq', label: 'वस्तुनिष्ठ (MCQ - 4 विकल्प)', icon: ListChecks },
            { id: 'short', label: 'लघु उत्तरीय (2-3 अंक)', icon: FileText },
            { id: 'long', label: 'दीर्घ उत्तरीय (5 अंक)', icon: BookOpen },
            { id: 'notes', label: 'अध्याय के नोट्स', icon: Sparkles },
          ].map((fmt) => {
            const isSelected = selectedFormat === fmt.id;
            const Icon = fmt.icon;
            return (
              <button
                key={fmt.id}
                id={`format-btn-${fmt.id}`}
                onClick={() => setSelectedFormat(fmt.id as any)}
                type="button"
                className={`text-xs px-2.5 py-1 rounded-lg flex items-center gap-1.5 whitespace-nowrap transition-colors border ${
                  isSelected
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 font-semibold'
                    : 'bg-stone-800 text-stone-400 border-stone-700 hover:bg-stone-750'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{fmt.label}</span>
              </button>
            );
          })}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            id="ai-tutor-input"
            type="text"
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            placeholder={`${currentSubject.hindiName} से जुड़ा कोई भी प्रश्न या शंका पूछें... (जैसे: ओम का नियम, त्रिकोणमिति मान, या सारांश)`}
            disabled={isLoading}
            className="flex-1 bg-stone-950 border border-stone-700 rounded-xl px-4 py-2.5 text-sm text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
          />
          <button
            id="ai-tutor-send-btn"
            type="submit"
            disabled={!inputPrompt.trim() || isLoading}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 disabled:hover:bg-amber-500 text-stone-950 font-bold transition-all shadow-md shadow-amber-500/20"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">पूछें</span>
          </button>
        </form>
      </div>
    </div>
  );
};
