import { Redis } from '@upstash/redis';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const redis = Redis.fromEnv();
    await redis.del('google_tokens');
    console.log('Tokens de autenticação removidos com sucesso.');
    // Redireciona para a página inicial após o logout
    res.redirect('/');
  } catch (error) {
    console.error('Erro ao fazer logout:', error);
    res.status(500).json({ error: 'Falha ao realizar o logout.' });
  }
}
