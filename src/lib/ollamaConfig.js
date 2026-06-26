export function getOllamaConfig() {
  const apiKey = (
    import.meta.env.VITE_OLLAMA_API_KEY ||
    import.meta.env.OLLAMA_API_KEY ||
    ''
  ).trim();

  const baseUrl = (
    import.meta.env.VITE_OLLAMA_BASE_URL ||
    import.meta.env.OLLAMA_BASE_URL ||
    'https://ollama.com/api'
  )
    .trim()
    .replace(/\/+$/, '');

  const model = (
    import.meta.env.VITE_OLLAMA_MODEL ||
    import.meta.env.OLLAMA_MODEL ||
    'gpt-oss:120b-cloud'
  ).trim();

  return {
    apiKey,
    baseUrl,
    model,
    isConfigured: Boolean(apiKey && apiKey.length > 10),
  };
}

export function getOllamaConfigError() {
  const { isConfigured } = getOllamaConfig();
  if (isConfigured) return null;
  return 'Ollama API key missing. Add OLLAMA_API_KEY (or VITE_OLLAMA_API_KEY) to your .env file and Vercel environment variables, then redeploy.';
}
