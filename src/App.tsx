/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { MaintenanceRequest } from './types';

export default function App() {
  const [email, setEmail] = useState('');
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    if (!email) {
      setError('Por favor, insira um e-mail.');
      return;
    }
    setLoading(true);
    setError('');
    setRequests([]);

    try {
      const response = await fetch(`/api/requests?email=${email}`);
      if (!response.ok) {
        throw new Error('Falha ao buscar solicitações.');
      }
      const data = await response.json();
      setRequests(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800 flex flex-col items-center p-4 font-sans">
      <div className="w-full max-w-4xl mx-auto bg-white rounded-2xl shadow-md p-8">
        <h1 className="text-4xl font-bold text-center text-gray-900 mb-2">Consulta de Manutenção</h1>
        <p className="text-center text-gray-600 mb-8">Consulte o status das suas solicitações de manutenção de veículos.</p>

        <div className="flex items-center gap-4 mb-8">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Digite seu e-mail"
            className="flex-grow px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow"
          />
          <button
            onClick={handleSearch}
            disabled={loading}
            className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
          >
            {loading ? 'Buscando...' : 'Buscar'}
          </button>
        </div>

        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        <div className="space-y-4">
          {requests.length > 0 ? (
            requests.map((req, index) => (
              <div key={index} className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <p className="font-semibold"><strong>Veículo:</strong> {req.vehicle}</p>
                <p><strong>Problema:</strong> {req.problem}</p>
                <p><strong>Status:</strong> <span className="font-bold text-blue-600">{req.status}</span></p>
              </div>
            ))
          ) : (
            !loading && <p className="text-center text-gray-500">Nenhuma solicitação encontrada para este e-mail.</p>
          )}
        </div>
      </div>
    </div>
  );
}

