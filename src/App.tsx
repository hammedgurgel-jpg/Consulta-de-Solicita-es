import { useState, useEffect } from 'react';
import { MaintenanceRequest } from './types';

// Componente para a tela principal de busca
const SearchInterface = () => {
  const [email, setEmail] = useState('');
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    if (!email) {
      alert('Por favor, insira um e-mail.');
      return;
    }
    setLoading(true);
    setError('');
    setRequests([]);
    setSearched(false);

    try {
      const response = await fetch(`/api/requests?email=${email}`);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Falha ao buscar solicitações.');
      }
      setRequests(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setSearched(true);
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-8">
      <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">Consulta de Manutenção</h1>
      <p className="text-center text-gray-500 mb-6">Consulte o status das solicitações de manutenção de veículos.</p>
      <div className="flex gap-4 mb-4">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Digite o e-mail do motorista"
          className="flex-grow p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleSearch}
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-3 rounded-md font-semibold hover:bg-blue-700 disabled:bg-blue-300 transition-colors"
        >
          {loading ? 'Buscando...' : 'Buscar'}
        </button>
      </div>

      {error && <p className="text-red-500 text-center mb-4">{error}</p>}

      <div className="space-y-4">
        {requests.map((req, index) => (
          <div key={index} className="bg-gray-50 p-4 rounded-md border border-gray-200">
            <p><strong>Veículo:</strong> {req.vehicle}</p>
            <p><strong>Problema:</strong> {req.problem}</p>
            <p><strong>Status:</strong> {req.status}</p>
          </div>
        ))}
      </div>

      {searched && requests.length === 0 && !loading && (
        <p className="text-center text-gray-500">Nenhuma solicitação encontrada para este e-mail.</p>
      )}
    </div>
  );
};

// Componente para a tela de autorização
const AuthInterface = () => {
  return (
    <div className="bg-white shadow-md rounded-lg p-8 text-center">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Autorização Necessária</h1>
      <p className="text-gray-500 mb-6">Para que esta aplicação possa ler os dados da sua Planilha Google, você precisa conceder a permissão.</p>
      <a 
        href="/api/auth/google"
        className="inline-block bg-blue-600 text-white px-6 py-3 rounded-md font-semibold hover:bg-blue-700 transition-colors"
      >
        Conectar com Google e Autorizar
      </a>
      <p className="text-xs text-gray-400 mt-4">Você será redirecionado para uma página segura do Google para fazer login e conceder a permissão de leitura.</p>
    </div>
  );
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    // Verifica o status da autenticação quando o app carrega
    const checkAuthStatus = async () => {
      try {
        const response = await fetch('/api/auth/status');
        const data = await response.json();
        setIsAuthenticated(data.isAuthenticated);
      } catch (error) {
        console.error('Erro ao verificar status da autenticação:', error);
        setIsAuthenticated(false);
      }
    };
    checkAuthStatus();
  }, []);

  // Mostra uma tela de carregamento enquanto verifica a autenticação
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-gray-500">Verificando autenticação...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl mx-auto">
        {isAuthenticated ? <SearchInterface /> : <AuthInterface />}
      </div>
    </div>
  );
}

export default App;

