import { NextResponse } from 'next/server';
import { analyzeSkills } from '../../../analyzer.js';

export const runtime = 'nodejs';

function asText(value) {
  return typeof value === 'string' ? value.trim() : '';
}

export async function POST(request) {
  let body;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Request body must be valid JSON.' }, { status: 400 });
  }

  const jd = asText(body?.jd);
  const skills = asText(body?.skills);

  if (jd.length < 50) {
    return NextResponse.json({ error: 'jd must be at least 50 characters long.' }, { status: 400 });
  }

  if (skills.length < 20) {
    return NextResponse.json({ error: 'skills must be at least 20 characters long.' }, { status: 400 });
  }

  try {
    const result = await analyzeSkills(jd, skills);
    return NextResponse.json(result);
  } catch (err) {
    const status = err && typeof err.status === "number" ? err.status : 502;
    return NextResponse.json({ error: err && err.message ? err.message : 'Failed to analyze skills.' }, { status });
  }
}
