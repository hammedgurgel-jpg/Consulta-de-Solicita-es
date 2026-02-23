import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

// Importa as rotas da API
import googleAuthHandler from './api/auth/google.js';
import callbackHandler from './api/auth/callback.js';
import statusHandler from './api/auth/status.js';
import logoutHandler from './api/auth/logout.js';
import requestsHandler from './api/requests.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function createServer() {
  const app = express();
  const port = 3000;

  // Middleware para JSON
  app.use(express.json());

  // Define as rotas da API
  app.get('/api/auth/google', googleAuthHandler);
  app.get('/api/auth/callback', callbackHandler);
  app.get('/api/auth/status', statusHandler);
  app.get('/api/auth/logout', logoutHandler);
  app.get('/api/requests', requestsHandler);

  // Cria o servidor Vite para o frontend
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
    root: __dirname,
  });

  // Usa o middleware do Vite
  app.use(vite.middlewares);

  // Rota de fallback para o index.html (para o React Router funcionar)
  app.use('*', (req, res, next) => {
    if (req.originalUrl.startsWith('/api')) {
      return next(); // Deixa as chamadas de API passarem
    }
    res.sendFile(path.resolve(__dirname, 'index.html'));
  });

  app.listen(port, '0.0.0.0', () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
  });
}

createServer();
