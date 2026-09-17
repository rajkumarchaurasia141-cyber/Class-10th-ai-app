import express, { Request, Response } from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import fs from 'fs';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Lazy GoogleGenAI initialization
let aiClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error(
        "GEMINI_API_KEY पर्यावरण चर (Environment Variable) अनुपलब्ध है। कृपया AI Studio Settings में जाकर इसे सेट करें।"
      );
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

const BSEB_SYSTEM_INSTRUCTION = `आप बिहार बोर्ड (BSEB) कक्षा 10वीं के छात्रों के लिए विशेष रूप से डिज़ाइन किए गए एक उत्कृष्ट AI शिक्षक और मार्गदर्शक हैं। आपका मुख्य उद्देश्य छात्रों को बोर्ड परीक्षा की तैयारी में सर्वोत्तम सहायता प्रदान करना है।

आपकी मुख्य जिम्मेदारियाँ:
1. संपूर्ण पाठ्यक्रम कवरेज: बिहार बोर्ड (BSEB) कक्षा 10वीं के सभी विषयों—गणित (Maths), विज्ञान (Science: भौतिकी, रसायन, जीवविज्ञान), सामाजिक विज्ञान (Social Science: इतिहास, भूगोल, राजनीति विज्ञान, अर्थशास्त्र, आपदा प्रबंधन), हिंदी (गोधूलि, वर्णिका), संस्कृत (पीयूषम् एवं व्याकरण), और अंग्रेज़ी (Panorama Part 2 व Grammar) के पूरे सिलेबस पर आधारित प्रश्नों के सटीक उत्तर दें।
2. भाषा और माध्यम: सभी उत्तर, नोट्स और व्याख्या पूरी तरह से सरल, शुद्ध और स्पष्ट हिंदी माध्यम में होनी चाहिए।
3. प्रश्न-उत्तर प्रारूप:
   - वस्तुनिष्ठ (MCQs / Objective Questions): 4 विकल्प (A, B, C, D), सही उत्तर और संक्षिप्त व्याख्या।
   - लघु उत्तरीय (Short Answer): 2 से 3 अंकों के हिसाब से सटीक और मुख्य बिंदुओं में।
   - दीर्घ उत्तरीय (Long Answer): 5 अंकों के हिसाब से भूमिका, मुख्य बिंदु, सूत्र, समीकरण या उदाहरण सहित विस्तृत उत्तर।
4. विस्तृत नोट्स: जब भी छात्र किसी अध्याय के "नोट्स" मांगें, तो उसे इस क्रम में प्रस्तुत करें:
   - अध्याय का संक्षिप्त परिचय
   - सभी मुख्य परिभाषाएं और महत्वपूर्ण तथ्य
   - महत्वपूर्ण सूत्र (Formulas) और वैज्ञानिक सिद्धांत/समीकरण
   - परीक्षा की दृष्टि से अति-महत्वपूर्ण प्रश्न (VVI Questions) जिसमें प्रत्येक प्रश्न का नंबर स्पष्ट रूप से 'प्रश्न संख्या 1:', 'प्रश्न संख्या 2:' लिखा हो
5. टोन और शैली: आपकी शैली एक धैर्यवान, मददगार, मार्गदर्शक और प्रेरक शिक्षक जैसी होनी चाहिए। जटिल विषयों को आसान उदाहरणों और बुलेट पॉइंट्स के साथ समझाएं ताकि छात्र आसानी से याद रख सकें। बोर्ड परीक्षा में अधिकतम अंक लाने हेतु महत्वपूर्ण सुझाव (Exam Tips) भी अवश्य जोड़ें।
6. महत्वपूर्ण प्रारूप नियम: किसी भी परिस्थिति में स्टार चिन्हों (*, **, ***) का प्रयोग कतई न करें। शीर्षकों को 1., 2., 3. में लिखें, प्रश्नों को 'प्रश्न संख्या 1:', 'प्रश्न संख्या 2:' में लिखें, और बुलेट पॉइंट्स के लिए '•' या '1, 2, 3' का प्रयोग करें।`;

