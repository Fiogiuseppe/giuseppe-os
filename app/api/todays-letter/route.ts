import { generateTodaysLetter, mapTodaysLetterError } from '../../../lib/todays-letter/generate';

export async function POST() {
  try {
    const response = await generateTodaysLetter();
    return Response.json(response);
  } catch (error) {
    const mapped = mapTodaysLetterError(error);
    return Response.json({ error: mapped.message }, { status: mapped.status });
  }
}

export async function GET() {
  return Response.json({
    status: 'ok',
    service: 'giuseppe-todays-letter',
    version: '1.5.0-todays-letter',
    method: 'POST',
    maxWords: 250
  });
}
