import { useState, useMemo, useEffect } from 'react';
import { Edit2, Trash2, Search, Filter, X, AlertTriangle } from 'lucide-react';
import '../styles/cards.css';

function TicketTable({ tickets, onUpdateTicket, onDeleteTicket, externalSearchTerm }) {
  const [localSearch, setLocalSearch] = useState('');
  const [filterPriority, setFilterPriority] = useState('Todas');
  const [filterStatus, setFilterStatus] = useState('Todos');
  const [editTicket, setEditTicket] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null); // ID do chamado a excluir
  const [deleteError, setDeleteError] = useState('');

  // Atualizar busca local quando vem busca externa
  useEffect(() => {
    if (externalSearchTerm !== undefined) {
      setLocalSearch(externalSearchTerm);
    }
  }, [externalSearchTerm]);

  // Filtrar chamados
  const filteredTickets = useMemo(() => {
    const searchTerm = localSearch.toLowerCase().trim();
    
    return tickets.filter(ticket => {
      const matchesSearch = searchTerm === '' || 
        (ticket.id && ticket.id.toLowerCase().includes(searchTerm)) ||
        (ticket.codigo && ticket.codigo.toLowerCase().includes(searchTerm)) ||
        (ticket.titulo && ticket.titulo.toLowerCase().includes(searchTerm)) ||
        (ticket.setor_nome && ticket.setor_nome.toLowerCase().includes(searchTerm)) ||
        (ticket.tipo && ticket.tipo.toLowerCase().includes(searchTerm)) ||
        (ticket.tecnico_nome && ticket.tecnico_nome.toLowerCase().includes(searchTerm));
      
      const matchesPriority = filterPriority === 'Todas' || ticket.prioridade === filterPriority;
      const matchesStatus = filterStatus === 'Todos' || ticket.status === filterStatus;
      
      return matchesSearch && matchesPriority && matchesStatus;
    });
  }, [tickets, localSearch, filterPriority, filterStatus]);

  const priorityColors = {
    'Crítica': '#FF4D4F',
    'Média': '#FFA940',
    'Baixa': '#52C41A'
  };

  // Abrir modal de edição
  const handleEdit = (ticket) => {
    setEditTicket({ ...ticket });
    setDeleteError('');
  };

  // Salvar edição
  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!editTicket) return;

    try {
      // Mapear campos do backend para o formato esperado
      const dadosParaAtualizar = {
        titulo: editTicket.titulo,
        descricao: editTicket.descricao || '',
        setor_id: editTicket.setor_id,
        tipo: editTicket.tipo,
        prioridade: editTicket.prioridade,
        status: editTicket.status,
        tecnico_id: editTicket.tecnico_id || null
      };

      onUpdateTicket(editTicket.id || editTicket.codigo, dadosParaAtualizar);
      setEditTicket(null);
      setDeleteError('');
    } catch (error) {
      console.error('Erro ao salvar:', error);
      setDeleteError('Erro ao salvar alterações');
    }
  };

  // Confirmar exclusão
  const handleConfirmDelete = () => {
    if (!showDeleteConfirm) return;

    try {
      onDeleteTicket(showDeleteConfirm);
      setShowDeleteConfirm(null);
      setDeleteError('');
    } catch (error) {
      console.error('Erro ao excluir:', error);
      setDeleteError('Erro ao excluir chamado');
      setShowDeleteConfirm(null);
    }
  };

  // Cancelar exclusão
  const handleCancelDelete = () => {
    setShowDeleteConfirm(null);
    setDeleteError('');
  };

  // Fechar modal de edição
  const handleCloseEdit = () => {
    setEditTicket(null);
    setDeleteError('');
  };

  return (
    <div className="table-container">
      {/* Barra de ferramentas */}
      <div className="table-toolbar">
        <div className="search-wrapper">
          <Search size={16} />
          <input
            type="text"
            placeholder="Pesquisar chamados..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
          />
          {localSearch && (
            <button className="search-clear-btn" onClick={() => setLocalSearch('')}>
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

      {/* Resultado da busca */}
      {localSearch && (
        <div className="search-results-info">
          <p>
            Resultados para "<strong>{localSearch}</strong>": 
            <strong> {filteredTickets.length}</strong> chamado(s)
          </p>
        </div>
      )}

      {/* Mensagem de erro */}
      {deleteError && (
        <div className="error-message">
          <AlertTriangle size={16} />
          <span>{deleteError}</span>
          <button onClick={() => setDeleteError('')}><X size={14} /></button>
        </div>
      )}

      {/* Tabela */}
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
            {filteredTickets.length > 0 ? (
              filteredTickets.map(ticket => (
                <tr key={ticket.id || ticket.codigo}>
                  <td className="ticket-id-cell">{ticket.codigo || ticket.id}</td>
                  <td>{ticket.titulo}</td>
                  <td>{ticket.setor_nome || ticket.setor}</td>
                  <td>{ticket.tipo}</td>
                  <td>
                    <span 
                      className="priority-badge"
                      style={{ backgroundColor: priorityColors[ticket.prioridade] || '#6C757D' }}
                    >
                      {ticket.prioridade}
                    </span>
                  </td>
                  <td>
                    <span className={`status-indicator ${(ticket.status || '').toLowerCase().replace(' ', '-')}`}>
                      {ticket.status}
                    </span>
                  </td>
                  <td className="time-cell">
                    {ticket.data_abertura && ticket.hora_abertura 
                      ? `${ticket.data_abertura} ${ticket.hora_abertura}`
                      : ticket.time || '-'}
                  </td>
                  <td>{ticket.tecnico_nome || ticket.tecnico || 'Não atribuído'}</td>
                  <td className="actions-cell">
                    <button 
                      className="action-btn edit" 
                      onClick={() => handleEdit(ticket)}
                      title="Editar chamado"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button 
                      className="action-btn delete" 
                      onClick={() => setShowDeleteConfirm(ticket.id || ticket.codigo)}
                      title="Excluir chamado"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
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

      {/* Modal de Edição */}
      {editTicket && (
        <div className="modal-overlay" onClick={handleCloseEdit}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2>Editar Chamado</h2>
            <form onSubmit={handleSaveEdit}>
              <div className="form-group">
                <label>Título *</label>
                <input
                  type="text"
                  value={editTicket.titulo || ''}
                  onChange={(e) => setEditTicket({ ...editTicket, titulo: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Descrição</label>
                <textarea
                  value={editTicket.descricao || ''}
                  onChange={(e) => setEditTicket({ ...editTicket, descricao: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Setor *</label>
                  <select
                    value={editTicket.setor_id || ''}
                    onChange={(e) => setEditTicket({ ...editTicket, setor_id: e.target.value })}
                    required
                  >
                    <option value="">Selecionar</option>
                    <option value="1">Centro Cirúrgico</option>
                    <option value="2">UTI</option>
                    <option value="3">Emergência</option>
                    <option value="4">Recepção</option>
                    <option value="5">Enfermaria</option>
                    <option value="6">Radiologia</option>
                    <option value="7">Laboratório</option>
                    <option value="8">Corredor B</option>
                    <option value="9">Administrativo</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Tipo *</label>
                  <select
                    value={editTicket.tipo || ''}
                    onChange={(e) => setEditTicket({ ...editTicket, tipo: e.target.value })}
                    required
                  >
                    <option value="">Selecionar</option>
                    <option value="Ar-condicionado">Ar-condicionado</option>
                    <option value="Computador">Computador</option>
                    <option value="Impressora">Impressora</option>
                    <option value="Equipamento Médico">Equipamento Médico</option>
                    <option value="Elétrica">Elétrica</option>
                    <option value="Hidráulica">Hidráulica</option>
                    <option value="Manutenção Geral">Manutenção Geral</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Prioridade</label>
                  <select
                    value={editTicket.prioridade || 'Média'}
                    onChange={(e) => setEditTicket({ ...editTicket, prioridade: e.target.value })}
                  >
                    <option value="Baixa">Baixa</option>
                    <option value="Média">Média</option>
                    <option value="Crítica">Crítica</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Status</label>
                  <select
                    value={editTicket.status || 'Pendente'}
                    onChange={(e) => setEditTicket({ ...editTicket, status: e.target.value })}
                  >
                    <option value="Pendente">Pendente</option>
                    <option value="Em andamento">Em andamento</option>
                    <option value="Resolvido">Resolvido</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Técnico Responsável</label>
                <select
                  value={editTicket.tecnico_id || ''}
                  onChange={(e) => setEditTicket({ ...editTicket, tecnico_id: e.target.value || null })}
                >
                  <option value="">Não atribuído</option>
                  <option value="1">Carlos Silva (Elétrica)</option>
                  <option value="2">Mariana Souza (TI)</option>
                  <option value="3">Lucas Pereira (Equip. Médicos)</option>
                </select>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={handleCloseEdit}>
                  Cancelar
                </button>
                <button type="submit" className="btn-save">
                  Salvar Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Exclusão */}
      {showDeleteConfirm && (
        <div className="modal-overlay" onClick={handleCancelDelete}>
          <div className="modal-content delete-modal" onClick={e => e.stopPropagation()}>
            <div className="delete-icon-wrapper">
              <AlertTriangle size={48} color="#FF4D4F" />
            </div>
            <h3>Confirmar Exclusão</h3>
            <p>Tem certeza que deseja excluir este chamado?</p>
            <p className="delete-warning">Esta ação não pode ser desfeita!</p>
            <div className="modal-actions delete-actions">
              <button className="btn-cancel" onClick={handleCancelDelete}>
                Cancelar
              </button>
              <button className="btn-delete" onClick={handleConfirmDelete}>
                Sim, Excluir Chamado
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TicketTable;