// Cache of models that recently experienced 429 quota limits or 503 unavailability
const modelCooldowns = new Map<string, number>();

/**
 * Resilient Content Generation with model fallback.
 * Prioritizes high-throughput, high-quota models (gemini-3.1-flash-lite) to avoid 20-request/day limits,
 * with immediate fallback to gemini-3.8-flash and gemini-flash-latest.
 * Automatically cools down models experiencing 429 quota exhaustion or 503 high demand spikes.
 */
async function generateWithFallback(options: {
  contents: any;
  systemInstruction?: string;
  responseMimeType?: string;
  temperature?: number;
}): Promise<string> {
  const ai = getGenAI();
  // gemini-3.1-flash-lite is lightning fast and has high quotas (avoiding the 20 req/day cap of 3.8-flash free tier)
  const candidateModels = ["gemini-3.1-flash-lite", "gemini-3.8-flash", "gemini-flash-latest"];
  const now = Date.now();

  // Filter out any models currently in cooldown
  const availableModels = candidateModels.filter((m) => {
    const cooldownUntil = modelCooldowns.get(m);
    return !cooldownUntil || now > cooldownUntil;
  });

  // If all are in cooldown, reset and try all candidate models
  const modelsToTry = availableModels.length > 0 ? availableModels : candidateModels;

  let lastError: any = null;

  for (const modelName of modelsToTry) {
    try {
      const res = await ai.models.generateContent({
        model: modelName,
        contents: options.contents,
        config: {
          systemInstruction: options.systemInstruction || BSEB_SYSTEM_INSTRUCTION,
          temperature: options.temperature ?? 0.5,
          ...(options.responseMimeType ? { responseMimeType: options.responseMimeType } : {}),
        },
      });

      if (res.text) {
        // Success: clear cooldown for this model if any existed
        modelCooldowns.delete(modelName);
        return res.text;
      }
    } catch (err: any) {
      lastError = err;
      const msg = err?.message || String(err);
      console.warn(`Model ${modelName} encountered error: ${msg.slice(0, 200)}`);
      
      // Stop trying other models if the API key itself is invalid or denied access
      if (
        err?.status === 401 ||
        err?.status === 403 ||
        msg.includes("invalid authentication credentials") ||
        msg.includes("ACCESS_TOKEN_TYPE_UNSUPPORTED") ||
        msg.includes("PERMISSION_DENIED") ||
        msg.includes("denied access")
      ) {
        throw new Error(
          "⚠️ ऐप की AI (Gemini) API Key अमान्य (Invalid) है, एक्सपायर हो गई है, या उसे ब्लॉक कर दिया गया है। कृपया AI Studio के 'Settings > Secrets' में जाकर एक नई और मान्य GEMINI_API_KEY अपडेट करें।"
        );
      }

      // If quota exhausted (429) or high demand (503), put model into cooldown for 2 minutes
      if (
        msg.includes("429") ||
        msg.includes("RESOURCE_EXHAUSTED") ||
        msg.includes("quota") ||
        msg.includes("503") ||
        msg.includes("UNAVAILABLE") ||
        msg.includes("high demand")
      ) {
        modelCooldowns.set(modelName, Date.now() + 120000);
      }

      // Proceed immediately to the next candidate model
      continue;
    }
  }

  throw lastError || new Error("सभी AI मॉडल इस समय व्यस्त हैं। कृपया कुछ क्षणों बाद पुनः प्रयास करें।");
}

// Health check
app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", service: "BSEB Class 10 AI Tutor", timestamp: new Date().toISOString() });
});

/**
 * Main Tutor Endpoint
 * Handles doubts, questions, step-by-step solutions
 */
