import { analyzeSkills } from '../../analyzer.js';
import { ok, sendJson } from './responseEnvelope.js';

export async function handleAnalyze(req, res, next) {
  try {
    const { jd, skills } = req.analyzeInput;
    const result = await analyzeSkills(jd, skills);
    return sendJson(res, 200, ok(result));
  } catch (err) {
    return next(err);
  }
}
