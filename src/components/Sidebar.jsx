import { 
  LayoutDashboard, 
  PlusCircle, 
  Users, 
  ClipboardList, 
  Settings,
  ChevronLeft,
  ChevronRight,
  Stethoscope
} from 'lucide-react';
import '../styles/sidebar.css';

function Sidebar({ currentPage, onNavigate, collapsed, onToggle }) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'novo-chamado', label: 'Novo Chamado', icon: PlusCircle },
    { id: 'tecnicos', label: 'Técnicos', icon: Users },
    { id: 'relatorios', label: 'Relatórios', icon: ClipboardList },
    { id: 'configuracoes', label: 'Configurações', icon: Settings }
  ];

  return (
    <>
      <div className={`sidebar-overlay ${collapsed ? 'hidden' : ''}`} onClick={onToggle} />
      <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          {!collapsed && (
            <div className="sidebar-logo">
              <Stethoscope size={28} color="#1677FF" />
              <span className="logo-text">Hospital<span className="logo-highlight">Care</span></span>
            </div>
          )}
          <button className="toggle-btn" onClick={onToggle}>
            {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>
        
        <nav className="sidebar-nav">
          {menuItems.map(item => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                className={`nav-item ${currentPage === item.id ? 'active' : ''}`}
                onClick={() => onNavigate(item.id)}
                title={collapsed ? item.label : ''}
              >
                <Icon size={20} />
                {!collapsed && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {!collapsed && (
          <div className="sidebar-footer">
            <div className="system-status">
              <span className="status-dot"></span>
              Sistema Operacional
            </div>
          </div>
        )}
      </aside>
    </>
  );
}

export default Sidebar;