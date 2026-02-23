import { Redis } from '@upstash/redis';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const redis = Redis.fromEnv();
    const tokens = await redis.get('google_tokens');

    if (tokens && (tokens as any).access_token) {
      res.status(200).json({ isAuthenticated: true });
    } else {
      res.status(200).json({ isAuthenticated: false });
    }
  } catch (error) {
    console.error('Erro ao verificar status de autenticação:', error);
    res.status(500).json({ error: 'Falha ao verificar status de autenticação.' });
  }
}