app.post("/api/gemini/tutor", async (req: Request, res: Response) => {
  try {
    const { prompt, subject, chapter, format, conversationHistory, imageBase64, mimeType } = req.body;

    if ((!prompt || typeof prompt !== "string") && !imageBase64) {
      res.status(400).json({ error: "कृपया अपना प्रश्न लिखें या फोटो अपलोड करें।" });
      return;
    }

    let contextDirective = "";
    if (subject) contextDirective += `विषय: ${subject}। `;
    if (chapter) contextDirective += `अध्याय/शीर्षक: ${chapter}। `;
    if (format === "mcq") {
      contextDirective += `\nनिर्देश: कृपया इसे वस्तुनिष्ठ प्रश्न (MCQ) प्रारूप में 4 स्पष्ट विकल्पों (A, B, C, D), सही उत्तर तथा सरल व्याख्या के साथ प्रस्तुत करें।`;
    } else if (format === "short") {
      contextDirective += `\nनिर्देश: कृपया इसे बिहार बोर्ड के 2 से 3 अंक के लघु उत्तरीय (Short Answer) मानक के अनुरूप सटीक, संक्षिप्त और मुख्य बिंदुओं में लिखें।`;
    } else if (format === "long") {
      contextDirective += `\nनिर्देश: कृपया इसे बिहार बोर्ड के 5 अंक के दीर्घ उत्तरीय (Long Answer) मानक के अनुसार विस्तृत, भूमिका, मुख्य बिंदु, सूत्र/समीकरण/उदाहरण और निष्कर्ष सहित प्रस्तुत करें।`;
    } else if (format === "notes") {
      contextDirective += `\nनिर्देश: कृपया इस अध्याय के विस्तृत नोट्स प्रस्तुत करें जिसमें: 1. अध्याय का संक्षिप्त परिचय, 2. मुख्य परिभाषाएं व तथ्य, 3. महत्वपूर्ण सूत्र व सिद्धांत/समीकरण, 4. परीक्षा की दृष्टि से अति-महत्वपूर्ण (VVI) प्रश्न शामिल हों।`;
    }

    let promptText = "";
    if (contextDirective) {
      promptText += `[परीक्षा संदर्भ: ${contextDirective}]\n\n`;
    }
    if (Array.isArray(conversationHistory) && conversationHistory.length > 0) {
      promptText += `[पिछला वार्तालाप संदर्भ]:\n`;
      for (const msg of conversationHistory.slice(-4)) {
        promptText += `${msg.role === "user" ? "छात्र" : "शिक्षक"}: ${msg.content}\n`;
      }
      promptText += `\n[छात्र का वर्तमान प्रश्न]:\n`;
    }
    promptText += prompt || "कृपया इस चित्र में दिए गए प्रश्न / गणितीय हल / आरेख को ध्यानपूर्वक देखकर सरल और शुद्ध हिंदी में चरणबद्ध तरीके से समझाएं।";

    let contentsPayload: any;
    if (imageBase64 && typeof imageBase64 === "string") {
      const cleanData = imageBase64.replace(/^data:image\/\w+;base64,/, "");
      contentsPayload = [
        {
          inlineData: {
            mimeType: mimeType || "image/jpeg",
            data: cleanData,
          },
        },
        {
          text: promptText,
        },
      ];
    } else {
      contentsPayload = promptText;
    }

    const aiTeacherInstruction = `You are a friendly and expert Class 10th teacher for Bihar Board Hindi Medium students. Explain everything in simple Hindi, step-by-step, with examples, like a real teacher.

सख्त नियम:
1. किसी भी स्थिति में स्टार चिन्हों (*, **, ***) का प्रयोग बिल्कुल न करें। 
2. मुख्य बिंदुओं के लिए 1., 2., 3. या '•' का प्रयोग करें।
3. बिहार बोर्ड (BSEB) कक्षा 10वीं NCERT हिंदी माध्यम के पाठ्यक्रम के अनुसार 100% सही और प्रामाणिक उत्तर दें।`;

    const reply = await generateWithFallback({
      contents: contentsPayload,
      systemInstruction: aiTeacherInstruction,
      temperature: 0.5,
    });

    const cleanedReply = reply
      .replace(/\*\*\*([^*]+)\*\*\*/g, '$1')
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/\*([^*\n]+)\*/g, '$1')
      .replace(/^[\t ]*\*[\t ]+/gm, '• ')
      .replace(/\*/g, '');

    res.json({ success: true, reply: cleanedReply });
  } catch (error: any) {
    console.error("Tutor API Error:", error);
    res.status(500).json({
      error:
        error?.message ||
        "AI शिक्षक से संपर्क में क्षणिक बाधा आई। कृपया कुछ क्षण बाद पुनः प्रश्न पूछें।",
    });
  }
});

