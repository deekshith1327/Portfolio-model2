import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig, type Plugin } from 'vite';

const rootDir = dirname(fileURLToPath(import.meta.url));

const WRAPPER_META_FILES = new Set([
  'package.json',
  'package-lock.json',
  'bun.lock',
  'bun.lockb',
  'tsconfig.json',
  'metadata.json',
  'vite.config.ts',
  'vite.config.mjs',
  'vercel.json',
  'netlify.toml',
  '.env.example',
  'README.md',
]);

const SKIP_DIRS = new Set([
  'node_modules',
  'dist',
  'build',
  '.git',
  '.aistudio',
  '.build-outputs',
  'public',
  'api',
  'netlify',
]);

function discoverHtmlInputs(
  dir: string,
  baseDir: string = dir,
  inputs: Record<string, string> = {}
): Record<string, string> {
  for (const entry of readdirSync(dir)) {
    if (SKIP_DIRS.has(entry) || entry.startsWith('.')) continue;
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) {
      discoverHtmlInputs(full, baseDir, inputs);
    } else if (entry.endsWith('.html')) {
      const rel = relative(baseDir, full).replace(/\\/g, '/');
      const key =
        rel === 'index.html'
          ? 'main'
          : rel.replace(/\.html$/, '').replace(/[^a-zA-Z0-9_]/g, '_');
      inputs[key] = full;
    }
  }
  return inputs;
}

interface ImportmapTable {
  exact: Map<string, string>;
  prefixes: Array<[string, string]>;
}

