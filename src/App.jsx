import { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import NovoChamado from './pages/NovoChamado';
import Tecnicos from './pages/Tecnicos';
import Relatorios from './pages/Relatorios';
import Configuracoes from './pages/Configuracoes';
import Login from './pages/Login';
import './App.css';

const initialTickets = [
  {
    id: '#CH-0842',
    title: 'Ar-condicionado Centro Cirúrgico',
    description: 'Ar-condicionado parou de funcionar completamente',
    sector: 'Centro Cirúrgico',
    type: 'Ar-condicionado',
    priority: 'Crítica',
    status: 'Em andamento',
    time: '14:32:05',
    date: '2026-05-26',
    technician: 'Carlos Silva'
  },
  {
    id: '#CH-0843',
    title: 'Impressora Recepção',
    description: 'Impressora travada com papel atolado',
    sector: 'Recepção',
    type: 'Impressora',
    priority: 'Média',
    status: 'Pendente',
    time: '15:10:02',
    date: '2026-05-26',
    technician: null
  },
  {
    id: '#CH-0844',
    title: 'Troca de lâmpada corredor',
    description: 'Lâmpada queimada no corredor B',
    sector: 'Corredor B',
    type: 'Elétrica',
    priority: 'Baixa',
    status: 'Resolvido',
    time: '16:45:10',
    date: '2026-05-25',
    technician: 'Carlos Silva'
  },
  {
    id: '#CH-0845',
    title: 'Monitor com defeito UTI',
    description: 'Monitor cardíaco apresentando falhas intermitentes',
    sector: 'UTI',
    type: 'Equipamento Médico',
    priority: 'Crítica',
    status: 'Pendente',
    time: '08:15:30',
    date: '2026-05-26',
    technician: null
  },
  {
    id: '#CH-0846',
    title: 'Vazamento no laboratório',
    description: 'Vazamento de água próximo às bancadas',
    sector: 'Laboratório',
    type: 'Hidráulica',
    priority: 'Média',
    status: 'Em andamento',
    time: '11:20:45',
    date: '2026-05-26',
    technician: 'Lucas Pereira'
  }
];

const initialTechnicians = [
  {
    id: 1,
    name: 'Carlos Silva',
    specialty: 'Elétrica',
    activeTickets: 2,
    status: 'online',
    phone: '(11) 98888-1111',
    email: 'carlos.silva@hospital.com'
  },
  {
    id: 2,
    name: 'Mariana Souza',
    specialty: 'TI',
    activeTickets: 3,
    status: 'online',
    phone: '(11) 98888-2222',
    email: 'mariana.souza@hospital.com'
  },
  {
    id: 3,
    name: 'Lucas Pereira',
    specialty: 'Equipamentos Médicos',
    activeTickets: 1,
    status: 'offline',
    phone: '(11) 98888-3333',
    email: 'lucas.pereira@hospital.com'
  }
];

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem('hospitalLoggedIn') === 'true';
  });
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('hospitalCurrentUser');
    return saved ? JSON.parse(saved) : null;
  });
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [globalSearch, setGlobalSearch] = useState('');
  const [tickets, setTickets] = useState(() => {
    const saved = localStorage.getItem('hospitalTickets');
    if (saved) {
      return JSON.parse(saved);
    }
    localStorage.setItem('hospitalTickets', JSON.stringify(initialTickets));
    return initialTickets;
  });
  const [technicians, setTechnicians] = useState(() => {
    const saved = localStorage.getItem('hospitalTechnicians');
    if (saved) {
      return JSON.parse(saved);
    }
    localStorage.setItem('hospitalTechnicians', JSON.stringify(initialTechnicians));
    return initialTechnicians;
  });
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    localStorage.setItem('hospitalTickets', JSON.stringify(tickets));
  }, [tickets]);

  useEffect(() => {
    localStorage.setItem('hospitalTechnicians', JSON.stringify(technicians));
  }, [technicians]);

  useEffect(() => {
    localStorage.setItem('hospitalLoggedIn', isLoggedIn);
  }, [isLoggedIn]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('hospitalCurrentUser', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('hospitalCurrentUser');
    }
  }, [currentUser]);

  const handleLogin = (user) => {
    setIsLoggedIn(true);
    setCurrentUser(user);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    setCurrentPage('dashboard');
    setGlobalSearch('');
  };

  const handleGlobalSearch = (searchValue) => {
    setGlobalSearch(searchValue);
    if (searchValue && currentPage !== 'dashboard') {
      setCurrentPage('dashboard');
    }
  };

  const addTicket = useCallback((newTicket) => {
    setTickets(prev => {
      const now = new Date();
      const time = now.toTimeString().slice(0, 8);
      const date = now.toISOString().slice(0, 10);
      const lastId = prev.length > 0 
        ? Math.max(...prev.map(t => parseInt(t.id.replace('#CH-', ''))))
        : 841;
      const newId = `#CH-${String(lastId + 1).padStart(4, '0')}`;
      
      return [...prev, {
        ...newTicket,
        id: newId,
        time,
        date,
        status: 'Pendente',
        technician: null
      }];
    });
  }, []);

  const updateTicket = useCallback((id, updatedData) => {
    setTickets(prev => prev.map(ticket => 
      ticket.id === id ? { ...ticket, ...updatedData } : ticket
    ));
  }, []);

  const deleteTicket = useCallback((id) => {
    setTickets(prev => prev.filter(ticket => ticket.id !== id));
  }, []);

  const addTechnician = useCallback((newTechnician) => {
    setTechnicians(prev => [...prev, {
      ...newTechnician,
      id: Date.now(),
      activeTickets: 0,
      status: 'online'
    }]);
  }, []);

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  const renderPage = () => {
    switch(currentPage) {
      case 'dashboard':
        return <Dashboard 
          tickets={tickets} 
          onUpdateTicket={updateTicket}
          onDeleteTicket={deleteTicket}
          searchTerm={globalSearch}
        />;
      case 'novo-chamado':
        return <NovoChamado onAddTicket={addTicket} />;
      case 'tecnicos':
        return <Tecnicos 
          technicians={technicians} 
          tickets={tickets}
          onAddTechnician={addTechnician}
        />;
      case 'relatorios':
        return <Relatorios tickets={tickets} />;
      case 'configuracoes':
        return <Configuracoes />;
      default:
        return <Dashboard 
          tickets={tickets} 
          onUpdateTicket={updateTicket}
          onDeleteTicket={deleteTicket}
          searchTerm={globalSearch}
        />;
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
          {renderPage()}
        </main>
      </div>
    </div>
  );
}

export default App;