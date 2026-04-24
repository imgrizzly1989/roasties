import { describe, expect, it } from 'vitest';
import { buildRoastPrompt } from '../lib/ai';

describe('buildRoastPrompt', () => {
  it('includes landing page URL, text, and demands one concise actionable roast', () => {
    const prompt = buildRoastPrompt('https://example.com', 'Hero: Save time. Button: Learn more.');

    expect(prompt).toContain('https://example.com');
    expect(prompt).toContain('Hero: Save time');
    expect(prompt).toContain('one brutally honest sentence');
    expect(prompt).toContain('specific action');
  });
});
