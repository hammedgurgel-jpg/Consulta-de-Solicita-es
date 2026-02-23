import { Redis } from '@upstash/redis';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const redis = Redis.fromEnv();
    const tokensStr: string | null = await redis.get('google_tokens');
    const tokens = tokensStr ? JSON.parse(tokensStr) : null;
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
