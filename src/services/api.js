// ============================================
// SERVIÇO DE API - CONEXÃO COM BACKEND
// Arquivo simples para o React se comunicar com a API
// ============================================

const API_URL = 'http://localhost:3001/api';

// Função para fazer requisições
async function requisicao(url, opcoes = {}) {
  const token = localStorage.getItem('token');

  const config = {
    headers: {
      'Content-Type': 'application/json',
    },
    ...opcoes,
  };

  // Adicionar token se existir
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  const resposta = await fetch(`${API_URL}${url}`, config);
  const dados = await resposta.json();

  if (!resposta.ok) {
    throw new Error(dados.erro || 'Erro na requisição');
  }

  return dados;
}

// ============================================
// FUNÇÕES DA API
// ============================================

const api = {
  // Login
  login: (email, senha) =>
    requisicao('/login', {
      method: 'POST',
      body: JSON.stringify({ email, senha }),
    }),

  // Chamados
  chamados: {
    listar: (filtros = {}) => {
      const params = new URLSearchParams(filtros).toString();
      return requisicao(`/chamados?${params}`);
    },

    buscar: (id) => requisicao(`/chamados/${id}`),

    criar: (dados) =>
      requisicao('/chamados', {
        method: 'POST',
        body: JSON.stringify(dados),
      }),

    atualizar: (id, dados) =>
      requisicao(`/chamados/${id}`, {
        method: 'PUT',
        body: JSON.stringify(dados),
      }),

    excluir: (id) =>
      requisicao(`/chamados/${id}`, {
        method: 'DELETE',
      }),
  },

  // Dashboard
  dashboard: {
    stats: () => requisicao('/dashboard'),
  },

  // Técnicos
  tecnicos: {
    listar: () => requisicao('/tecnicos'),

    criar: (dados) =>
      requisicao('/tecnicos', {
        method: 'POST',
        body: JSON.stringify(dados),
      }),
  },

  // Setores
  setores: {
    listar: () => requisicao('/setores'),
  },
};

export default api;