/**
 * Sends chat messages to Ollama Cloud via serverless proxy (/api/ollama/chat).
 * Keeps the API key on the server in production.
 */
export async function sendOllamaChat(messages) {
  const response = await fetch('/api/ollama/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages }),
  });

  const text = await response.text();
  let data;

  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(text || `Ollama request failed (${response.status})`);
  }

  if (!response.ok) {
    throw new Error(data.error || data.message || `Ollama error (${response.status})`);
  }

  return data.message?.content || data.response || '';
}

export function buildPatientSystemPrompt(patient, investigations = [], medications = []) {
  const invText =
    investigations.length > 0
      ? investigations.map((t) => `- ${t.test_name}: ${t.test_result}`).join('\n')
      : 'None recorded';

  const medText =
    medications.length > 0
      ? medications.map((m) => `- ${m.med_name} (${m.dosage})`).join('\n')
      : 'None recorded';

  return `You are ClinicCare AI — a helpful bilingual (Arabic/English) clinic assistant.

PATIENT CONTEXT:
- Name: ${patient.name}
- Patient ID: #${patient.id}
- Email: ${patient.email || 'N/A'}
- Phone: ${patient.phone || 'N/A'}
- Date of birth: ${patient.date_of_birth || 'N/A'}

INVESTIGATIONS:
${invText}

MEDICATIONS:
${medText}

RULES:
- Reply in the same language the user uses (Arabic or English).
- Be concise, empathetic, and professional.
- NEVER diagnose or prescribe — suggest consulting their doctor for medical decisions.
- If the user describes an emergency, tell them to seek immediate emergency care.`;
}
