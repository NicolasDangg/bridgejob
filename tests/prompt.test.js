'use strict';

const { buildSystemPrompt, buildUserPrompt } = require('../src/prompt');

describe('buildSystemPrompt', () => {
  test('returns a non-empty string', () => {
    const prompt = buildSystemPrompt();
    expect(typeof prompt).toBe('string');
    expect(prompt.length).toBeGreaterThan(0);
  });

  test('instructs the model to return only valid JSON', () => {
    const prompt = buildSystemPrompt();
    expect(prompt).toMatch(/return only a valid json/i);
  });

  test('includes all four classification categories', () => {
    const prompt = buildSystemPrompt();
    expect(prompt).toMatch(/STRONG MATCH/);
    expect(prompt).toMatch(/PARTIAL MATCH/);
    expect(prompt).toMatch(/GAP/);
    expect(prompt).toMatch(/UNCLEAR/);
  });

  test('includes priority levels', () => {
    const prompt = buildSystemPrompt();
    expect(prompt).toMatch(/CRITICAL/);
    expect(prompt).toMatch(/IMPORTANT/);
    expect(prompt).toMatch(/NICE TO HAVE/);
  });

  test('includes learnability levels', () => {
    const prompt = buildSystemPrompt();
    expect(prompt).toMatch(/FAST/);
    expect(prompt).toMatch(/MEDIUM/);
    expect(prompt).toMatch(/SLOW/);
  });

  test('includes all required JSON output fields', () => {
    const prompt = buildSystemPrompt();
    const fields = [
      'job_title',
      'overall_fit',
      'overall_summary',
      'strong_matches',
      'partial_matches',
      'gaps',
      'noise_skills',
      'readiness_score',
      'bridge_steps',
      'analyst_note',
    ];
    for (const field of fields) {
      expect(prompt).toContain(field);
    }
  });

  test('instructs to ignore noise language', () => {
    const prompt = buildSystemPrompt();
    expect(prompt).toMatch(/team player|fast learner|strong communicator/i);
  });

  test('instructs to not soften bad news', () => {
    const prompt = buildSystemPrompt();
    expect(prompt).toMatch(/do not soften|severely underqualified/i);
  });
});

describe('buildUserPrompt', () => {
  test('includes the jd and skills in the output', () => {
    const jd = 'Looking for a senior React engineer.';
    const skills = 'JavaScript, Vue.js, 3 years experience.';
    const prompt = buildUserPrompt(jd, skills);
    expect(prompt).toContain(jd);
    expect(prompt).toContain(skills);
  });

  test('labels sections as JD and SKILLS', () => {
    const prompt = buildUserPrompt('some jd', 'some skills');
    expect(prompt).toMatch(/^JD:/m);
    expect(prompt).toMatch(/^SKILLS:/m);
  });
});