function parseImportmaps(htmlInputs: Record<string, string>): ImportmapTable {
  const exact = new Map<string, string>();
  const prefixes: Array<[string, string]> = [];
  const re = /<script\b[^>]*\btype\s*=\s*['"]importmap['"][^>]*>([\s\S]*?)<\/script>/gi;
  for (const file of Object.values(htmlInputs)) {
    try {
      const html = readFileSync(file, 'utf-8');
      let match: RegExpExecArray | null;
      while ((match = re.exec(html)) !== null) {
        const parsed = JSON.parse(match[1]);
        const imports = parsed && typeof parsed.imports === 'object' ? parsed.imports : {};
        for (const [key, val] of Object.entries(imports)) {
          if (typeof val !== 'string') continue;
          if (key.endsWith('/')) {
            prefixes.push([key, val]);
          } else {
            exact.set(key, val);
          }
        }
      }
    } catch {
      // Ignore malformed importmap blocks.
    }
  }
  return { exact, prefixes };
}

function resolveImportmapSpecifier(id: string, table: ImportmapTable): string | null {
  if (table.exact.has(id)) {
    return table.exact.get(id) ?? null;
  }
  for (const [prefix, targetPrefix] of table.prefixes) {
    if (id.startsWith(prefix)) {
      return targetPrefix + id.slice(prefix.length);
    }
  }
  return null;
}

function hoistImportmapsFirst(html: string): string {
  const importmapRe = /<script\b[^>]*\btype\s*=\s*['"]importmap['"][^>]*>[\s\S]*?<\/script>/gi;
  const blocks: string[] = [];
  const stripped = html.replace(importmapRe, (m) => {
    blocks.push(m);
    return '';
  });
  if (blocks.length === 0) return html;
  const headMatch = /<head\b[^>]*>/i.exec(stripped);
  if (!headMatch) {
    return blocks.join('\n') + '\n' + stripped;
  }
  const insertPos = headMatch.index + headMatch[0].length;
  return (
    stripped.slice(0, insertPos) +
    '\n  ' +
    blocks.join('\n  ') +
    stripped.slice(insertPos)
  );
}

function aisSyncStaticAndImportmapPlugin(table: ImportmapTable): Plugin {
  return {
    name: 'ais-sync-static-and-importmap',
    enforce: 'pre',
    resolveId(id: string) {
      const mapped = resolveImportmapSpecifier(id, table);
      if (!mapped) return null;
      if (
        mapped.startsWith('http://') ||
        mapped.startsWith('https://') ||
        mapped.startsWith('//') ||
        mapped.startsWith('data:')
      ) {
        return { id: mapped, external: true };
      }
      return { id, external: true };
    },
    transformIndexHtml: {
      order: 'post',
      handler(html: string) {
        return hoistImportmapsFirst(html);
      },
    },
    closeBundle() {
      const outDir = resolve(rootDir, 'dist');
      function walk(dir: string): void {
        for (const entry of readdirSync(dir)) {
          if (SKIP_DIRS.has(entry) || WRAPPER_META_FILES.has(entry) || entry.startsWith('.')) {
            continue;
          }
          const full = join(dir, entry);
          const st = statSync(full);
          if (st.isDirectory()) {
            walk(full);
          } else if (
            !entry.endsWith('.html') &&
            !entry.endsWith('.ts') &&
            !entry.endsWith('.tsx')
          ) {
            const rel = relative(rootDir, full);
            const dest = join(outDir, rel);
            if (!existsSync(dest)) {
              mkdirSync(dirname(dest), { recursive: true });
              cpSync(full, dest);
            }
          }
        }
      }
      walk(rootDir);
    },
  };
}

function geminiChatApiPlugin(): Plugin {
  const configure = (middlewares: {
    use: (
      route: string,
      handler: (
        req: import('node:http').IncomingMessage,
        res: import('node:http').ServerResponse,
        next: () => void
      ) => void
    ) => void;
  }) => {
    middlewares.use('/api/chat', (req, res, next) => {
      if (req.method !== 'POST') {
        next();
        return;
      }

      let rawBody = '';
      req.on('data', (chunk) => {
        rawBody += chunk.toString();
      });

      req.on('end', async () => {
        try {
          const parsed = rawBody ? JSON.parse(rawBody) : {};
          const message: string = typeof parsed.message === 'string' ? parsed.message.trim() : '';
          const history: Array<{ role: 'user' | 'model'; text: string }> = Array.isArray(parsed.history)
            ? parsed.history
            : [];
          const systemInstruction: string =
            typeof parsed.systemInstruction === 'string' && parsed.systemInstruction.trim()
              ? parsed.systemInstruction
              : 'You are the portfolio assistant for Deekshith P., an Electronics and Communication Engineering student at APJ Abdul Kalam Technological University, Kerala (2025–2029). Answer concisely and accurately about his 13 projects, 8 core skills, embedded systems, robotics, and web development work.';

          if (!message) {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'Message is required.' }));
            return;
          }

          const { GoogleGenAI } = await import('@google/genai');
          const ai = new GoogleGenAI({
            apiKey: process.env.GEMINI_API_KEY,
            httpOptions: {
              headers: {
                'User-Agent': 'aistudio-build',
              },
            },
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

          const response = await chat.sendMessage({
            message,
          });

          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ reply: response.text ?? '' }));
        } catch (err: unknown) {
          const errMsg = err instanceof Error ? err.message : 'Failed to generate response.';
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: errMsg }));
        }
      });
    });
  };

  return {
    name: 'gemini-chat-api-plugin',
    configureServer(server) {
      configure(server.middlewares);
    },
    configurePreviewServer(server) {
      configure(server.middlewares);
    },
  };
}

const htmlInputs = discoverHtmlInputs(rootDir);
const importmapTable = parseImportmaps(htmlInputs);

export default defineConfig({
  appType: 'mpa',
  base: './',
  plugins: [aisSyncStaticAndImportmapPlugin(importmapTable), geminiChatApiPlugin()],
  optimizeDeps: {
    noDiscovery: true,
    include: [],
  },
  server: {
    port: 3000,
    host: '0.0.0.0',
  },
  build: {
    assetsInlineLimit: 0,
    rollupOptions: {
      input: htmlInputs,
      external: (id: string) => resolveImportmapSpecifier(id, importmapTable) !== null,
    },
  },
});
