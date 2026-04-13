import { NextResponse } from 'next/server';
import { createRequire } from 'module';

export const runtime = 'nodejs';

const require = createRequire(import.meta.url);
const { analyzeSkills } = require('../../../analyzer.js');

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

  if (!jd) {
    return NextResponse.json({ error: 'jd is required and must be a non-empty string.' }, { status: 400 });
  }

  if (!skills) {
    return NextResponse.json({ error: 'skills is required and must be a non-empty string.' }, { status: 400 });
  }

  try {
    const result = await analyzeSkills(jd, skills);
    return NextResponse.json(result);
  } catch (err) {
    const status = err && typeof err.status === 'number' ? err.status : 502;
    return NextResponse.json(
      {
        error: err && err.message ? err.message : 'Failed to analyze skills.',
      },
      { status }
    );
  }
}
