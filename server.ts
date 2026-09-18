import express, { Request, Response } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import { getAccurateDoubtAnswer } from './src/utils/doubtKnowledgeEngine';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Lazy initialization for Google GenAI SDK
  let aiClient: GoogleGenAI | null = null;
  function getAI(): GoogleGenAI | null {
    const key = process.env.GEMINI_API_KEY;
    // Valid Google Gemini API keys start with 'AIza'
    if (!key || !key.startsWith('AIza')) {
      return null;
    }
    if (!aiClient) {
      aiClient = new GoogleGenAI({ apiKey: key });
    }
    return aiClient;
  }

  // Health check
  app.get('/api/health', (_req: Request, res: Response) => {
    const key = process.env.GEMINI_API_KEY;
    res.json({
      status: 'ok',
      hasGeminiKey: Boolean(key && key.startsWith('AIza'))
    });
  });

  // API endpoint for BSEB Class 10 Doubt Solver
  app.post('/api/ask-doubt', async (req: Request, res: Response) => {
    try {
      const { question, history = [] } = req.body;

      if (!question || typeof question !== 'string' || !question.trim()) {
        return res.status(400).json({ error: 'प्रश्न (question) आवश्यक है।' });
      }

      const cleanQuestion = question.trim();
      const ai = getAI();

      if (!ai) {
        // High quality BSEB knowledge engine if GEMINI_API_KEY is not configured
        const fallbackReply = getAccurateDoubtAnswer(cleanQuestion);
        return res.json({ answer: fallbackReply });
      }

      const systemInstruction = `आप "पढ़ेगा बिहार (टॉपर बैच 2027)" के कक्षा 10वीं (BSEB - Bihar School Examination Board) के सर्वश्रेष्ठ, अत्यधिक अनुभवी और स्नेही शिक्षक एवं AI डाउट सॉल्वर हैं।

आपका मुख्य लक्ष्य:
विद्यार्थी के किसी भी प्रश्न (सभी विषय: संस्कृत, हिन्दी, गणित, विज्ञान, सामाजिक विज्ञान, अंग्रेजी, व्याकरण, सामान्य अनुवाद या पढ़ाई से जुड़े संदेह) का एकदम सटीक, स्पष्ट, सरल एवं उच्च अंक दिलाने वाला उत्तर तुरंत देना।

निर्देश:
1. प्रश्न का सीधा और सटीक उत्तर सबसे पहले दें। कोई टालमटोल या गोलमोल बात न करें।
2. भाषा: शुद्ध, सरल और विद्यार्थी-मित्रवत हिंदी (यदि छात्र ने अंग्रेजी/अनुवाद पूछा है तो अंग्रेजी शब्द + हिंदी अर्थ दोनों दें)।
3. उदाहरण:
   - यदि छात्र पूछे: "आदमी को english me kya kahate hai"
     उत्तर: आदमी को English में **Man** (एकवचन) और बहुवचन में **Men** कहते हैं। सामान्य व्यक्ति के संदर्भ में **Person** या **Human Being** भी कहा जाता है। उदाहरण: The man is working (वह आदमी काम कर रहा है)।
   - यदि छात्र पूछे: "मंगलम पाठ के लेखक"
     उत्तर: **मङ्गलम् पाठ के रचनाकार महर्षि वेदव्यास (कृष्णद्वैपायन वेदव्यास) हैं।** यह पाठ उपनिषदों से संकलित है, जिसमें 4 प्रमुख उपनिषदों (ईशावास्य, कठ, मुण्डक, श्वेताश्वतर) से 5 मन्त्र लिए गए हैं।
   - यदि गणित/विज्ञान का सवाल हो: सूत्र, चरणबद्ध (step-by-step) हल और मुख्य बिंदु लिखें।
4. बिहार बोर्ड 2027 की परीक्षा में आने वाले VVI पॉइंट्स या ट्रिक्स को आवश्यकतानुसार संक्षेप में हाइलाइट करें।
5. उत्तर व्यवस्थित, पठनीय (bullet points, bold text) और टू-द-पॉइंट रखें।`;

      // Build conversation contents including short history if available
      const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

      if (Array.isArray(history) && history.length > 0) {
        // take last 4 messages for context
        const recentHistory = history.slice(-4);
        for (const item of recentHistory) {
          if (item && item.text) {
            contents.push({
              role: item.sender === 'user' ? 'user' : 'model',
              parts: [{ text: String(item.text) }]
            });
          }
        }
      }

      contents.push({
        role: 'user',
        parts: [{ text: cleanQuestion }]
      });

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: contents as any,
        config: {
          systemInstruction,
          temperature: 0.3,
          maxOutputTokens: 1200
        }
      });

      const answerText = response.text || '';
      if (!answerText.trim()) {
        const fallbackReply = getAccurateDoubtAnswer(cleanQuestion);
        return res.json({ answer: fallbackReply });
      }

      return res.json({ answer: answerText.trim() });
    } catch (err: any) {
      // If AI service throws or is unreachable, seamlessly provide knowledge engine response
      const fallbackReply = getAccurateDoubtAnswer(req.body?.question || '');
      return res.json({ answer: fallbackReply });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
