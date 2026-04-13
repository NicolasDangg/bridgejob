'use strict';

// Mock the openai module before requiring the analyzer
jest.mock('openai', () => {
  const mockCreate = jest.fn();
  return {
    default: jest.fn().mockImplementation(() => ({
      chat: {
        completions: {
          create: mockCreate,
        },
      },
    })),
    __mockCreate: mockCreate,
  };
});

const openaiModule = require('openai');
const { analyzeSkills } = require('../src/analyzer');

const mockCreate = openaiModule.__mockCreate;

/** Returns a minimal OpenAI chat completion response wrapping the given content. */
function makeOpenAIResponse(content) {
  return {
    choices: [{ message: { content } }],
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
    mockCreate.mockReset();
  });

  test('returns parsed JSON from the AI response', async () => {
    mockCreate.mockResolvedValue(makeOpenAIResponse(JSON.stringify(VALID_ANALYSIS)));

    const result = await analyzeSkills('Backend role requiring Go.', 'HTML, CSS');

    expect(result).toEqual(VALID_ANALYSIS);
  });

  test('calls the OpenAI API with system and user messages', async () => {
    mockCreate.mockResolvedValue(makeOpenAIResponse(JSON.stringify(VALID_ANALYSIS)));

    await analyzeSkills('Backend role requiring Go.', 'HTML, CSS');

    expect(mockCreate).toHaveBeenCalledTimes(1);
    const callArgs = mockCreate.mock.calls[0][0];
    expect(callArgs.messages).toHaveLength(2);
    expect(callArgs.messages[0].role).toBe('system');
    expect(callArgs.messages[1].role).toBe('user');
    expect(callArgs.messages[1].content).toContain('Backend role requiring Go.');
    expect(callArgs.messages[1].content).toContain('HTML, CSS');
  });

  test('uses json_object response format', async () => {
    mockCreate.mockResolvedValue(makeOpenAIResponse(JSON.stringify(VALID_ANALYSIS)));

    await analyzeSkills('JD text', 'Skills text');

    const callArgs = mockCreate.mock.calls[0][0];
    expect(callArgs.response_format).toEqual({ type: 'json_object' });
  });

  test('throws when the AI returns non-JSON content', async () => {
    mockCreate.mockResolvedValue(makeOpenAIResponse('Sorry, I cannot help with that.'));

    await expect(analyzeSkills('JD text', 'Skills text')).rejects.toThrow(
      /non-JSON response/i,
    );
  });

  test('accepts a custom client via dependency injection', async () => {
    const customMockCreate = jest.fn().mockResolvedValue(
      makeOpenAIResponse(JSON.stringify(VALID_ANALYSIS)),
    );
    const customClient = {
      chat: { completions: { create: customMockCreate } },
    };

    const result = await analyzeSkills('JD text', 'Skills text', customClient);

    expect(result).toEqual(VALID_ANALYSIS);
    expect(customMockCreate).toHaveBeenCalledTimes(1);
    // The default module-level client should NOT have been called
    expect(mockCreate).not.toHaveBeenCalled();
  });
});
