import { google } from 'googleapis';
import { Redis } from '@upstash/redis';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const redis = Redis.fromEnv();
    const tokens: any = await redis.get('google_tokens');
    if (!tokens || !tokens.access_token) {
      return res.status(401).json({ error: 'Aplicação não autorizada. Por favor, autentique-se.' });
    }

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );
    oauth2Client.setCredentials(tokens);

    oauth2Client.on('tokens', (newTokens) => {
      console.log('[requests] Token de acesso foi atualizado.');
      const updatedTokens = { ...tokens, ...newTokens };
      redis.set('google_tokens', JSON.stringify(updatedTokens));
      console.log('[requests] Token atualizado salvo no KV.');
    });

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
      vehicle: row[2], // CORREÇÃO: Apontando para a coluna C (Número do Veículo)
      problem: row[4],
      email: row[5],
      status: row[6],
    }));

    const queryEmail = (email as string).trim().toLowerCase();
    const userRequests = requests.filter(req => {
      if (!req.email) return false;
      const sheetEmail = req.email.trim().toLowerCase();
      return sheetEmail === queryEmail;
    });

    res.status(200).json(userRequests);

  } catch (error) {
    console.error('Erro ao buscar dados da planilha:', error);
    res.status(500).json({ error: 'Falha ao buscar dados da planilha.' });
  }
}