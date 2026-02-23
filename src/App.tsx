import { useState, useEffect } from 'react';

interface MaintenanceRequest {
  vehicle: string;
  problem: string;
  status: string;
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [email, setEmail] = useState<string>('');
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [searchError, setSearchError] = useState<string>('');
  const [isSearching, setIsSearching] = useState<boolean>(false);

  useEffect(() => {
    // Verifica o status da autenticação quando o componente é montado
    fetch('/api/auth/status')
      .then(res => res.json())
      .then(data => {
        setIsAuthenticated(data.isAuthenticated);
      })
      .catch(() => setIsAuthenticated(false))
      .finally(() => setIsLoading(false));
  }, []);

  const handleSearch = async () => {
    if (!email) {
      setSearchError('Por favor, insira um e-mail.');
      return;
    }
    setIsSearching(true);
    setSearchError('');
    setRequests([]);

    try {
      const response = await fetch(`/api/requests?email=${encodeURIComponent(email)}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Falha ao buscar dados.');
      }
      const data = await response.json();
      setRequests(data);
      if (data.length === 0) {
        setSearchError('Nenhuma solicitação encontrada para este e-mail.');
      }
    } catch (error: any) {
      setSearchError(error.message || 'Falha ao buscar dados da planilha.');
    }
    finally {
      setIsSearching(false);
    }
  };

  const renderLogin = () => (
    <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">Autorização Necessária</h2>
      <p className="text-center text-gray-600 mb-6">Para que esta aplicação possa ler os dados da sua Planilha Google, você precisa conceder a permissão.</p>
      <a href="/api/auth/google" className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors text-center block">
        Conectar com Google e Autorizar
      </a>
      <p className="text-center text-xs text-gray-500 mt-4">Você será redirecionado para uma página segura do Google para fazer login e conceder a permissão de leitura.</p>
    </div>
  );

  const renderQuery = () => (
    <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-lg">
      <h1 className="text-2xl font-bold text-center text-gray-800 mb-2">Consulta de Manutenção</h1>
      <p className="text-center text-gray-600 mb-6">Consulte o status das solicitações de manutenção de veículos.</p>
      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Digite o e-mail cadastrado"
          className="flex-grow px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleSearch}
          disabled={isSearching}
          className="bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
        >
          {isSearching ? 'Buscando...' : 'Buscar'}
        </button>
      </div>
      {searchError && <p className="text-red-500 text-center mb-4">{searchError}</p>}
      <div className="mt-6 space-y-4">
        {requests.map((req, index) => (
          <div key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <p><strong>Veículo:</strong> {req.vehicle}</p>
            <p><strong>Problema:</strong> {req.problem}</p>
            <p><strong>Status:</strong> {req.status}</p>
          </div>
        ))}
      </div>
    </div>
  );

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen bg-gray-100 text-gray-800">Carregando...</div>;
  }

  return (
    <main className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      {isAuthenticated ? renderQuery() : renderLogin()}
    </main>
  );
}

export default App;
