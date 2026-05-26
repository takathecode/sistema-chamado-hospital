import { useState, useMemo } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Download, 
  Calendar,
  Filter,
  PieChart,
  Clock,
  CheckCircle,
  AlertTriangle,
  Activity,
  ArrowUp,
  ArrowDown,
  Printer
} from 'lucide-react';
import '../styles/relatorios.css';

function Relatorios({ tickets }) {
  const [dateRange, setDateRange] = useState('7d');
  const [selectedSector, setSelectedSector] = useState('Todos');
  const [selectedType, setSelectedType] = useState('Todos');

  const sectors = ['Todos', ...new Set(tickets.map(t => t.sector))];
  const types = ['Todos', ...new Set(tickets.map(t => t.type))];

  const filteredTickets = useMemo(() => {
    const now = new Date();
    let dateFilter;
    
    switch(dateRange) {
      case '7d':
        dateFilter = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        dateFilter = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        dateFilter = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        dateFilter = new Date(0);
    }

    return tickets.filter(ticket => {
      const ticketDate = new Date(ticket.date);
      const matchesDate = ticketDate >= dateFilter;
      const matchesSector = selectedSector === 'Todos' || ticket.sector === selectedSector;
      const matchesType = selectedType === 'Todos' || ticket.type === selectedType;
      return matchesDate && matchesSector && matchesType;
    });
  }, [tickets, dateRange, selectedSector, selectedType]);

  const stats = useMemo(() => {
    const total = filteredTickets.length;
    const resolved = filteredTickets.filter(t => t.status === 'Resolvido').length;
    const pending = filteredTickets.filter(t => t.status === 'Pendente').length;
    const inProgress = filteredTickets.filter(t => t.status === 'Em andamento').length;
    const critical = filteredTickets.filter(t => t.priority === 'Crítica' && t.status !== 'Resolvido').length;
    
    const resolutionRate = total > 0 ? ((resolved / total) * 100).toFixed(1) : 0;
    
    const avgResolutionTime = resolved > 0 ? '4.2 horas' : 'N/A';

    const sectorStats = {};
    filteredTickets.forEach(ticket => {
      if (!sectorStats[ticket.sector]) {
        sectorStats[ticket.sector] = { total: 0, resolved: 0, critical: 0 };
      }
      sectorStats[ticket.sector].total++;
      if (ticket.status === 'Resolvido') sectorStats[ticket.sector].resolved++;
      if (ticket.priority === 'Crítica') sectorStats[ticket.sector].critical++;
    });

    const priorityStats = {
      'Crítica': filteredTickets.filter(t => t.priority === 'Crítica').length,
      'Média': filteredTickets.filter(t => t.priority === 'Média').length,
      'Baixa': filteredTickets.filter(t => t.priority === 'Baixa').length,
    };

    return {
      total,
      resolved,
      pending,
      inProgress,
      critical,
      resolutionRate,
      avgResolutionTime,
      sectorStats,
      priorityStats
    };
  }, [filteredTickets]);

  const topSectors = Object.entries(stats.sectorStats)
    .sort((a, b) => b[1].total - a[1].total)
    .slice(0, 5);

  const getTrend = () => {
    const previousTotal = tickets.length - filteredTickets.length;
    if (previousTotal === 0) return { value: 0, direction: 'up' };
    const change = ((filteredTickets.length - previousTotal) / previousTotal) * 100;
    return {
      value: Math.abs(change).toFixed(1),
      direction: change >= 0 ? 'up' : 'down'
    };
  };

  const trend = getTrend();

  return (
    <div className="relatorios-page">
      <div className="page-header">
        <div>
          <h1>Relatórios</h1>
          <p>Análise detalhada dos chamados técnicos</p>
        </div>
        <div className="header-actions-group">
          <button className="export-btn">
            <Download size={16} />
            Exportar PDF
          </button>
          <button className="export-btn secondary">
            <Printer size={16} />
            Imprimir
          </button>
        </div>
      </div>

      <div className="filters-bar">
        <div className="filter-group">
          <Calendar size={16} />
          <select value={dateRange} onChange={(e) => setDateRange(e.target.value)}>
            <option value="7d">Últimos 7 dias</option>
            <option value="30d">Últimos 30 dias</option>
            <option value="90d">Últimos 90 dias</option>
            <option value="all">Todo período</option>
          </select>
        </div>
        <div className="filter-group">
          <Filter size={16} />
          <select value={selectedSector} onChange={(e) => setSelectedSector(e.target.value)}>
            {sectors.map(s => (
              <option key={s} value={s}>{s === 'Todos' ? 'Todos Setores' : s}</option>
            ))}
          </select>
        </div>
        <div className="filter-group">
          <Filter size={16} />
          <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)}>
            {types.map(t => (
              <option key={t} value={t}>{t === 'Todos' ? 'Todos Tipos' : t}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card primary">
          <div className="stat-card-header">
            <BarChart3 size={20} />
            <span>Total de Chamados</span>
          </div>
          <div className="stat-card-value">{stats.total}</div>
          <div className="stat-card-trend">
            <span className={`trend-indicator ${trend.direction}`}>
              {trend.direction === 'up' ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
              {trend.value}%
            </span>
            <span className="trend-label">vs período anterior</span>
          </div>
        </div>

        <div className="stat-card success">
          <div className="stat-card-header">
            <CheckCircle size={20} />
            <span>Taxa de Resolução</span>
          </div>
          <div className="stat-card-value">{stats.resolutionRate}%</div>
          <div className="stat-card-detail">{stats.resolved} resolvidos de {stats.total}</div>
        </div>

        <div className="stat-card warning">
          <div className="stat-card-header">
            <Clock size={20} />
            <span>Tempo Médio</span>
          </div>
          <div className="stat-card-value">{stats.avgResolutionTime}</div>
          <div className="stat-card-detail">para resolução</div>
        </div>

        <div className="stat-card danger">
          <div className="stat-card-header">
            <AlertTriangle size={20} />
            <span>Chamados Críticos</span>
          </div>
          <div className="stat-card-value">{stats.critical}</div>
          <div className="stat-card-detail">pendentes/em andamento</div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <div className="chart-header">
            <PieChart size={18} />
            <h3>Distribuição por Prioridade</h3>
          </div>
          <div className="priority-chart">
            {Object.entries(stats.priorityStats).map(([priority, count]) => {
              const percentage = stats.total > 0 ? ((count / stats.total) * 100).toFixed(1) : 0;
              const colors = {
                'Crítica': { bg: '#FFF1F0', bar: '#FF4D4F', text: '#FF4D4F' },
                'Média': { bg: '#FFF7E6', bar: '#FFA940', text: '#FFA940' },
                'Baixa': { bg: '#F6FFED', bar: '#52C41A', text: '#52C41A' }
              };
              const color = colors[priority];
              return (
                <div key={priority} className="priority-bar-item">
                  <div className="priority-bar-label">
                    <span className="priority-dot" style={{ backgroundColor: color.bar }}></span>
                    <span>{priority}</span>
                    <span className="priority-count">{count}</span>
                  </div>
                  <div className="priority-bar-track" style={{ backgroundColor: color.bg }}>
                    <div 
                      className="priority-bar-fill" 
                      style={{ 
                        width: `${percentage}%`,
                        backgroundColor: color.bar 
                      }}
                    />
                  </div>
                  <span className="priority-percentage" style={{ color: color.text }}>{percentage}%</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="chart-card">
          <div className="chart-header">
            <Activity size={18} />
            <h3>Top 5 Setores</h3>
          </div>
          <div className="sectors-list">
            {topSectors.map(([sector, data], index) => (
              <div key={sector} className="sector-item">
                <div className="sector-rank">#{index + 1}</div>
                <div className="sector-info">
                  <span className="sector-name">{sector}</span>
                  <div className="sector-stats-row">
                    <span className="sector-stat">
                      <CheckCircle size={12} color="#52C41A" />
                      {data.resolved} resolvidos
                    </span>
                    <span className="sector-stat">
                      <AlertTriangle size={12} color="#FF4D4F" />
                      {data.critical} críticos
                    </span>
                  </div>
                </div>
                <div className="sector-total">{data.total}</div>
              </div>
            ))}
            {topSectors.length === 0 && (
              <div className="empty-chart">Nenhum dado disponível</div>
            )}
          </div>
        </div>
      </div>

      <div className="chart-card full-width">
        <div className="chart-header">
          <TrendingUp size={18} />
          <h3>Resumo por Status</h3>
        </div>
        <div className="status-summary-grid">
          <div className="status-summary-card">
            <div className="ss-icon pendente">
              <Clock size={24} />
            </div>
            <div className="ss-info">
              <span className="ss-label">Pendentes</span>
              <span className="ss-value">{stats.pending}</span>
            </div>
          </div>
          <div className="status-summary-card">
            <div className="ss-icon andamento">
              <Activity size={24} />
            </div>
            <div className="ss-info">
              <span className="ss-label">Em Andamento</span>
              <span className="ss-value">{stats.inProgress}</span>
            </div>
          </div>
          <div className="status-summary-card">
            <div className="ss-icon resolvido">
              <CheckCircle size={24} />
            </div>
            <div className="ss-info">
              <span className="ss-label">Resolvidos</span>
              <span className="ss-value">{stats.resolved}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="chart-card full-width">
        <div className="chart-header">
          <h3>Tabela de Chamados</h3>
          <span className="record-count">{filteredTickets.length} registros</span>
        </div>
        <div className="table-wrapper">
          <table className="report-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Título</th>
                <th>Setor</th>
                <th>Tipo</th>
                <th>Prioridade</th>
                <th>Status</th>
                <th>Data</th>
                <th>Técnico</th>
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
                    <span className={`priority-badge-sm ${ticket.priority.toLowerCase()}`}>
                      {ticket.priority}
                    </span>
                  </td>
                  <td>
                    <span className={`status-indicator ${ticket.status.toLowerCase().replace(' ', '-')}`}>
                      {ticket.status}
                    </span>
                  </td>
                  <td className="time-cell">{ticket.date} {ticket.time}</td>
                  <td>{ticket.technician || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredTickets.length === 0 && (
            <div className="empty-table">Nenhum chamado encontrado com os filtros atuais</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Relatorios;