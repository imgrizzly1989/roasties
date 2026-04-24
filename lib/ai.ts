export function buildRoastPrompt(url: string, pageText: string): string {
  return `You are a brutally honest senior conversion-copy expert.

Landing page URL: ${url}

Landing page text/content:
${pageText.slice(0, 12000)}

Task: Write exactly one brutally honest sentence that identifies the biggest conversion problem and gives one specific action to fix it.

Rules:
- one sentence only
- no greeting
- no bullets
- no generic advice
- be direct but useful
- include a specific action
- maximum 55 words`;
}

export async function generateRoast(url: string, pageText: string): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_API_KEY is not configured.');

  const model = process.env.OPENAI_MODEL || 'gpt-4.1-mini';
  const prompt = buildRoastPrompt(url, pageText);

  const res = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      authorization: `Bearer ${apiKey}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model,
      input: prompt,
      max_output_tokens: 180,
    }),
  });

  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`OpenAI request failed: ${res.status} ${detail.slice(0, 300)}`);
  }

  const json = await res.json();
  const text = json.output_text || json.output?.flatMap((o: any) => o.content || []).map((c: any) => c.text).filter(Boolean).join('\n');
  if (!text) throw new Error('OpenAI returned no text.');
  return String(text).trim();
}
