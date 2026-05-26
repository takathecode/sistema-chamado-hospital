import { useState } from 'react';
import { 
  User, 
  Wrench, 
  Circle, 
  Phone, 
  Mail, 
  Plus,
  X
} from 'lucide-react';
import '../styles/form.css';

function Tecnicos({ technicians, tickets, onAddTechnician }) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTech, setNewTech] = useState({
    name: '',
    specialty: '',
    phone: '',
    email: ''
  });

  const getActiveTicketsCount = (techName) => {
    return tickets.filter(t => 
      t.technician === techName && 
      t.status !== 'Resolvido'
    ).length;
  };

  const specialties = [
    'Elétrica',
    'TI',
    'Equipamentos Médicos',
    'Ar-condicionado',
    'Hidráulica',
    'Manutenção Geral',
    'Rede/Internet'
  ];

  const handleAddTechnician = (e) => {
    e.preventDefault();
    onAddTechnician({
      name: newTech.name,
      specialty: newTech.specialty,
      phone: newTech.phone,
      email: newTech.email,
      status: 'online'
    });
    setNewTech({ name: '', specialty: '', phone: '', email: '' });
    setShowAddForm(false);
  };

  return (
    <div className="tecnicos-page">
      <div className="page-header">
        <div>
          <h1>Técnicos</h1>
          <p>Equipe de manutenção e suporte técnico</p>
        </div>
        <button 
          className="add-tech-btn"
          onClick={() => setShowAddForm(true)}
        >
          <Plus size={18} />
          Adicionar Técnico
        </button>
      </div>

      <div className="tech-grid">
        {technicians.map(tech => {
          const activeTickets = getActiveTicketsCount(tech.name);
          return (
            <div key={tech.id} className="tech-card">
              <div className="tech-card-header">
                <div className="tech-avatar">
                  <User size={32} color="#6C757D" />
                </div>
                <div className={`tech-status ${tech.status}`}>
                  <Circle size={10} fill={tech.status === 'online' ? '#52C41A' : '#6C757D'} />
                  <span>{tech.status === 'online' ? 'Online' : 'Offline'}</span>
                </div>
              </div>
              
              <h3 className="tech-name">{tech.name}</h3>
              
              <div className="tech-specialty">
                <Wrench size={16} />
                <span>{tech.specialty}</span>
              </div>
              
              <div className="tech-stats">
                <div className="tech-stat">
                  <span className="stat-label">Chamados Ativos</span>
                  <span className="stat-value">{activeTickets}</span>
                </div>
                <div className="tech-stat">
                  <span className="stat-label">Total Resolvidos</span>
                  <span className="stat-value">
                    {tickets.filter(t => t.technician === tech.name && t.status === 'Resolvido').length}
                  </span>
                </div>
              </div>

              {(tech.phone || tech.email) && (
                <div className="tech-contact">
                  {tech.phone && (
                    <div className="contact-item">
                      <Phone size={14} />
                      <span>{tech.phone}</span>
                    </div>
                  )}
                  {tech.email && (
                    <div className="contact-item">
                      <Mail size={14} />
                      <span>{tech.email}</span>
                    </div>
                  )}
                </div>
              )}

              <div className="tech-progress">
                <div className="progress-bar">
                  <div 
                    className={`progress-fill ${tech.status}`}
                    style={{ 
                      width: activeTickets > 0 ? `${Math.min(100, activeTickets * 20)}%` : '0%' 
                    }}
                  />
                </div>
                <span className="progress-label">
                  {activeTickets === 0 ? 'Disponível' : `${activeTickets} chamado(s) ativo(s)`}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {technicians.length === 0 && (
        <div className="empty-tech">
          <p>Nenhum técnico cadastrado</p>
        </div>
      )}

      {/* Add Technician Modal */}
      {showAddForm && (
        <div className="modal-overlay" onClick={() => setShowAddForm(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Adicionar Técnico</h2>
              <button className="close-modal" onClick={() => setShowAddForm(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddTechnician}>
              <div className="form-group">
                <label>Nome Completo *</label>
                <input
                  type="text"
                  placeholder="Nome do técnico"
                  value={newTech.name}
                  onChange={(e) => setNewTech({ ...newTech, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Especialidade *</label>
                <select
                  value={newTech.specialty}
                  onChange={(e) => setNewTech({ ...newTech, specialty: e.target.value })}
                  required
                >
                  <option value="">Selecionar especialidade</option>
                  {specialties.map(spec => (
                    <option key={spec} value={spec}>{spec}</option>
                  ))}
                </select>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Telefone</label>
                  <input
                    type="tel"
                    placeholder="(11) 99999-9999"
                    value={newTech.phone}
                    onChange={(e) => setNewTech({ ...newTech, phone: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    placeholder="email@hospital.com"
                    value={newTech.email}
                    onChange={(e) => setNewTech({ ...newTech, email: e.target.value })}
                  />
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowAddForm(false)}>Cancelar</button>
                <button type="submit" className="btn-save">Adicionar Técnico</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Tecnicos;