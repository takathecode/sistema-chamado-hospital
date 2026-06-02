import { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import NovoChamado from './pages/NovoChamado';
import Tecnicos from './pages/Tecnicos';
import Relatorios from './pages/Relatorios';
import Configuracoes from './pages/Configuracoes';
import Login from './pages/Login';
import api from './services/api';
import './App.css';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return !!localStorage.getItem('token');
  });
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('usuario');
    return saved ? JSON.parse(saved) : null;
  });
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [globalSearch, setGlobalSearch] = useState('');
  const [tickets, setTickets] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Carregar dados iniciais
  const carregarDados = useCallback(async () => {
    if (!isLoggedIn) return;
    
    setLoading(true);
    setError('');
    
    try {
      const [respostaChamados, respostaTecnicos] = await Promise.all([
        api.chamados.listar(),
        api.tecnicos.listar()
      ]);

      if (respostaChamados.sucesso) {
        setTickets(respostaChamados.dados);
      }
      
      if (respostaTecnicos.sucesso) {
        setTechnicians(respostaTecnicos.dados);
      }
    } catch (erro) {
      console.error('Erro ao carregar dados:', erro);
      setError('Erro ao carregar dados. Verifique se o servidor está rodando.');
      
      // Se token expirou, fazer logout
      if (erro.message.includes('Token')) {
        handleLogout();
      }
    } finally {
      setLoading(false);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  // Login
  const handleLogin = async (email, senha) => {
    try {
      const resposta = await api.login(email, senha);
      
      if (resposta.sucesso) {
        localStorage.setItem('token', resposta.token);
        localStorage.setItem('usuario', JSON.stringify(resposta.usuario));
        setIsLoggedIn(true);
        setCurrentUser(resposta.usuario);
        setError('');
      }
    } catch (erro) {
      console.error('Erro no login:', erro);
      setError(erro.message || 'Erro ao fazer login');
      throw erro;
    }
  };

  // Logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    setIsLoggedIn(false);
    setCurrentUser(null);
    setCurrentPage('dashboard');
    setGlobalSearch('');
    setTickets([]);
    setTechnicians([]);
  };

  // Pesquisa global
  const handleGlobalSearch = (searchValue) => {
    setGlobalSearch(searchValue);
    if (searchValue && currentPage !== 'dashboard') {
      setCurrentPage('dashboard');
    }
  };

  // CRUD Chamados
  const addTicket = async (novoChamado) => {
    try {
      const resposta = await api.chamados.criar(novoChamado);
      if (resposta.sucesso) {
        await carregarDados(); // Recarregar lista
        setCurrentPage('dashboard');
      }
    } catch (erro) {
      console.error('Erro ao criar chamado:', erro);
      setError('Erro ao criar chamado');
    }
  };

  const updateTicket = async (id, dados) => {
    try {
      const resposta = await api.chamados.atualizar(id, dados);
      if (resposta.sucesso) {
        await carregarDados(); // Recarregar lista
      }
    } catch (erro) {
      console.error('Erro ao atualizar chamado:', erro);
      setError('Erro ao atualizar chamado');
    }
  };

  const deleteTicket = async (id) => {
    try {
      const resposta = await api.chamados.excluir(id);
      if (resposta.sucesso) {
        // Remover da lista local imediatamente
        setTickets(prev => prev.filter(ticket => 
          String(ticket.id) !== String(id) && String(ticket.codigo) !== String(id)
        ));
      }
    } catch (erro) {
      console.error('Erro ao excluir chamado:', erro);
      setError('Erro ao excluir chamado. Tente novamente.');
    }
  };

  const addTechnician = async (novoTecnico) => {
    try {
      const resposta = await api.tecnicos.criar(novoTecnico);
      if (resposta.sucesso) {
        await carregarDados(); // Recarregar lista
      }
    } catch (erro) {
      console.error('Erro ao cadastrar técnico:', erro);
      setError('Erro ao cadastrar técnico');
    }
  };

  // Tela de login
  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} error={error} />;
  }

  // Tela de carregamento
  if (loading && tickets.length === 0) {
    return (
      <div className="loading-screen">
        <div className="spinner-large"></div>
        <p>Carregando dados do servidor...</p>
      </div>
    );
  }

  // Renderizar página atual
  const renderPage = () => {
    switch(currentPage) {
      case 'dashboard':
        return (
          <Dashboard 
            tickets={tickets} 
            onUpdateTicket={updateTicket}
            onDeleteTicket={deleteTicket}
            searchTerm={globalSearch}
            error={error}
          />
        );
      case 'novo-chamado':
        return <NovoChamado onAddTicket={addTicket} />;
      case 'tecnicos':
        return (
          <Tecnicos 
            technicians={technicians} 
            tickets={tickets}
            onAddTechnician={addTechnician}
          />
        );
      case 'relatorios':
        return <Relatorios tickets={tickets} />;
      case 'configuracoes':
        return <Configuracoes />;
      default:
        return (
          <Dashboard 
            tickets={tickets} 
            onUpdateTicket={updateTicket}
            onDeleteTicket={deleteTicket}
            searchTerm={globalSearch}
          />
        );
    }
  };

  return (
    <div className="app-container">
      <Sidebar 
        currentPage={currentPage} 
        onNavigate={(page) => {
          setCurrentPage(page);
          if (page !== 'dashboard') {
            setGlobalSearch('');
          }
        }}
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      <div className={`main-wrapper ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <Header 
          tickets={tickets} 
          currentUser={currentUser}
          onLogout={handleLogout}
          onSearch={handleGlobalSearch}
        />
        <main className="main-content">
          {error && (
            <div className="global-error">
              <span>{error}</span>
              <button onClick={() => setError('')}>✕</button>
            </div>
          )}
          {renderPage()}
        </main>
      </div>
    </div>
  );
}

export default App;