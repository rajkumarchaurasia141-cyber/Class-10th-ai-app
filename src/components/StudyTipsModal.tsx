import React from 'react';
import {
  X,
  Award,
  Clock,
  FileCheck,
  CheckCircle2,
  Lightbulb,
  BookOpen,
} from 'lucide-react';

interface StudyTipsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StudyTipsModal: React.FC<StudyTipsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-stone-900 border border-stone-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Modal Header */}
        <div className="p-4 sm:p-6 border-b border-stone-800 flex items-center justify-between sticky top-0 bg-stone-900/95 backdrop-blur z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base sm:text-lg">
                बिहार बोर्ड (BSEB) 10वीं परीक्षा रणनीति & टिप्स
              </h3>
              <p className="text-xs text-stone-400">
                टॉपर बनने के स्वर्णिम नियम (90%+ अंक कैसे लाएं)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-stone-800 text-stone-400 hover:text-white hover:bg-stone-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 text-sm text-stone-300">
          {/* Rule 1: OMR & Objective Strategy */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-amber-400 font-bold">
              <CheckCircle2 className="w-4 h-4" />
              <span>1. 50% वस्तुनिष्ठ (OMR) में शत-प्रतिशत अंक लाने की रणनीति</span>
            </div>
            <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm text-stone-300">
              <li>बोर्ड परीक्षा में दोगुने विकल्प (100 में से 50 प्रश्न) दिए जाते हैं।</li>
              <li>पहले 15 मिनट के रीडिंग टाइम में केवल उन्हीं 50 प्रश्नों पर पेंसिल से हल्का टिक लगाएं जिनमें आप 100% आश्वस्त हों।</li>
              <li>OMR शीट केवल नीले या काले बॉल पेन से भरें। कभी भी जेल पेन या व्हाइटनर का उपयोग न करें।</li>
            </ul>
          </div>

          {/* Rule 2: 2-3 Marks & 5 Marks Answers */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-amber-400 font-bold">
              <FileCheck className="w-4 h-4" />
              <span>2. लघु एवं दीर्घ उत्तरीय प्रश्नों की प्रस्तुति (Presentation)</span>
            </div>
            <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm text-stone-300">
              <li><strong>2-3 अंक के प्रश्न:</strong> घुमा-फिराकर लिखने की जगह बिंदुवार (Bullet Points) 3 से 4 मुख्य बिंदु और आवश्यक सूत्र लिखें।</li>
              <li><strong>5 अंक के प्रश्न:</strong> उत्तर को 4 भागों में बांटें: भूमिका (Intro), मुख्य बिंदु/प्रमाण, चित्र या समीकरण, और निष्कर्ष।</li>
              <li>विज्ञान में स्वच्छ नामांकित चित्र (Labeled Diagrams) हमेशा पेंसिल से बनाएं।</li>
              <li>गणित में प्रत्येक चरण (Step) के दाईं ओर प्रयुक्त सूत्र अवश्य लिखें (जैसे: चूँकि (a+b)² = ...)।</li>
            </ul>
          </div>

          {/* Rule 3: Time Management */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-amber-400 font-bold">
              <Clock className="w-4 h-4" />
              <span>3. परीक्षा हॉल में 3 घंटे 15 मिनट का सही समय प्रबंधन</span>
            </div>
            <div className="bg-stone-950 p-3 rounded-xl border border-stone-800 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-stone-400">शुरुआती 15 मिनट:</span>
                <span className="text-amber-300 font-medium">प्रश्न-पत्र ध्यान से पढ़ना और आसान प्रश्न चुनना</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-400">प्रथम 60 मिनट:</span>
                <span className="text-amber-300 font-medium">OMR शीट पर 50 वस्तुनिष्ठ प्रश्न हल करना</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-400">अगले 90 मिनट:</span>
                <span className="text-amber-300 font-medium">लघु उत्तरीय (2-3 अंक) एवं दीर्घ उत्तरीय (5 अंक) प्रश्न</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-400">अंतिम 15 मिनट:</span>
                <span className="text-emerald-400 font-medium">पुनरावलोकन (Revision), प्रश्न संख्या व रोल नंबर जांच</span>
              </div>
            </div>
          </div>

          {/* Subject-Wise Pro Tips */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-amber-400 font-bold">
              <Lightbulb className="w-4 h-4" />
              <span>4. विषयवार विशेष सुझाव</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-lg bg-stone-950 border border-stone-800">
                <strong className="text-blue-400 block mb-1">गणित:</strong>
                त्रिकोणमिति मान, यूक्लिड प्रमेय, थेल्स प्रमेय, और पृष्ठीय क्षेत्रफल सूत्र रोज़ दोहराएं।
              </div>
              <div className="p-2.5 rounded-lg bg-stone-950 border border-stone-800">
                <strong className="text-emerald-400 block mb-1">विज्ञान:</strong>
                ओम का नियम, प्रकाश परावर्तन, रासायनिक समीकरण संतुलन, और पाचन तंत्र/हृदय का चित्र तैयार रखें।
              </div>
              <div className="p-2.5 rounded-lg bg-stone-950 border border-stone-800">
                <strong className="text-orange-400 block mb-1">सामाजिक विज्ञान:</strong>
                यूरोप व भारत में राष्ट्रवाद, संसाधन वर्गीकरण, और आपदा प्रबंधन के सरल उपाय पढ़ें।
              </div>
              <div className="p-2.5 rounded-lg bg-stone-950 border border-stone-800">
                <strong className="text-purple-400 block mb-1">हिंदी व संस्कृत:</strong>
                गोधूलि व वर्णिका के लेखक परिचय, संधि, समास, और मंगलम्/अलसकथा पाठ के अर्थ पर ध्यान दें।
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-stone-800 bg-stone-900/90 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs sm:text-sm transition-all"
          >
            समझ गया, धन्यवाद!
          </button>
        </div>
      </div>
    </div>
  );
};
