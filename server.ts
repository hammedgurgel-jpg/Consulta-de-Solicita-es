import express from 'express';
import { createServer as createViteServer } from 'vite';
import { google } from 'googleapis';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API routes FIRST
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  app.get('/api/requests', async (req, res) => {
    const { email } = req.query;
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    try {


      const auth = new google.auth.GoogleAuth({
        credentials: {
          client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
          private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\n/g, '\n'),
        },
        scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
      });

      const sheets = google.sheets({ version: 'v4', auth });

      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: process.env.GOOGLE_SHEET_ID,
        range: 'A:G', // Reading columns A through G to include the new structure
      });

      const rows = response.data.values;
      if (!rows) {
        return res.json([]);
      }

      // Assumes first row is header and maps to the new column structure
      const requests = rows.slice(1).map(row => ({
        // Column C: NÚMERO DE FROTA -> vehicle
        // Column E: DESCREVA ABAIXO OS PROBLEMAS ENCONTRADOS -> problem
        // Column F: Email -> email
        // Column G: Status -> status
        vehicle: row[2],
        problem: row[4],
        email: row[5],
        status: row[6],
      }));

      const userRequests = requests.filter(
        req => req.email === email && req.status.toUpperCase() !== 'FINALIZADO'
      );

      res.json(userRequests);
    } catch (error) {
      console.error('Error fetching from Google Sheets:', error);
      res.status(500).json({ error: 'Failed to fetch data from Google Sheets' });
    }
  });

  // Vite middleware for development
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