/**
 * Generate Structured Detailed Chapter Notes
 */
app.post("/api/gemini/notes", async (req: Request, res: Response) => {
  try {
    const { subject, chapter } = req.body;
    if (!subject || !chapter) {
      res.status(400).json({ error: "विषय और अध्याय आवश्यक हैं।" });
      return;
    }

    const prompt = `बिहार बोर्ड (BSEB) कक्षा 10वीं NCERT हिंदी माध्यम की पाठ्यपुस्तक के अनुसार विषय: "${subject}" के अध्याय: "${chapter}" के संपूर्ण, अत्यंत उच्च गुणवत्ता वाले और विस्तृत परीक्षा-उपयोगी नोट्स तैयार करें।

सख्त निर्देश (STRICT RULES):
1. किसी भी स्थिति में स्टार चिन्हों (*, **, ***) का प्रयोग बिल्कुल न करें। 
2. शीर्षकों के लिए 1., 2., 3. का प्रयोग करें।
3. परीक्षा प्रश्नों के लिए प्रत्येक प्रश्न का नंबर स्पष्ट रूप से 'प्रश्न संख्या 1:', 'प्रश्न संख्या 2:' (Question Numbers) लिखें।
4. मुख्य बिंदुओं के लिए बुलेट '•' या '1, 2, 3' का प्रयोग करें।

कृपया ठीक इसी क्रम में उत्तर दें:
1. NCERT अध्याय का संक्षिप्त परिचय (Chapter Introduction)
(सरल, रोचक और प्रेरणादायी भाषा में NCERT पाठ्यक्रम के अनुसार इस अध्याय का मुख्य उद्देश्य और मूल अवधारणा)

2. सभी मुख्य परिभाषाएं और महत्वपूर्ण तथ्य (Key Definitions & Facts)
(बोर्ड परीक्षा में बार-बार पूछे जाने वाले सभी पारिभाषिक शब्द, तिथियां, वैज्ञानिक नियम या मुख्य बिंदु • बुलेट में)

3. महत्वपूर्ण सूत्र (Formulas) एवं वैज्ञानिक सिद्धांत/समीकरण
(सभी आवश्यक गणितीय सूत्र, भौतिकी के नियम, रासायनिक समीकरण या व्याकरण नियम स्पष्ट और साफ तरीके से)

4. विशेष स्मरण ट्रिक्स (Memory Tricks & Shortcuts)
(इस अध्याय के सूत्रों, परिभाषाओं, समीकरणों, तिथियों या नियमों को आसानी से याद रखने की 2 से 3 देसी ट्रिक्स / शॉर्टकट ट्रिक्स / Mnemonics ताकि छात्र परीक्षा में कभी न भूलें)

5. परीक्षा की दृष्टि से अति-महत्वपूर्ण प्रश्न (VVI Questions with Answers)
प्रश्न संख्या 1 (वस्तुनिष्ठ MCQ): 4 विकल्पों और सही उत्तर की व्याख्या सहित
प्रश्न संख्या 2 (वस्तुनिष्ठ MCQ): 4 विकल्पों और सही उत्तर की व्याख्या सहित
प्रश्न संख्या 3 (लघु उत्तरीय प्रश्न - 2 से 3 अंक): सटीक और मुख्य बिंदुओं में उत्तर
प्रश्न संख्या 4 (लघु उत्तरीय प्रश्न - 2 से 3 अंक): सटीक और मुख्य बिंदुओं में उत्तर
प्रश्न संख्या 5 (दीर्घ उत्तरीय प्रश्न - 5 अंक): भूमिका, मुख्य बिंदु, समीकरण/चित्र संदर्भ और निष्कर्ष सहित विस्तृत उत्तर

6. NCERT पाठ्यपुस्तक अभ्यास के मुख्य प्रश्न एवं सही-सही उत्तर
(NCERT किताब के 2 से 3 सबसे महत्वपूर्ण अभ्यास प्रश्नों के शत-प्रतिशत सही, चरणबद्ध और शुद्ध उत्तर)

7. शिक्षक के विशेष परीक्षा टिप्स (Exam Tips)
(BSEB बोर्ड परीक्षा की कॉपी में लिखते समय छात्र पूरे अंक कैसे प्राप्त करें)`;

    const rawNotes = await generateWithFallback({
      contents: prompt,
      systemInstruction: BSEB_SYSTEM_INSTRUCTION,
      temperature: 0.35,
    });

    // Clean any asterisks that might have slipped through
    const notes = rawNotes
      .replace(/\*\*\*([^*]+)\*\*\*/g, '$1')
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/\*([^*\n]+)\*/g, '$1')
      .replace(/^[\t ]*\*[\t ]+/gm, '• ')
      .replace(/\*/g, '');

    res.json({ success: true, notes });
  } catch (error: any) {
    console.error("Notes API Error:", error);
    res.status(500).json({ error: error?.message || "नोट्स तैयार करने में समस्या आई।" });
  }
});

