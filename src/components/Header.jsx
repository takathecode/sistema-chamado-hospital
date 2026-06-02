import { useState, useRef, useEffect } from 'react';
import { Search, Bell, ChevronDown, LogOut, User, Settings, X } from 'lucide-react';
import '../styles/header.css';

function Header({ tickets, currentUser, onLogout, onSearch }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const notificationRef = useRef(null);
  const userMenuRef = useRef(null);
  const searchInputRef = useRef(null);

  const notificationCount = tickets.filter(t => t.status === 'Pendente').length;

  useEffect(() => {
    function handleClickOutside(event) {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (onSearch) {
      onSearch(value);
    }
  };

  const clearSearch = () => {
    setSearchTerm('');
    if (onSearch) {
      onSearch('');
    }
    searchInputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      clearSearch();
    }
  };

  return (
    <header className="header">
      <div className="header-search">
        <Search size={18} className="search-icon" />
        <input
          ref={searchInputRef}
          type="text"
          placeholder="Pesquisar chamado por ID, título ou setor..."
          value={searchTerm}
          onChange={handleSearchChange}
          onKeyDown={handleKeyDown}
          className="search-input"
        />
        {searchTerm && (
          <button className="search-clear-btn" onClick={clearSearch} title="Limpar pesquisa">
            <X size={16} />
          </button>
        )}
      </div>

      <div className="header-actions">
        <div className="notification-wrapper" ref={notificationRef}>
          <button 
            className="notification-btn"
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowUserMenu(false);
            }}
          >
            <Bell size={20} />
            {notificationCount > 0 && (
              <span className="notification-badge">{notificationCount}</span>
            )}
          </button>
          
          {showNotifications && (
            <div className="notification-dropdown">
              <h3>Notificações</h3>
              {tickets.filter(t => t.status === 'Pendente').slice(0, 5).map(ticket => (
                <div key={ticket.id} className="notification-item">
                  <span className={`priority-dot ${ticket.priority.toLowerCase()}`}></span>
                  <div>
                    <p className="notification-title">{ticket.title}</p>
                    <p className="notification-time">{ticket.date} - {ticket.time}</p>
                  </div>
                </div>
              ))}
              {notificationCount === 0 && (
                <p className="no-notifications">Nenhuma notificação</p>
              )}
            </div>
          )}
        </div>

        <div className="user-menu-wrapper" ref={userMenuRef}>
          <div 
            className="user-profile"
            onClick={() => {
              setShowUserMenu(!showUserMenu);
              setShowNotifications(false);
            }}
          >
            <div className="avatar">
              <span>{currentUser?.name?.split(' ').map(n => n[0]).join('') || 'FT'}</span>
            </div>
            <span className="user-name">{currentUser?.name || 'Felippe Takahashi'}</span>
            <ChevronDown size={16} />
          </div>

          {showUserMenu && (
            <div className="user-dropdown">
              <div className="user-dropdown-header">
                <div className="avatar-large">
                  <span>{currentUser?.name?.split(' ').map(n => n[0]).join('') || 'FT'}</span>
                </div>
                <div>
                  <span className="dropdown-user-name">{currentUser?.name || 'Felippe Takahashi'}</span>
                  <span className="dropdown-user-role">{currentUser?.role || 'Administrador'}</span>
                </div>
              </div>
              <div className="dropdown-divider"></div>
              <button className="dropdown-item" onClick={() => setShowUserMenu(false)}>
                <User size={16} />
                Meu Perfil
              </button>
              <button className="dropdown-item" onClick={() => setShowUserMenu(false)}>
                <Settings size={16} />
                Configurações
              </button>
              <div className="dropdown-divider"></div>
              <button className="dropdown-item logout" onClick={onLogout}>
                <LogOut size={16} />
                Sair
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;  