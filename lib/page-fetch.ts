export async function fetchLandingPageText(url: string): Promise<string> {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error('Landing page URL is invalid.');
  }
  if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error('Landing page URL must start with http or https.');

  const res = await fetch(parsed.toString(), {
    headers: { 'user-agent': 'RoastiesBot/1.0 (+https://github.com/imgrizzly1989/roasties)' },
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`Could not fetch landing page. HTTP ${res.status}.`);

  const html = await res.text();
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 12000);
}
