const MIN_JD_LENGTH = 50;
const MIN_SKILLS_LENGTH = 20;

function asTrimmedString(value) {
  return typeof value === 'string' ? value.trim() : null;
}

export function validateAnalyzeRequestShape(req, _res, next) {
  const jd = asTrimmedString(req.body?.jd);
  const skills = asTrimmedString(req.body?.skills);

  if (jd === null || skills === null) {
    const err = new Error('`jd` and `skills` must be strings.');
    err.kind = 'BAD_REQUEST';
    return next(err);
  }

  req.analyzeInput = { jd, skills };
  return next();
}

export function validateAnalyzeRequestSemantic(req, _res, next) {
  const { jd, skills } = req.analyzeInput;

  if (!jd || !skills) {
    const err = new Error('`jd` and `skills` are required and cannot be empty.');
    err.kind = 'UNPROCESSABLE_ENTITY';
    return next(err);
  }

  if (jd.length < MIN_JD_LENGTH) {
    const err = new Error(`\`jd\` must be at least ${MIN_JD_LENGTH} characters long.`);
    err.kind = 'UNPROCESSABLE_ENTITY';
    return next(err);
  }

  if (skills.length < MIN_SKILLS_LENGTH) {
    const err = new Error(`\`skills\` must be at least ${MIN_SKILLS_LENGTH} characters long.`);
    err.kind = 'UNPROCESSABLE_ENTITY';
    return next(err);
  }

  return next();
}
