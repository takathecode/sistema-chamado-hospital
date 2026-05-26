import { useState, useMemo, useEffect } from 'react';
import { Edit2, Trash2, Search, Filter, X } from 'lucide-react';
import '../styles/cards.css';

function TicketTable({ tickets, onUpdateTicket, onDeleteTicket, externalSearchTerm }) {
  const [localSearch, setLocalSearch] = useState('');
  const [filterPriority, setFilterPriority] = useState('Todas');
  const [filterStatus, setFilterStatus] = useState('Todos');
  const [editTicket, setEditTicket] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  useEffect(() => {
    if (externalSearchTerm !== undefined) {
      setLocalSearch(externalSearchTerm);
    }
  }, [externalSearchTerm]);

  const filteredTickets = useMemo(() => {
    const searchTerm = localSearch.toLowerCase().trim();
    
    return tickets.filter(ticket => {
      const matchesSearch = searchTerm === '' || 
        ticket.id.toLowerCase().includes(searchTerm) ||
        ticket.title.toLowerCase().includes(searchTerm) ||
        ticket.sector.toLowerCase().includes(searchTerm) ||
        ticket.type.toLowerCase().includes(searchTerm) ||
        (ticket.technician && ticket.technician.toLowerCase().includes(searchTerm));
      
      const matchesPriority = filterPriority === 'Todas' || ticket.priority === filterPriority;
      const matchesStatus = filterStatus === 'Todos' || ticket.status === filterStatus;
      
      return matchesSearch && matchesPriority && matchesStatus;
    });
  }, [tickets, localSearch, filterPriority, filterStatus]);

  const priorityColors = {
    'Crítica': '#FF4D4F',
    'Média': '#FFA940',
    'Baixa': '#52C41A'
  };

  const handleEdit = (ticket) => {
    setEditTicket({ ...ticket });
  };

  const handleSaveEdit = () => {
    if (editTicket) {
      onUpdateTicket(editTicket.id, editTicket);
      setEditTicket(null);
    }
  };

  const handleDelete = () => {
    if (showDeleteConfirm) {
      onDeleteTicket(showDeleteConfirm);
      setShowDeleteConfirm(null);
    }
  };

  const clearLocalSearch = () => {
    setLocalSearch('');
  };

  return (
    <div className="table-container">
      <div className="table-toolbar">
        <div className="search-wrapper">
          <Search size={16} />
          <input
            type="text"
            placeholder="Pesquisar por título, ID, setor, tipo ou técnico..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
          />
          {localSearch && (
            <button className="search-clear-btn" onClick={clearLocalSearch} title="Limpar pesquisa">
              <X size={16} />
            </button>
          )}
        </div>
        <div className="filter-group">
          <Filter size={16} />
          <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)}>
            <option value="Todas">Todas Prioridades</option>
            <option value="Crítica">Crítica</option>
            <option value="Média">Média</option>
            <option value="Baixa">Baixa</option>
          </select>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="Todos">Todos Status</option>
            <option value="Pendente">Pendente</option>
            <option value="Em andamento">Em andamento</option>
            <option value="Resolvido">Resolvido</option>
          </select>
        </div>
      </div>

      <div className="search-results-info">
        {localSearch && (
          <p>
            Resultados para "<strong>{localSearch}</strong>": 
            <strong> {filteredTickets.length}</strong> chamado(s) encontrado(s)
          </p>
        )}
      </div>

      <div className="table-wrapper">
        <table className="ticket-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Título</th>
              <th>Setor</th>
              <th>Tipo</th>
              <th>Prioridade</th>
              <th>Status</th>
              <th>Horário</th>
              <th>Técnico</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {filteredTickets.map(ticket => (
              <tr key={ticket.id}>
                <td className="ticket-id-cell">{ticket.id}</td>
                <td>{ticket.title}</td>
                <td>{ticket.sector}</td>
                <td>{ticket.type}</td>
                <td>
                  <span 
                    className="priority-badge"
                    style={{ backgroundColor: priorityColors[ticket.priority] }}
                  >
                    {ticket.priority}
                  </span>
                </td>
                <td>
                  <span className={`status-indicator ${ticket.status.toLowerCase().replace(' ', '-')}`}>
                    {ticket.status}
                  </span>
                </td>
                <td className="time-cell">{ticket.date} {ticket.time}</td>
                <td>{ticket.technician || 'Não atribuído'}</td>
                <td className="actions-cell">
                  <button className="action-btn edit" onClick={() => handleEdit(ticket)} title="Editar">
                    <Edit2 size={16} />
                  </button>
                  <button className="action-btn delete" onClick={() => setShowDeleteConfirm(ticket.id)} title="Excluir">
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
            {filteredTickets.length === 0 && (
              <tr>
                <td colSpan="9" className="empty-table">
                  {localSearch || filterPriority !== 'Todas' || filterStatus !== 'Todos' 
                    ? 'Nenhum chamado encontrado com os filtros atuais' 
                    : 'Nenhum chamado cadastrado'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {editTicket && (
        <div className="modal-overlay" onClick={() => setEditTicket(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2>Editar Chamado {editTicket.id}</h2>
            <form onSubmit={(e) => { e.preventDefault(); handleSaveEdit(); }}>
              <div className="form-group">
                <label>Título</label>
                <input
                  type="text"
                  value={editTicket.title}
                  onChange={(e) => setEditTicket({ ...editTicket, title: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Descrição</label>
                <textarea
                  value={editTicket.description || ''}
                  onChange={(e) => setEditTicket({ ...editTicket, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Setor</label>
                  <input
                    type="text"
                    value={editTicket.sector}
                    onChange={(e) => setEditTicket({ ...editTicket, sector: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Tipo</label>
                  <input
                    type="text"
                    value={editTicket.type}
                    onChange={(e) => setEditTicket({ ...editTicket, type: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Prioridade</label>
                  <select
                    value={editTicket.priority}
                    onChange={(e) => setEditTicket({ ...editTicket, priority: e.target.value })}
                  >
                    <option value="Baixa">Baixa</option>
                    <option value="Média">Média</option>
                    <option value="Crítica">Crítica</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select
                    value={editTicket.status}
                    onChange={(e) => setEditTicket({ ...editTicket, status: e.target.value })}
                  >
                    <option value="Pendente">Pendente</option>
                    <option value="Em andamento">Em andamento</option>
                    <option value="Resolvido">Resolvido</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Técnico</label>
                <input
                  type="text"
                  value={editTicket.technician || ''}
                  onChange={(e) => setEditTicket({ ...editTicket, technician: e.target.value })}
                  placeholder="Nome do técnico responsável"
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setEditTicket(null)}>Cancelar</button>
                <button type="submit" className="btn-save">Salvar Alterações</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="modal-overlay" onClick={() => setShowDeleteConfirm(null)}>
          <div className="modal-content delete-modal" onClick={e => e.stopPropagation()}>
            <div className="delete-icon-wrapper">
              <AlertTriangle size={40} color="#FF4D4F" />
            </div>
            <h3>Deseja realmente excluir este chamado?</h3>
            <p>Esta ação não pode ser desfeita. O chamado será removido permanentemente.</p>
            <div className="modal-actions delete-actions">
              <button className="btn-cancel" onClick={() => setShowDeleteConfirm(null)}>Cancelar</button>
              <button className="btn-delete" onClick={handleDelete}>Sim, excluir chamado</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TicketTable;