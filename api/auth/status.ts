import { Redis } from '@upstash/redis';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Adiciona cabeçalhos para PREVENIR o cache pela Vercel. Essencial para o loop de login.
  res.setHeader('Cache-Control', 'no-cache, no-store, max-age=0, must-revalidate');

  try {
    const redis = Redis.fromEnv();
    const tokens: any = await redis.get('google_tokens');

    if (tokens && tokens.access_token) {
      res.status(200).json({ isAuthenticated: true });
    } else {
      res.status(200).json({ isAuthenticated: false });
    }
  } catch (error) {
    console.error('Erro ao verificar status no KV:', error);
    res.status(500).json({ isAuthenticated: false, error: 'Erro no servidor ao verificar status.' });
  }
}
