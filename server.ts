import express from 'express';
import { createServer as createViteServer } from 'vite';
import { google } from 'googleapis';

// Armazenamento em memória para os tokens. Em produção, use um banco de dados.
let googleTokens: any = null;

async function startServer() {
  const app = express();
  const PORT = 3000;

  if (!process.env.APP_URL) {
    console.warn('A variável de ambiente APP_URL não está definida. O redirecionamento do OAuth pode falhar.');
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${process.env.APP_URL}/api/auth/google/callback`
  );

  // Endpoint para iniciar o processo de autorização
  app.get('/api/auth/google', (req, res) => {
    const scopes = ['https://www.googleapis.com/auth/spreadsheets.readonly'];
    const url = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent', // Força a exibição da tela de consentimento para obter o refresh_token
    });
    res.redirect(url);
  });

  // Endpoint que o Google chama após o usuário autorizar
  app.get('/api/auth/google/callback', async (req, res) => {
    const { code } = req.query;
    try {
      const { tokens } = await oauth2Client.getToken(code as string);
      googleTokens = tokens;
      oauth2Client.setCredentials(tokens);
      console.log('Tokens obtidos com sucesso!');
      res.redirect('/?auth_status=success');
    } catch (error) {
      console.error('Erro ao obter tokens:', error);
      res.redirect('/?auth_status=error');
    }
  });

  // Endpoint para verificar o status da autenticação
  app.get('/api/auth/status', (req, res) => {
    if (googleTokens && googleTokens.access_token) {
      res.json({ isAuthenticated: true });
    } else {
      res.json({ isAuthenticated: false });
    }
  });

  // Endpoint principal para buscar os dados
  app.get('/api/requests', async (req, res) => {
    if (!googleTokens || !googleTokens.access_token) {
      return res.status(401).json({ error: 'Aplicação não autorizada. Por favor, autentique-se.' });
    }
    oauth2Client.setCredentials(googleTokens);

    const { email } = req.query;
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    try {
      const sheets = google.sheets({ version: 'v4', auth: oauth2Client });
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: process.env.GOOGLE_SHEET_ID,
        range: 'A:G',
      });

      const rows = response.data.values;
      if (!rows || rows.length === 0) {
        return res.json([]);
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

      res.json(userRequests);

    } catch (error) {
      console.error('Erro ao buscar dados da planilha:', error);
      res.status(500).json({ error: 'Falha ao buscar dados da planilha.' });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