/**
 * Google AI Student Counselor & Motivation Mentor
 * Supports education doubts, exam anxiety, daily routine, and motivation
 */
app.post("/api/gemini/mentor", async (req: Request, res: Response) => {
  try {
    const { query, category = "general", history = [] } = req.body;
    if (!query) {
      res.status(400).json({ error: "कृपया अपना प्रश्न या संशय लिखें।" });
      return;
    }

    const mentorSystemInstruction = `आप "BSEB 10th AI गुरु एवं मार्गदर्शक" हैं - बिहार बोर्ड कक्षा 10वीं के छात्रों के एक आत्मीय, अनुभवी और प्रेरक शिक्षक व काउंसलर।
आपकी जिम्मेदारियाँ:
1. छात्रों की शिक्षा से जुड़ी किसी भी समस्या, किसी विषय के कठिन डाउट या संशय का बेझिझक, सरल और सटीक समाधान देना।
2. जब छात्र परीक्षा के डर, कम अंक, पढ़ाई में मन न लगना या तनाव की बात करें तो उन्हें वास्तविक, व्यावहारिक और ऊर्जावान प्रेरणा (Motivation) देना।
3. 90%+ अंक लाने के लिए टॉपर टाइम-टेबल, रिविजन तकनीक, और कॉपी लिखने की कला सिखाना।
4. टोन: बहुत ही आत्मीय, सम्मानजनक, सकारात्मक ("प्रिय विद्यार्थी", "आप कर सकते हैं", "घबराएं बिल्कुल नहीं")।
5. प्रारूप नियम: किसी भी परिस्थिति में स्टार चिन्हों (*, **, ***) का प्रयोग बिल्कुल न करें। शीर्षकों के लिए 1., 2., 3. या स्पष्ट अक्षरों और बुलेट के लिए '•' का प्रयोग करें।`;

    let fullPrompt = "";
    if (Array.isArray(history) && history.length > 0) {
      const pastTurns = history
        .filter((h: any) => h.text && h.id !== "welcome" && h.id !== "welcome-reset")
        .slice(-6);
      if (pastTurns.length > 0) {
        fullPrompt += "[पूर्व संवाद संदर्भ]:\n";
        for (const h of pastTurns) {
          fullPrompt += `${h.sender === "user" ? "छात्र" : "AI मार्गदर्शक"}: ${h.text}\n`;
        }
        fullPrompt += "\n[छात्र का वर्तमान प्रश्न या संशय]:\n";
      }
    }
    fullPrompt += query;

    const rawResponse = await generateWithFallback({
      contents: fullPrompt,
      systemInstruction: mentorSystemInstruction,
      temperature: 0.4,
    });

    const reply = rawResponse
      .replace(/\*\*\*([^*]+)\*\*\*/g, '$1')
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/\*([^*\n]+)\*/g, '$1')
      .replace(/^[\t ]*\*[\t ]+/gm, '• ')
      .replace(/\*/g, '');

    res.json({ success: true, reply });
  } catch (error: any) {
    console.error("Mentor API Error:", error);
    res.status(500).json({
      error: error?.message || "AI मार्गदर्शक से संपर्क करने में क्षणिक बाधा आई। कृपया पुनः प्रयास करें।",
    });
  }
});

