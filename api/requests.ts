import { google } from 'googleapis';
import { Redis } from '@upstash/redis';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const redis = Redis.fromEnv();
    // CORREÇÃO: Removido o JSON.parse() que causava o erro.
    const tokens: any = await redis.get('google_tokens');
    if (!tokens || !tokens.access_token) {
      return res.status(401).json({ error: 'Aplicação não autorizada. Por favor, autentique-se.' });
    }

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );
    oauth2Client.setCredentials(tokens);

    const { email } = req.query;
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const sheets = google.sheets({ version: 'v4', auth: oauth2Client });
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: 'A:G',
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      return res.status(200).json([]);
    }

    const requests = rows.slice(1).map(row => ({
      vehicle: row[2],
      problem: row[4],
      email: row[5],
      status: row[6],
    }));

    const queryEmail = (email as string).trim().toLowerCase();
    const userRequests = requests.filter(req => {
      if (!req.email || !req.status) return false;
      const sheetEmail = req.email.trim().toLowerCase();
      const status = req.status.trim().toUpperCase();
      return sheetEmail === queryEmail && status !== 'FINALIZADO';
    });

    res.status(200).json(userRequests);

  } catch (error) {
    console.error('Erro ao buscar dados da planilha:', error);
    res.status(500).json({ error: 'Falha ao buscar dados da planilha.' });
  }
}
