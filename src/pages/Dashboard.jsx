import { useState, useMemo } from 'react';
import { AlertCircle, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import StatusCard from '../components/StatusCard';
import TicketTable from '../components/TicketTable';
import '../styles/dashboard.css';

function Dashboard({ tickets, onUpdateTicket, onDeleteTicket, searchTerm }) {
  const openTickets = tickets.filter(t => t.status === 'Pendente').length;
  const inProgressTickets = tickets.filter(t => t.status === 'Em andamento').length;
  const resolvedTickets = tickets.filter(t => t.status === 'Resolvido').length;
  const criticalTickets = tickets.filter(t => t.priority === 'Crítica' && t.status !== 'Resolvido').length;

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p>Visão geral dos chamados técnicos</p>
      </div>

      <div className="cards-grid">
        <StatusCard 
          icon={AlertCircle}
          title="Chamados Abertos"
          value={openTickets}
          color="#1677FF"
          bgColor="#E6F4FF"
        />
        <StatusCard 
          icon={Clock}
          title="Em Andamento"
          value={inProgressTickets}
          color="#FFA940"
          bgColor="#FFF7E6"
        />
        <StatusCard 
          icon={CheckCircle}
          title="Resolvidos"
          value={resolvedTickets}
          color="#52C41A"
          bgColor="#F6FFED"
        />
        <StatusCard 
          icon={AlertTriangle}
          title="Críticos"
          value={criticalTickets}
          color="#FF4D4F"
          bgColor="#FFF1F0"
        />
      </div>

      <div className="table-section">
        <h2>Chamados Recentes</h2>
        <TicketTable 
          tickets={tickets} 
          onUpdateTicket={onUpdateTicket}
          onDeleteTicket={onDeleteTicket}
          externalSearchTerm={searchTerm}
        />
      </div>
    </div>
  );
}

export default Dashboard;