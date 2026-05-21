// app/api/chat/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { GEMINI_CONFIG, RATE_LIMIT, UI_TEXT } from '@/constants/index';
import { ChatContext } from '@/types/index';

// In-memory rate limiter (replace with Vercel KV in production)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

/**
 * Check rate limit for user
 */
function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const userLimit = rateLimitStore.get(userId);

  if (!userLimit || userLimit.resetTime < now) {
    rateLimitStore.set(userId, {
      count: 1,
      resetTime: now + 60 * 1000, // 1 minute
    });
    return true;
  }

  if (userLimit.count < RATE_LIMIT.REQUESTS_PER_MINUTE) {
    userLimit.count++;
    return true;
  }

  return false;
}

/**
 * POST /api/chat - Stream AI responses using Google Gemini 1.5 Flash
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, courseId, chapterId, userId, chapterTitle, previousMessages, locale } = body as ChatContext & {
      message: string;
      locale?: string;
    };

    // Validate required fields
    if (!message || !userId || !courseId || !chapterId) {
      return NextResponse.json(
        { error: 'Missing required fields', success: false },
        { status: 400 }
      );
    }

    // Check rate limit
    if (!checkRateLimit(userId)) {
      return NextResponse.json(
        { error: UI_TEXT.ERRORS.RATE_LIMIT, success: false },
        { status: 429 }
      );
    }

    // Initialize Gemini client
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) {
      console.error('Missing GOOGLE_GENERATIVE_AI_API_KEY');
      return NextResponse.json(
        { error: 'Service configuration error', success: false },
        { status: 500 }
      );
    }

    const client = new GoogleGenerativeAI(apiKey);
    const model = client.getGenerativeModel({ model: GEMINI_CONFIG.MODEL });

    // Build conversation context
    const conversationHistory = (previousMessages || [])
      .slice(-10)
      .map((msg: any) => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }],
      }));

    // Build locale-aware system prompt
    const systemPrompts: Record<string, string> = {
      fr: `Tu es un mentor IA expert en programmation et technologies. Tu aides les étudiants à apprendre.

Contexte du cours:
- Chapitre: ${chapterTitle}
- Cours ID: ${courseId}

Instructions:
1. Réponds TOUJOURS en français
2. Sois pédagogue, bienveillant et patient
3. Fournis des explications claires avec des exemples concrets
4. Si la question n'est pas liée au contenu du cours, oriente poliment vers le sujet
5. Encourage l'étudiant dans son apprentissage
6. Pour le code, utilise des blocs de code avec la syntaxe appropriée`,

      en: `You are an AI programming and technology mentor. You help students learn.

Course context:
- Chapter: ${chapterTitle}
- Course ID: ${courseId}

Instructions:
1. Always respond in English
2. Be pedagogical, encouraging, and patient
3. Provide clear explanations with concrete examples
4. If the question is unrelated to the course, politely redirect
5. Encourage the student's learning journey
6. For code, use proper code blocks with syntax`,

      ar: `أنت مرشد ذكاء اصطناعي متخصص في البرمجة والتكنولوجيا. تساعد الطلاب على التعلم.

سياق الدورة:
- الفصل: ${chapterTitle}
- معرف الدورة: ${courseId}

التعليمات:
1. أجب دائمًا باللغة العربية
2. كن تعليميًا ومشجعًا وصبورًا
3. قدم شروحات واضحة مع أمثلة ملموسة
4. إذا كان السؤال غير متعلق بمحتوى الدورة، وجّه الطالب بلطف
5. شجع الطالب في رحلة تعلمه
6. بالنسبة للكود، استخدم كتل الكود المناسبة`,
    };

    const systemPrompt = systemPrompts[locale || 'fr'] || systemPrompts['en'];

    // Create streaming response
    const encodedStream = new ReadableStream({
      async start(controller) {
        try {
          const response = await model.generateContentStream({
            contents: [
              ...conversationHistory,
              {
                role: 'user',
                parts: [{ text: message }],
              },
            ],
            systemInstruction: systemPrompt,
            generationConfig: {
              maxOutputTokens: GEMINI_CONFIG.MAX_TOKENS,
              temperature: GEMINI_CONFIG.TEMPERATURE,
              topP: GEMINI_CONFIG.TOP_P,
            },
          });

          // Stream response chunks
          for await (const chunk of response.stream) {
            const text = chunk.text();
            if (text) {
              controller.enqueue(new TextEncoder().encode(text));
            }
          }

          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    });

    return new NextResponse(encodedStream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (error) {
    console.error('Chat API error:', error);

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Internal server error',
        success: false,
      },
      { status: 500 }
    );
  }
}

/**
 * Handle OPTIONS for CORS
 */
export async function OPTIONS() {
  return NextResponse.json({}, { status: 204 });
}