/**
 * Dynamic MCQ Generator (Supports 5 to 50 questions)
 */
app.post("/api/gemini/quiz", async (req: Request, res: Response) => {
  try {
    const { subject, chapter, count = 10 } = req.body;
    const qCount = Math.min(Math.max(Number(count) || 5, 3), 50);

    const prompt = `बिहार बोर्ड कक्षा 10वीं के लिए विषय "${subject || 'सामान्य'}" ${chapter ? `(अध्याय: ${chapter})` : ''} से ठीक ${qCount} मानक बहुविकल्पीय प्रश्न (MCQs) तैयार करें।

नियम:
1. किसी भी स्थिति में स्टार चिन्हों (*, **) का प्रयोग न करें।
2. प्रत्येक प्रश्न में 4 स्पष्ट और प्रामाणिक विकल्प (A, B, C, D) होने चाहिए।
3. केवल और केवल वैध JSON ऐरे (Array) लौटाएं। कोई अतिरिक्त मार्कडाउन या बैक-टिक्स न लगाएं।

JSON प्रारूप:
[
  {
    "id": "q1",
    "question": "प्रश्न यहाँ लिखें?",
    "options": ["विकल्प A", "विकल्प B", "विकल्प C", "विकल्प D"],
    "correctIndex": 0,
    "explanation": "सही उत्तर की संक्षिप्त और स्पष्ट व्याख्या हिंदी में।"
  }
]`;

    const rawText = await generateWithFallback({
      contents: prompt,
      systemInstruction: `${BSEB_SYSTEM_INSTRUCTION}\nनियम: आप केवल वैध JSON ऐरे लौटाते हैं। स्टार चिन्हों (* या **) का प्रयोग कतई न करें।`,
      responseMimeType: "application/json",
      temperature: 0.3,
    });

    const cleaned = rawText
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .replace(/\*/g, "")
      .trim();
    const questions = JSON.parse(cleaned);

    res.json({ success: true, questions });
  } catch (error: any) {
    console.error("Quiz API Error:", error);
    res.status(500).json({ error: error?.message || "प्रश्नोत्तरी लोड करने में त्रुटि हुई।" });
  }
});

/**
 * AI PYQ Explainer & Generator
 */
app.post("/api/gemini/pyq-explain", async (req: Request, res: Response) => {
  try {
    const { question, subject, year, marks } = req.body;
    const prompt = `बिहार बोर्ड कक्षा 10वीं की परीक्षा (${year || 'विगत वर्ष'}, विषय: ${subject || 'सामान्य'}, अंक: ${marks || 2}) का निम्नलिखित प्रश्न है:
"${question}"

कृपया इस प्रश्न का:
1. बोर्ड परीक्षा के अनुसार आदर्श चरणबद्ध हल (Step-by-step Model Answer)
2. परीक्षक कॉपी जांचते समय किन मुख्य बिंदुओं पर पूरे अंक देते हैं (मार्किंग स्कीम)
3. इससे संबंधित आगामी परीक्षा के लिए 1 संभावित प्रश्न

नियम: स्टार चिन्हों (* या **) का प्रयोग बिल्कुल न करें। शीर्षकों और बुलेट पॉइंट्स के लिए 1., 2., 3. या '•' का प्रयोग करें।`;

    const rawAnswer = await generateWithFallback({
      contents: prompt,
      systemInstruction: BSEB_SYSTEM_INSTRUCTION,
      temperature: 0.3,
    });

    const explanation = rawAnswer
      .replace(/\*\*\*([^*]+)\*\*\*/g, '$1')
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/\*([^*\n]+)\*/g, '$1')
      .replace(/^[\t ]*\*[\t ]+/gm, '• ')
      .replace(/\*/g, '');

    res.json({ success: true, explanation });
  } catch (error: any) {
    console.error("PYQ Explain Error:", error);
    res.status(500).json({ error: error?.message || "हल प्राप्त करने में समस्या आई।" });
  }
});

