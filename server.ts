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
      const { question, history = [], image, mimeType } = req.body;

      const qText = (question || '').trim();
      if (!qText && !image) {
        return res.status(400).json({ error: 'प्रश्न (question) या फोटो (image) आवश्यक है।' });
      }

      const ai = getAI();

      if (!ai) {
        // High quality BSEB knowledge engine if GEMINI_API_KEY is not configured
        const fallbackReply = getAccurateDoubtAnswer(qText || 'इस प्रश्न का हल दें');
        return res.json({ answer: fallbackReply });
      }

      const systemInstruction = `आप "पढ़ेगा बिहार (टॉपर बैच 2027)" के कक्षा 10वीं (BSEB - Bihar School Examination Board) के सर्वश्रेष्ठ, अत्यधिक अनुभवी और स्नेही शिक्षक एवं AI डाउट सॉल्वर हैं।

आपका मुख्य लक्ष्य:
विद्यार्थी के किसी भी प्रश्न (सभी विषय: संस्कृत, हिन्दी, गणित, विज्ञान, सामाजिक विज्ञान, अंग्रेजी, व्याकरण, सामान्य अनुवाद या पढ़ाई से जुड़े संदेह) या फोटो में दिए गए प्रश्न का एकदम सटीक, स्पष्ट, सरल एवं उच्च अंक दिलाने वाला उत्तर तुरंत देना।

निर्देश:
1. प्रश्न या फोटो में पूछे गए सवाल का सीधा और सटीक उत्तर सबसे पहले दें।
2. भाषा: शुद्ध, सरल और विद्यार्थी-मित्रवत हिंदी (यदि छात्र ने अंग्रेजी/अनुवाद पूछा है तो अंग्रेजी शब्द + हिंदी अर्थ दोनों दें)।
3. यदि गणित/विज्ञान का सवाल हो या फोटो में न्यूमेरिकल हो: सूत्र, चरणबद्ध (step-by-step) हल और मुख्य बिंदु लिखें।
4. बिहार बोर्ड 2027 की परीक्षा में आने वाले VVI पॉइंट्स या ट्रिक्स को आवश्यकतानुसार संक्षेप में हाइलाइट करें।
5. उत्तर व्यवस्थित, पठनीय (bullet points, bold text) और टू-द-पॉइंट रखें।`;

      // Build conversation contents including short history if available
      const contents: Array<any> = [];

      if (Array.isArray(history) && history.length > 0) {
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

      const userParts: Array<any> = [];
      userParts.push({ text: qText || 'इस फोटो में दिए गए प्रश्न का हल और उत्तर दें:' });

      if (image && typeof image === 'string') {
        let base64Data = image;
        let detectedMime = mimeType || 'image/jpeg';
        if (image.includes('base64,')) {
          const parts = image.split('base64,');
          detectedMime = parts[0].replace('data:', '').replace(';', '') || 'image/jpeg';
          base64Data = parts[1];
        }
        userParts.push({
          inlineData: {
            data: base64Data,
            mimeType: detectedMime
          }
        });
      }

      contents.push({
        role: 'user',
        parts: userParts
      });

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: contents as any,
        config: {
          systemInstruction,
          temperature: 0.3,
          maxOutputTokens: 1200
        }
      });

      const answerText = response.text || '';
      if (!answerText.trim()) {
        const fallbackReply = getAccurateDoubtAnswer(qText || 'इस प्रश्न का हल दें');
        return res.json({ answer: fallbackReply });
      }

      return res.json({ answer: answerText.trim() });
    } catch (err: any) {
      const fallbackReply = getAccurateDoubtAnswer(req.body?.question || 'इस प्रश्न का हल दें');
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
