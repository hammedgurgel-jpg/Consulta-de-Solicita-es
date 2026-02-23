import { google } from 'googleapis';
import { Redis } from '@upstash/redis';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { code } = req.query;

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${process.env.APP_URL}/api/auth/callback`
  );

  try {
    console.log('[Callback] Recebido código de autorização do Google.');
    const { tokens } = await oauth2Client.getToken(code as string);
    console.log('[Callback] Tokens recebidos do Google com sucesso.');

    // Salva os tokens no Vercel KV. 'google_tokens' é a nossa chave.
    const redis = Redis.fromEnv();
    await redis.set('google_tokens', JSON.stringify(tokens));
    console.log('[Callback] Tokens salvos no Vercel KV com sucesso!');
    res.redirect('/?auth_status=success');
  } catch (error) {
    console.error('Erro ao obter e salvar tokens:', error);
    res.redirect('/?auth_status=error');
  }
}
