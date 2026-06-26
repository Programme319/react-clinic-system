export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.OLLAMA_API_KEY || process.env.VITE_OLLAMA_API_KEY;
  const baseUrl = (process.env.OLLAMA_BASE_URL || process.env.VITE_OLLAMA_BASE_URL || 'https://ollama.com/api').replace(/\/+$/, '');
  const model = process.env.OLLAMA_MODEL || process.env.VITE_OLLAMA_MODEL || 'gpt-oss:120b-cloud';

  if (!apiKey) {
    return res.status(500).json({
      error: 'OLLAMA_API_KEY is not set. Add it in Vercel → Settings → Environment Variables.',
    });
  }

  try {
    const { messages } = req.body || {};

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'messages array is required' });
    }

    const response = await fetch(`${baseUrl}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        stream: false,
      }),
    });

    const text = await response.text();

    if (!response.ok) {
      return res.status(response.status).json({
        error: text || `Ollama API returned ${response.status}`,
      });
    }

    return res.status(200).json(JSON.parse(text));
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}
