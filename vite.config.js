import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'ollama-dev-proxy',
        configureServer(server) {
          server.middlewares.use('/api/ollama/chat', (req, res) => {
            if (req.method === 'OPTIONS') {
              res.statusCode = 200;
              res.end();
              return;
            }

            if (req.method !== 'POST') {
              res.statusCode = 405;
              res.end(JSON.stringify({ error: 'Method not allowed' }));
              return;
            }

            let body = '';
            req.on('data', (chunk) => {
              body += chunk;
            });

            req.on('end', async () => {
              const apiKey = env.OLLAMA_API_KEY || env.VITE_OLLAMA_API_KEY;
              const baseUrl = (env.OLLAMA_BASE_URL || env.VITE_OLLAMA_BASE_URL || 'https://ollama.com/api').replace(/\/+$/, '');
              const model = env.OLLAMA_MODEL || env.VITE_OLLAMA_MODEL || 'gpt-oss:120b-cloud';

              if (!apiKey) {
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: 'OLLAMA_API_KEY missing in .env' }));
                return;
              }

              try {
                const upstream = await fetch(`${baseUrl}/chat`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${apiKey}`,
                  },
                  body,
                });

                const text = await upstream.text();
                res.statusCode = upstream.status;
                res.setHeader('Content-Type', 'application/json');
                res.end(text);
              } catch (err) {
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: err.message }));
              }
            });
          });
        },
      },
    ],
    server: {
      port: 3000,
      open: true,
    },
    resolve: {
      alias: {
        '@': '/src',
      },
    },
  };
});
