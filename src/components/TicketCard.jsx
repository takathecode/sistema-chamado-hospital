import { Clock, MapPin, AlertCircle } from 'lucide-react';
import '../styles/cards.css';

function TicketCard({ ticket }) {
  const priorityColors = {
    'Crítica': '#FF4D4F',
    'Média': '#FFA940',
    'Baixa': '#52C41A'
  };

  const statusColors = {
    'Pendente': '#FFA940',
    'Em andamento': '#1677FF',
    'Resolvido': '#52C41A'
  };

  return (
    <div className="ticket-card">
      <div className="ticket-card-header">
        <span className="ticket-id">{ticket.id}</span>
        <span 
          className="priority-badge"
          style={{ backgroundColor: priorityColors[ticket.priority] }}
        >
          {ticket.priority}
        </span>
      </div>
      
      <h4 className="ticket-title">{ticket.title}</h4>
      
      <div className="ticket-meta">
        <span className="meta-item">
          <MapPin size={14} />
          {ticket.sector}
        </span>
        <span className="meta-item">
          <Clock size={14} />
          {ticket.time}
        </span>
      </div>
      
      <div className="ticket-footer">
        <span 
          className="status-badge"
          style={{ 
            backgroundColor: statusColors[ticket.status] + '20',
            color: statusColors[ticket.status]
          }}
        >
          {ticket.status}
        </span>
        {ticket.technician && (
          <span className="technician-name">{ticket.technician}</span>
        )}
      </div>
    </div>
  );
}

export default TicketCard;