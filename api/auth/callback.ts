import { google } from 'googleapis';
import { Redis } from '@upstash/redis';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { code } = req.query;

  if (typeof code !== 'string') {
    return res.status(400).json({ error: 'Código de autorização inválido.' });
  }

  try {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${process.env.APP_URL}/api/auth/callback`
    );

    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    const redis = Redis.fromEnv();
    await redis.set('google_tokens', JSON.stringify(tokens));
    console.log('Tokens salvos no Redis com sucesso.');

    res.redirect('/');

  } catch (error) {
    console.error('Erro ao obter tokens de acesso:', error);
    res.status(500).json({ error: 'Falha ao autenticar com o Google.' });
  }
}
