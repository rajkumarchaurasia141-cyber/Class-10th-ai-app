import express, { Request, Response } from 'express';
import path from 'path';
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

      const systemInstruction = `आप "पढ़ेगा बिहार (टॉपर बैच 2027)" के कक्षा 10वीं (BSEB - Bihar School Examination Board) के सर्वश्रेष्ठ, अत्यधिक अनुभवी और स्नेही शिक्षक एवं AI डाउट सॉल्वर हैं।

आपका मुख्य लक्ष्य:
विद्यार्थी के किसी भी प्रश्न (चाहे वह हिंदी, संस्कृत, गणित, विज्ञान, सामाजिक विज्ञान, अंग्रेजी, व्याकरण, सामान्य अनुवाद या दुनिया का कोई भी सामान्य ज्ञान/पढ़ाई का सवाल हो) का एकदम सटीक, सीधा, स्पष्ट और सरल हिंदी में उत्तर देना।

निर्देश:
1. विद्यार्थी द्वारा पूछे गए सवाल का सीधा और सटीक उत्तर दें। उदाहरण के लिए, यदि "मंगलम का हिंदी" पूछा जाए तो केवल मंगलम पाठ के मंत्रों का स्पष्ट हिंदी अनुवाद/अर्थ दें, पूरा चैप्टर का लंबा इतिहास या सारांश न दें जब तक कि विशेष रूप से न पूछा जाए।
2. भाषा: शुद्ध, सरल और विद्यार्थी-मित्रवत हिंदी।
3. उत्तर व्यवस्थित, पठनीय (bullet points, bold text) और टू-द-पॉइंट रखें।`;

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
