import { createDomainError } from './analyzer.js';

function withTimeout(promise, timeoutMs) {
  let timeoutId;

  const timeoutPromise = new Promise((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(createDomainError('COACH_TIMEOUT', 'Chat request timed out.'));
    }, timeoutMs);
  });

  return Promise.race([promise, timeoutPromise]).finally(() => {
    clearTimeout(timeoutId);
  });
}

function buildSystemPrompt() {
  return `You are gapless's elite AI Career Coach. You help job seekers analyze their career path, prepare for interviews, improve their resumes, and identify skill gaps. Provide concise, strategic, and highly actionable advice. Do not output markdown code blocks containing json, just output the normal conversational text. Keep answers brief (less than 150 words) unless complex explanation is needed. Focus entirely on careers, jobs, skills, and professional development. If the user asks about unrelated topics, politely steer them back to career topics.`;
}

export async function chatWithCoach(messages, fetchImpl, options = {}) {
  const fetchFn = fetchImpl || globalThis.fetch;
  const timeoutMs = options.timeoutMs ?? 20000;
  let response;

  if (!process.env.GROQ_API_KEY) {
    throw createDomainError('COACH_CONFIG', 'Missing GROQ_API_KEY environment variable.');
  }

  try {
    const formattedMessages = [
      { role: 'system', content: buildSystemPrompt() },
      ...messages.map(m => ({ role: m.role, content: m.content }))
    ];

    response = await withTimeout(
      fetchFn('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          temperature: 0.7,
          messages: formattedMessages,
        }),
      }),
      timeoutMs,
    );
  } catch (err) {
    if (err?.code === 'COACH_TIMEOUT') {
      throw err;
    }
    throw createDomainError('COACH_UPSTREAM', `Groq request failed: ${err.message}`);
  }

  if (!response || !response.ok) {
    let detail = '';

    if (response) {
      try {
        detail = await response.text();
      } catch {
        detail = '';
      }
    }

    const suffix = detail ? ' Detail: ' + detail : '';
    throw createDomainError(
      'COACH_UPSTREAM',
      `Groq request failed with status ${response?.status ?? 500}.${suffix}`,
    );
  }

  const data = await response.json();
  const raw = data?.choices?.[0]?.message?.content;
  if (typeof raw !== 'string' || raw.trim() === '') {
    throw createDomainError('COACH_INVALID_RESPONSE', 'Groq returned an unexpected response format.');
  }

  return { response: raw.trim() };
}
