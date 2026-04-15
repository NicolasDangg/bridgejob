import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import { buildSystemPrompt, buildUserPrompt } from '../src/prompt.js';

describe('buildSystemPrompt', () => {
  test('returns a non-empty string', () => {
    const prompt = buildSystemPrompt();
    assert.equal(typeof prompt, 'string');
    assert.ok(prompt.length > 0);
  });

  test('instructs the model to return only valid JSON', () => {
    const prompt = buildSystemPrompt();
    assert.match(prompt, /return only a valid json/i);
  });

  test('includes classification categories and output fields', () => {
    const prompt = buildSystemPrompt();
    for (const token of [
      'STRONG MATCH',
      'PARTIAL MATCH',
      'GAP',
      'UNCLEAR',
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
    ]) {
      assert.match(prompt, new RegExp(token));
    }
  });
});

describe('buildUserPrompt', () => {
  test('includes both JD and skills sections', () => {
    const jd = 'Looking for a senior React engineer.';
    const skills = 'JavaScript, Vue.js, 3 years experience.';
    const prompt = buildUserPrompt(jd, skills);
    assert.match(prompt, /^JD:/m);
    assert.match(prompt, /^SKILLS:/m);
    assert.match(prompt, new RegExp(jd.replace('.', '\\.')));
    assert.match(prompt, /JavaScript, Vue\.js, 3 years experience\./);
  });
});
