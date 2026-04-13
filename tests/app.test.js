'use strict';

const request = require('supertest');
const app = require('../src/app');

// Mock the analyzer module so tests don't call the real OpenAI API
jest.mock('../src/analyzer', () => ({
  analyzeSkills: jest.fn(),
}));

const { analyzeSkills } = require('../src/analyzer');

/** Minimal valid analysis payload matching the required schema. */
const MOCK_ANALYSIS = {
  job_title: 'Senior Frontend Engineer',
  overall_fit: 'MODERATE',
  overall_summary:
    'The candidate has solid JavaScript fundamentals but lacks required React depth and cloud experience.',
  strong_matches: [{ skill: 'JavaScript', note: 'Candidate lists JS as primary language.' }],
  partial_matches: [
    {
      skill: 'React',
      gap_detail: 'Candidate knows basic React but not hooks or context.',
      priority: 'CRITICAL',
      learnability: 'MEDIUM',
      action: 'Complete the Scrimba Advanced React course and build a full CRUD app using hooks and context.',
    },
  ],
  gaps: [
    {
      skill: 'AWS',
      priority: 'IMPORTANT',
      learnability: 'MEDIUM',
      action: 'Complete the AWS Cloud Practitioner Essentials free course on AWS Skill Builder.',
    },
  ],
  noise_skills: ['team player', 'fast learner'],
  readiness_score: 45,
  bridge_steps: [
    'Complete Scrimba Advanced React course (2-3 weeks) and ship a React hooks/context project to GitHub.',
    'Earn the AWS Cloud Practitioner certification to establish baseline cloud credibility.',
  ],
  analyst_note: 'JD emphasises React three times — treat it as an absolute requirement.',
};

describe('POST /analyze', () => {
  beforeEach(() => {
    analyzeSkills.mockReset();
  });

  test('returns 400 when `jd` is missing', async () => {
    const res = await request(app).post('/analyze').send({ skills: 'JavaScript' });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/jd/i);
  });

  test('returns 400 when `skills` is missing', async () => {
    const res = await request(app)
      .post('/analyze')
      .send({ jd: 'We need a React developer.' });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/skills/i);
  });

  test('returns 400 when `jd` is an empty string', async () => {
    const res = await request(app).post('/analyze').send({ jd: '   ', skills: 'JavaScript' });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/jd/i);
  });

  test('returns 400 when `skills` is an empty string', async () => {
    const res = await request(app)
      .post('/analyze')
      .send({ jd: 'We need a React developer.', skills: '   ' });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/skills/i);
  });

  test('returns 400 when body is empty', async () => {
    const res = await request(app).post('/analyze').send({});
    expect(res.status).toBe(400);
  });

  test('returns analysis JSON on valid input', async () => {
    analyzeSkills.mockResolvedValue(MOCK_ANALYSIS);

    const res = await request(app)
      .post('/analyze')
      .send({ jd: 'Senior Frontend Engineer…', skills: 'JavaScript, basic React' });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      job_title: expect.any(String),
      overall_fit: expect.stringMatching(/^(STRONG|MODERATE|WEAK|SEVERELY UNDERQUALIFIED)$/),
      overall_summary: expect.any(String),
      strong_matches: expect.any(Array),
      partial_matches: expect.any(Array),
      gaps: expect.any(Array),
      noise_skills: expect.any(Array),
      readiness_score: expect.any(Number),
      bridge_steps: expect.any(Array),
      analyst_note: expect.any(String),
    });
  });

  test('calls analyzeSkills with trimmed jd and skills', async () => {
    analyzeSkills.mockResolvedValue(MOCK_ANALYSIS);

    const jd = '  We need a React developer.  ';
    const skills = '  JavaScript  ';

    await request(app).post('/analyze').send({ jd, skills });

    expect(analyzeSkills).toHaveBeenCalledWith(
      'We need a React developer.',
      'JavaScript',
    );
  });

  test('returns 502 when analyzeSkills throws', async () => {
    analyzeSkills.mockRejectedValue(new Error('OpenAI timeout'));

    const res = await request(app)
      .post('/analyze')
      .send({ jd: 'We need a React developer.', skills: 'JavaScript' });

    expect(res.status).toBe(502);
    expect(res.body.error).toBeDefined();
    expect(res.body.detail).toBe('OpenAI timeout');
  });

  test('readiness_score is a number between 0 and 100', async () => {
    analyzeSkills.mockResolvedValue(MOCK_ANALYSIS);

    const res = await request(app)
      .post('/analyze')
      .send({ jd: 'Senior Frontend Engineer…', skills: 'JavaScript' });

    expect(res.status).toBe(200);
    const score = res.body.readiness_score;
    expect(typeof score).toBe('number');
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });
});