/**
 * 100% Sahi Sahi NCERT Book Chapter Solutions Generator
 * In-text questions + Chapter-end exercise solutions
 */
app.post("/api/gemini/ncert-solutions", async (req: Request, res: Response) => {
  try {
    const { subject, chapter } = req.body;
    if (!subject || !chapter) {
      res.status(400).json({ error: "विषय और अध्याय आवश्यक हैं।" });
      return;
    }

    const prompt = `बिहार बोर्ड (BSEB) कक्षा 10वीं NCERT हिंदी माध्यम की आधिकारिक पाठ्यपुस्तक के अनुसार:
विषय: "${subject}"
अध्याय: "${chapter}"

कृपया इस अध्याय के पाठ्यपुस्तक के सभी मुख्य प्रश्नों (पाठ के अंदर दिए गए प्रश्न + अध्याय के अंत के अभ्यास प्रश्न) के 100% सही, शुद्ध, प्रामाणिक और चरणबद्ध उत्तर प्रस्तुत करें।

सख्त नियम (STRICT RULES):
1. किसी भी स्थिति में स्टार चिन्हों (*, **, ***) का प्रयोग बिल्कुल न करें। 
2. शीर्षकों के लिए स्पष्ट हिंदी शब्दों या 1., 2., 3. का प्रयोग करें।
3. प्रत्येक प्रश्न के लिए 'प्रश्न संख्या 1:', 'प्रश्न संख्या 2:' आदि स्पष्ट लिखें।
4. मुख्य बिंदुओं के लिए बुलेट '•' या 1., 2., 3. का प्रयोग करें।
5. उत्तर शत-प्रतिशत प्रामाणिक (Accurate), संतुलित रासायनिक समीकरण (यदि विज्ञान हो) और चरणबद्ध गणितीय हल (यदि गणित हो) के साथ होने चाहिए।

प्रारूप:
[भाग 1: NCERT पाठ के अंदर के महत्वपूर्ण प्रश्न एवं 100% सही उत्तर (In-Text Questions)]
प्रश्न संख्या 1: (प्रश्न लिखें)
हल / उत्तर: (सटीक व चरणबद्ध उत्तर)

प्रश्न संख्या 2: (प्रश्न लिखें)
हल / उत्तर: (सटीक व चरणबद्ध उत्तर)

[भाग 2: NCERT अध्याय के अंत के अभ्यास प्रश्न एवं 100% सही उत्तर (Textbook Exercise Solutions)]
प्रश्न संख्या 3: (अभ्यास का महत्वपूर्ण प्रश्न)
हल / उत्तर: (विस्तृत, बिंदुवार हल)

प्रश्न संख्या 4: (अभ्यास का 2-3 अंक वाला लघु उत्तरीय प्रश्न)
हल / उत्तर: (सटीक उत्तर)

प्रश्न संख्या 5: (अभ्यास का 5 अंक वाला दीर्घ उत्तरीय प्रश्न)
हल / उत्तर: (भूमिका, मुख्य सूत्र/समीकरण, पूर्ण हल व निष्कर्ष)

[भाग 3: NCERT महत्वपूर्ण सूत्र एवं स्मरण ट्रिक (Quick Formula & Trick)]
इस अध्याय के प्रश्नों को हल करने में काम आने वाले मुख्य सूत्र व याद रखने की शॉर्टकट ट्रिक।`;

    const rawSolutions = await generateWithFallback({
      contents: prompt,
      systemInstruction: BSEB_SYSTEM_INSTRUCTION,
      temperature: 0.25,
    });

    const solutions = rawSolutions
      .replace(/\*\*\*([^*]+)\*\*\*/g, '$1')
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/\*([^*\n]+)\*/g, '$1')
      .replace(/^[\t ]*\*[\t ]+/gm, '• ')
      .replace(/\*/g, '');

    res.json({ success: true, solutions });
  } catch (error: any) {
    console.error("NCERT Solutions Error:", error);
    res.status(500).json({ error: error?.message || "NCERT समाधान प्राप्त करने में समस्या आई।" });
  }
});

/**
 * Chapter Test Paper Generator
 * Creates an authentic chapter test with MCQs and written questions
 */
