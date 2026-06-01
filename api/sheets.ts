import { GoogleAuth } from 'google-auth-library';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const SPREADSHEET_ID = process.env.VITE_GOOGLE_SHEET_ID!;
const BASE = 'https://sheets.googleapis.com/v4/spreadsheets';

const auth = new GoogleAuth({
  credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON!),
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

interface DeleteRange {
  sheetId: number;
  dimension: string;
  startIndex: number;
  endIndex: number;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const { op, range, values, valueInputOption, deleteRange } = req.body as {
    op: string;
    range?: string;
    values?: string[][];
    valueInputOption?: string;
    deleteRange?: DeleteRange;
  };
  const token = await auth.getAccessToken();
  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  if (op === 'read') {
    const r = await fetch(`${BASE}/${SPREADSHEET_ID}/values/${encodeURIComponent(range!)}`, { headers });
    if (!r.ok) return res.status(r.status).json({ error: await r.text() });
    const data = await r.json() as { values?: string[][] };
    return res.json(data.values ?? []);
  }

  if (op === 'append') {
    const url = `${BASE}/${SPREADSHEET_ID}/values/${encodeURIComponent(range!)}:append?valueInputOption=${valueInputOption ?? 'RAW'}&insertDataOption=INSERT_ROWS`;
    const r = await fetch(url, { method: 'POST', headers, body: JSON.stringify({ values }) });
    if (!r.ok) return res.status(r.status).json({ error: await r.text() });
    return res.status(200).end();
  }

  if (op === 'update') {
    const url = `${BASE}/${SPREADSHEET_ID}/values/${encodeURIComponent(range!)}?valueInputOption=${valueInputOption ?? 'RAW'}`;
    const r = await fetch(url, { method: 'PUT', headers, body: JSON.stringify({ values }) });
    if (!r.ok) return res.status(r.status).json({ error: await r.text() });
    return res.status(200).end();
  }

  if (op === 'delete') {
    const r = await fetch(`${BASE}/${SPREADSHEET_ID}:batchUpdate`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ requests: [{ deleteDimension: { range: deleteRange } }] }),
    });
    if (!r.ok) return res.status(r.status).json({ error: await r.text() });
    return res.status(200).end();
  }

  return res.status(400).json({ error: 'unknown op' });
}
