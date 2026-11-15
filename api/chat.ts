import type { IncomingMessage, ServerResponse } from 'node:http';

interface VercelRequest extends IncomingMessage {
  body?: unknown;
}

interface VercelResponse extends ServerResponse {
  status?: (code: number) => VercelResponse;
  json?: (data: unknown) => void;
}

const DEFAULT_SYSTEM_INSTRUCTION =
  'You are the portfolio assistant for Deekshith P., an Electronics and Communication Engineering student at APJ Abdul Kalam Technological University, Kerala (2025–2029). Answer concisely and accurately about his 13 projects, 8 core skills, embedded systems, robotics, and web development work.';

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  const sendJson = (statusCode: number, payload: unknown) => {
    res.statusCode = statusCode;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(payload));
  };

  if (req.method !== 'POST') {
    sendJson(405, { error: 'Method not allowed' });
    return;
  }

  try {
    let parsed: Record<string, unknown> = {};
    if (req.body && typeof req.body === 'object') {
      parsed = req.body as Record<string, unknown>;
    } else if (typeof req.body === 'string' && req.body.trim()) {
      parsed = JSON.parse(req.body);
    } else {
      const rawBody = await new Promise<string>((resolve, reject) => {
        let data = '';
        req.on('data', (chunk) => {
          data += chunk.toString();
        });
        req.on('end', () => resolve(data));
        req.on('error', reject);
      });
      if (rawBody.trim()) {
        parsed = JSON.parse(rawBody);
      }
    }

    const message = typeof parsed.message === 'string' ? parsed.message.trim() : '';
    const history = Array.isArray(parsed.history) ? parsed.history : [];
    const systemInstruction =
      typeof parsed.systemInstruction === 'string' && parsed.systemInstruction.trim()
        ? parsed.systemInstruction
        : DEFAULT_SYSTEM_INSTRUCTION;

    if (!message) {
      sendJson(400, { error: 'Message is required.' });
      return;
    }

    if (!process.env.GEMINI_API_KEY) {
      sendJson(503, { error: 'GEMINI_API_KEY is not configured.' });
      return;
    }

    const { GoogleGenAI } = await import('@google/genai');
    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });

    const formattedHistory = history
      .filter(
        (m): m is { role: 'user' | 'model'; text: string } =>
          Boolean(m && (m.role === 'user' || m.role === 'model') && typeof m.text === 'string' && m.text.trim())
      )
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
    sendJson(200, { reply: response.text ?? '' });
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : 'Failed to generate response.';
    sendJson(500, { error: errMsg });
  }
}
