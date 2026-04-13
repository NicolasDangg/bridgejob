'use strict';

const { analyzeSkills } = require('../src/analyzer');
let fetchSpy;

/** Returns a minimal fetch response wrapping OpenRouter-style chat output. */
function makeFetchResponse(content, { ok = true, status = 200 } = {}) {
  return {
    ok,
    status,
    json: jest.fn().mockResolvedValue({
      choices: [{ message: { content } }],
    }),
  };
}

const VALID_ANALYSIS = {
  job_title: 'Backend Engineer',
  overall_fit: 'WEAK',
  overall_summary: 'The candidate lacks most required skills for this role.',
  strong_matches: [],
  partial_matches: [],
  gaps: [
    { skill: 'Go', priority: 'CRITICAL', learnability: 'SLOW', action: 'Build a REST API with Go and the Gin framework.' },
  ],
  noise_skills: ['team player'],
  readiness_score: 15,
  bridge_steps: ['Start the Go tour at go.dev/tour.'],
  analyst_note: 'Candidate has no relevant backend experience.',
};

describe('analyzeSkills', () => {
  beforeEach(() => {
    fetchSpy = jest.spyOn(global, 'fetch').mockReset();
  });

  afterEach(() => {
    fetchSpy.mockRestore();
  });

  test('returns parsed JSON from the AI response', async () => {
    fetchSpy.mockResolvedValue(makeFetchResponse(JSON.stringify(VALID_ANALYSIS)));

    const result = await analyzeSkills('Backend role requiring Go.', 'HTML, CSS');

    expect(result).toEqual(VALID_ANALYSIS);
  });

  test('calls the OpenRouter API with system and user messages', async () => {
    fetchSpy.mockResolvedValue(makeFetchResponse(JSON.stringify(VALID_ANALYSIS)));

    await analyzeSkills('Backend role requiring Go.', 'HTML, CSS');

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(fetchSpy).toHaveBeenCalledWith(
      'https://openrouter.ai/api/v1/chat/completions',
      expect.any(Object),
    );

    const callOptions = fetchSpy.mock.calls[0][1];
    expect(callOptions.method).toBe('POST');
    expect(callOptions.headers).toMatchObject({
      Authorization: expect.stringMatching(/^Bearer /),
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://bridgejob.app',
      'X-Title': 'BridgeJob',
    });

    const body = JSON.parse(callOptions.body);
    expect(body.messages).toHaveLength(2);
    expect(body.messages[0].role).toBe('system');
    expect(body.messages[1].role).toBe('user');
    expect(body.messages[1].content).toContain('Backend role requiring Go.');
    expect(body.messages[1].content).toContain('HTML, CSS');
  });

  test('uses the configured OpenRouter model', async () => {
    fetchSpy.mockResolvedValue(makeFetchResponse(JSON.stringify(VALID_ANALYSIS)));

    await analyzeSkills('JD text', 'Skills text');

    const callOptions = fetchSpy.mock.calls[0][1];
    const body = JSON.parse(callOptions.body);
    expect(body.model).toBe('minimax/minimax-m2.5:free');
  });

  test('throws when the AI returns non-JSON content', async () => {
    fetchSpy.mockResolvedValue(makeFetchResponse('Sorry, I cannot help with that.'));

    await expect(analyzeSkills('JD text', 'Skills text')).rejects.toMatchObject({
      status: 422,
      message: expect.stringMatching(/non-JSON response/i),
    });
  });

  test('accepts a custom fetch implementation via dependency injection', async () => {
    const customFetch = jest.fn().mockResolvedValue(
      makeFetchResponse(JSON.stringify(VALID_ANALYSIS)),
    );

    const result = await analyzeSkills('JD text', 'Skills text', customFetch);

    expect(result).toEqual(VALID_ANALYSIS);
    expect(customFetch).toHaveBeenCalledTimes(1);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  test('propagates OpenRouter status when upstream returns non-ok response', async () => {
    fetchSpy.mockResolvedValue(makeFetchResponse('{}', { ok: false, status: 429 }));

    await expect(analyzeSkills('JD text', 'Skills text')).rejects.toMatchObject({
      status: 429,
      message: expect.stringMatching(/status 429/i),
    });
  });

  test('parses markdown-fenced JSON responses', async () => {
    fetchSpy.mockResolvedValue(
      makeFetchResponse(`\`\`\`json
${JSON.stringify(VALID_ANALYSIS)}
\`\`\``),
    );

    const result = await analyzeSkills('JD text', 'Skills text');
    expect(result).toEqual(VALID_ANALYSIS);
  });
});
