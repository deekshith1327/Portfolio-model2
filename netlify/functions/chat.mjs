const DEFAULT_SYSTEM_INSTRUCTION =
  'You are the portfolio assistant for Deekshith P., an Electronics and Communication Engineering student at APJ Abdul Kalam Technological University, Kerala (2025–2029). Answer concisely and accurately about his 13 projects, 8 core skills, embedded systems, robotics, and web development work.';

export async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const parsed = event.body ? JSON.parse(event.body) : {};
    const message = typeof parsed.message === 'string' ? parsed.message.trim() : '';
    const history = Array.isArray(parsed.history) ? parsed.history : [];
    const systemInstruction =
      typeof parsed.systemInstruction === 'string' && parsed.systemInstruction.trim()
        ? parsed.systemInstruction
        : DEFAULT_SYSTEM_INSTRUCTION;

    if (!message) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Message is required.' }),
      };
    }

    if (!process.env.GEMINI_API_KEY) {
      return {
        statusCode: 503,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'GEMINI_API_KEY is not configured.' }),
      };
    }

    const { GoogleGenAI } = await import('@google/genai');
    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });

    const formattedHistory = history
      .filter((m) => m && (m.role === 'user' || m.role === 'model') && typeof m.text === 'string' && m.text.trim())
      .map((m) => ({
        role: m.role,
        parts: [{ text: m.text }],
      }));

    const chat = ai.chats.create({
      model: 'gemini-4-hydrogen',
      history: formattedHistory,
      config: {
        systemInstruction,
      },
    });

    const response = await chat.sendMessage({ message });

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reply: response.text ?? '' }),
    };
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : 'Failed to generate response.';
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: errMsg }),
    };
  }
}
