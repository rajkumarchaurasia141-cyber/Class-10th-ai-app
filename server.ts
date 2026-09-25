import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import { getAccurateDoubtAnswer } from './src/utils/doubtKnowledgeEngine';
import nodemailer from 'nodemailer';

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

      const systemInstruction = `Tum Padhega Bihar ke AI Assistant ho. Tumhara naam 'Bihar Guru' hai. Tum sirf Bihar Board Class 9-10 ke Hindi, English, Science, SST padhate ho. Koi bhi baccha sawal puche toh pehle usko easy bhasha me samjhao, phir uska Bihar Board ke hisab se answer do. Faltu baat mat karo.

Guidelines for Bihar Guru:
1. Pehchan (Identity): 'Bihar Guru' (बिहार गुरु) - Padhega Bihar ka official AI Assistant.
2. Vishay (Subjects) - Bihar Board (BSEB) Class 9th aur Class 10th:
   - Hindi (गोधूलि, वर्णिका, हिंदी व्याकरण, निबंध, पत्र लेखन)
   - English (Panorama, Grammar, Tenses, Voice, Narration, Translation into English)
   - Science (भौतिकी/Physics, रसायन शास्त्र/Chemistry, जीवविज्ञान/Biology)
   - SST (सामाजिक विज्ञान: इतिहास/History, भूगोल/Geography, लोकतांत्रिक राजनीति/Civics, हमारी अर्थव्यवस्था/Economics, आपदा प्रबंधन/Disaster Management)
3. Uttar dene ka niyam (Response Format):
   Har uttar me 2 spasht bhag hone chahiye:
   **सरल भाषा में समझें (Easy Explanation):**
   (Pehle bachhe ko aasan aur aam bolchal ki bhasha me concept samjhao taaki wo turant samajh sake.)

   **बिहार बोर्ड (BSEB) परीक्षा अनुसार सटीक उत्तर:**
   (Phir Bihar Board Class 9/10 exam ke hisab se purn ank dilane wala vyavasthit, paribhasha, binduwar (bullet points), mukhya shabdon ko **bold** karte hue answer do.)
4. Faltu baat bilkul mat karo: Seedhe jawab par aao. Har baar koi formal disclaimer ya bekaar ka bhashan mat do.
5. Agar koi sawal Bihar Board Class 9-10 syllabus se bahar ka ho, toh seedhe 1 line me batayein ki tum 'Bihar Guru' ho aur sirf Class 9-10 ke Hindi, English, Science aur SST padhate ho, aur unhe in vishayon ka sawal poochhne ke liye kahein.`;

      // 1. Check if Groq API key or OpenAI API key is provided
      const groqKey = process.env.GROQ_API_KEY || process.env.OPENAI_API_KEY;
      if (groqKey) {
        try {
          const messages: Array<any> = [
            { role: 'system', content: systemInstruction }
          ];

          if (Array.isArray(history) && history.length > 0) {
            for (const h of history.slice(-4)) {
              if (h && h.text) {
                messages.push({
                  role: h.sender === 'user' ? 'user' : 'assistant',
                  content: String(h.text)
                });
              }
            }
          }

          let userContent: any = qText || 'इस प्रश्न का उत्तर दें।';
          if (image) {
            userContent = [
              { type: 'text', text: qText || 'इस चित्र में दिए गए प्रश्न का हल दें:' },
              { type: 'image_url', image_url: { url: image } }
            ];
          }

          messages.push({ role: 'user', content: userContent });

          const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${groqKey}`
            },
            body: JSON.stringify({
              model: 'llama-3.3-70b-versatile',
              messages,
              temperature: 0.3,
              max_tokens: 1200
            })
          });

          if (groqRes.ok) {
            const groqData = await groqRes.json();
            const reply = groqData.choices?.[0]?.message?.content;
            if (reply && reply.trim()) {
              return res.json({ answer: reply.trim() });
            }
          }
        } catch (groqErr) {
          console.error('Groq API error:', groqErr);
        }
      }

      // 2. Fallback / Primary with Gemini
      const ai = getAI();
      if (!ai) {
        const fallbackReply = getAccurateDoubtAnswer(qText || 'इस प्रश्न का हल दें');
        return res.json({ answer: fallbackReply });
      }

      const contents: Array<any> = [];
      if (Array.isArray(history) && history.length > 0) {
        for (const item of history.slice(-4)) {
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
        const fallbackReply = getAccurateDoubtAnswer(qText || 'इस प्रश्न का हल दें');
        return res.json({ answer: fallbackReply });
      }

      return res.json({ answer: answerText.trim() });
    } catch (err: any) {
      const fallbackReply = getAccurateDoubtAnswer(req.body?.question || 'इस प्रश्न का हल दें');
      return res.json({ answer: fallbackReply });
    }
  });

  // API endpoint to send payment notification
  app.post('/api/send-payment-notification', async (req: Request, res: Response) => {
    try {
      const { studentName, studentEmail, amount, screenshotUrl, requestId } = req.body;
      
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '465'),
        secure: true,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      const approvalLink = `${process.env.APP_URL}/admin/payments/${requestId}`;

      await transporter.sendMail({
        from: '"Padeyga Bihar Admin" <noreply@padeygabihar.com>',
        to: process.env.ADMIN_EMAIL,
        subject: `New Payment Request: ${studentName}`,
        html: `
          <h1>New Payment Request</h1>
          <p><strong>Student:</strong> ${studentName}</p>
          <p><strong>Email:</strong> ${studentEmail}</p>
          <p><strong>Amount:</strong> ₹${amount}</p>
          <p><a href="${screenshotUrl}" target="_blank">View Screenshot</a></p>
          <br>
          <a href="${approvalLink}" style="background-color: #000; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Approve or Reject Payment</a>
        `,
      });

      res.json({ success: true });
    } catch (error) {
      console.error('Email error:', error);
      res.status(500).json({ error: 'Failed to send email' });
    }
  });

  // Endpoint to permanently save Live Class to app_data.json
  app.post('/api/save-live-class', (req: Request, res: Response) => {
    try {
      const newClass = req.body;
      if (!newClass || !newClass.id || !newClass.title) {
        return res.status(400).json({ error: 'Invalid live class data' });
      }

      const paths = [
        path.join(process.cwd(), 'public', 'app_data.json'),
        path.join(process.cwd(), 'dist', 'app_data.json')
      ];

      for (const filePath of paths) {
        if (fs.existsSync(filePath)) {
          try {
            const raw = fs.readFileSync(filePath, 'utf-8');
            const data = JSON.parse(raw);
            if (!Array.isArray(data.live_classes)) {
              data.live_classes = [];
            }
            const existingIdx = data.live_classes.findIndex((c: any) => c.id === newClass.id);
            if (existingIdx >= 0) {
              data.live_classes[existingIdx] = newClass;
            } else {
              data.live_classes.unshift(newClass);
            }
            fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
          } catch (e) {
            console.error('Failed to write to file:', filePath, e);
          }
        }
      }

      res.json({ success: true, liveClass: newClass });
    } catch (err: any) {
      console.error('Save live class error:', err);
      res.status(500).json({ error: err.message });
    }
  });

  // Endpoint to permanently delete Live Class from app_data.json
  app.post('/api/delete-live-class', (req: Request, res: Response) => {
    try {
      const { id } = req.body;
      if (!id) return res.status(400).json({ error: 'ID is required' });

      const paths = [
        path.join(process.cwd(), 'public', 'app_data.json'),
        path.join(process.cwd(), 'dist', 'app_data.json')
      ];

      for (const filePath of paths) {
        if (fs.existsSync(filePath)) {
          try {
            const raw = fs.readFileSync(filePath, 'utf-8');
            const data = JSON.parse(raw);
            if (Array.isArray(data.live_classes)) {
              data.live_classes = data.live_classes.filter((c: any) => c.id !== id);
              fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
            }
          } catch (e) {
            console.error('Failed to delete from file:', filePath, e);
          }
        }
      }

      res.json({ success: true });
    } catch (err: any) {
      console.error('Delete live class error:', err);
      res.status(500).json({ error: err.message });
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
