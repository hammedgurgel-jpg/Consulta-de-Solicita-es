import { google } from 'googleapis';
import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${process.env.APP_URL}/api/auth/callback`
  );

  const scopes = [
    'https://www.googleapis.com/auth/spreadsheets.readonly'
  ];

  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline', // Essencial para obter o refresh_token
    prompt: 'consent',      // Garante que o usuário sempre veja a tela de permissão
    scope: scopes
  });

  res.redirect(url);
}