app.post("/api/gemini/chapter-test", async (req: Request, res: Response) => {
  try {
    const { subject, chapter, count = 10 } = req.body;
    const prompt = `बिहार बोर्ड (BSEB) कक्षा 10वीं NCERT हिंदी माध्यम पाठ्यक्रम के अनुसार:
विषय: "${subject}"
अध्याय: "${chapter}"

इस अध्याय का एक आधिकारिक परीक्षा टेस्ट पेपर तैयार करें जिसमें ठीक ${count} बहुविकल्पीय प्रश्न (MCQs) हों।

नियम:
1. स्टार चिन्हों (*, **) का प्रयोग बिल्कुल न करें।
2. प्रत्येक प्रश्न में 4 स्पष्ट विकल्प (A, B, C, D) हों।
3. केवल और केवल वैध JSON ऐरे लौटाएं।

JSON प्रारूप:
[
  {
    "id": "t1",
    "questionNumber": 1,
    "question": "प्रश्न यहाँ लिखें?",
    "options": ["विकल्प A", "विकल्प B", "विकल्प C", "विकल्प D"],
    "correctOptionIndex": 0,
    "marks": 1,
    "modelAnswer": "सही विकल्प का नाम",
    "explanation": "सही उत्तर की प्रामाणिक NCERT व्याख्या।"
  }
]`;

    const rawText = await generateWithFallback({
      contents: prompt,
      systemInstruction: `${BSEB_SYSTEM_INSTRUCTION}\nआप केवल वैध JSON ऐरे लौटाते हैं। स्टार चिन्हों (* या **) का प्रयोग कतई न करें।`,
      responseMimeType: "application/json",
      temperature: 0.3,
    });

    const cleaned = rawText
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .replace(/\*/g, "")
      .trim();
    const questions = JSON.parse(cleaned);

    res.json({ success: true, questions });
  } catch (error: any) {
    console.error("Chapter Test Error:", error);
    res.status(500).json({ error: error?.message || "टेस्ट पेपर तैयार करने में समस्या आई।" });
  }
});


// --- VIP Validation System ---
let db: any = null;
try {
  const fbConfig = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'firebase-applet-config.json'), 'utf8'));
  const fbApp = initializeApp(fbConfig);
  db = getFirestore(fbApp, fbConfig.firestoreDatabaseId);
} catch (e) {
  console.error("Firebase config missing or invalid", e);
}

app.post('/api/check-vip', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      res.json({ isVIP: false });
      return;
    }
    
    // Hardcoded instant fallback list
    const hardcodedVips = [
      "rajkumarchaurasia576@gmail.com",
      "rajkumarchaurasia760@gmail.com"
    ];
    
    if (hardcodedVips.includes(email.toLowerCase())) {
      res.json({ isVIP: true });
      return;
    }

    if (!db) {
      res.json({ isVIP: false });
      return;
    }
    
    // Check Firestore
    const docRef = doc(db, 'vips', email.toLowerCase());
    const snapshot = await getDoc(docRef);
    if (snapshot.exists() && snapshot.data().isVIP === true) {
      res.json({ isVIP: true });
      return;
    }
    
    res.json({ isVIP: false });
  } catch (err) {
    console.error("Error checking VIP:", err);
    res.json({ isVIP: false });
  }
});

// Admin endpoint to add VIP
app.post('/api/add-vip', async (req, res) => {
  try {
    const { email, adminKey } = req.body;
    if (adminKey !== process.env.ADMIN_SECRET_KEY) {
      res.status(403).json({ error: "Unauthorized" });
      return;
    }
    if (!email || !db) {
      res.status(400).json({ error: "Bad request or DB not configured" });
      return;
    }
    
    const docRef = doc(db, 'vips', email.toLowerCase());
    await setDoc(docRef, { email: email.toLowerCase(), isVIP: true, createdAt: new Date() });
    res.json({ success: true, message: `${email} has been unlocked!` });
  } catch (err) {
    console.error("Error adding VIP:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


// Vite middleware in dev, static files in production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`BSEB Class 10 AI Teacher Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
