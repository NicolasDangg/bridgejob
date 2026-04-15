import fs from 'fs/promises';
import path from 'path';

export async function saveAIResponse(obj, filename) {
  const dir = path.join(process.cwd(), 'tests', 'ai-responses');
  await fs.mkdir(dir, { recursive: true });
  const name = filename || `${Date.now()}.json`;
  const filePath = path.join(dir, name);
  await fs.writeFile(filePath, JSON.stringify(obj, null, 2), 'utf8');
  return filePath;
}
