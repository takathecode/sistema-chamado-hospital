import { useState } from 'react';
import { Send, CheckCircle } from 'lucide-react';
import '../styles/form.css';

function NovoChamado({ onAddTicket }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    sector: '',
    type: '',
    priority: 'Média'
  });
  const [success, setSuccess] = useState(false);

  const problemTypes = [
    'Ar-condicionado',
    'Computador',
    'Impressora',
    'Equipamento Médico',
    'Elétrica',
    'Manutenção Geral',
    'Hidráulica',
    'Rede/Internet'
  ];

  const sectors = [
    'Centro Cirúrgico',
    'UTI',
    'Emergência',
    'Recepção',
    'Enfermaria',
    'Radiologia',
    'Laboratório',
    'Corredor B',
    'Administrativo'
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    onAddTicket(formData);
    setSuccess(true);
    setFormData({
      title: '',
      description: '',
      sector: '',
      type: '',
      priority: 'Média'
    });
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <div className="novo-chamado-page">
      <div className="page-header">
        <h1>Abrir Novo Chamado</h1>
        <p>Preencha os dados para registrar um novo chamado técnico</p>
      </div>

      {success && (
        <div className="success-message">
          <CheckCircle size={20} />
          <span>Chamado criado com sucesso!</span>
        </div>
      )}

      <form className="chamado-form" onSubmit={handleSubmit}>
        <div className="form-section">
          <h3>Informações do Problema</h3>
          
          <div className="form-group">
            <label htmlFor="title">Título do Chamado *</label>
            <input
              id="title"
              type="text"
              placeholder="Ex: Ar-condicionado parado no Centro Cirúrgico"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Descrição Detalhada *</label>
            <textarea
              id="description"
              placeholder="Descreva o problema com detalhes..."
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            />
          </div>
        </div>

        <div className="form-section">
          <h3>Classificação</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="sector">Setor *</label>
              <select
                id="sector"
                value={formData.sector}
                onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
                required
              >
                <option value="">Selecionar setor</option>
                {sectors.map(sector => (
                  <option key={sector} value={sector}>{sector}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="type">Tipo de Problema *</label>
              <select
                id="type"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                required
              >
                <option value="">Selecionar tipo</option>
                {problemTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Prioridade *</label>
            <div className="priority-selector">
              {['Baixa', 'Média', 'Crítica'].map(priority => (
                <label 
                  key={priority}
                  className={`priority-option ${formData.priority === priority ? 'selected' : ''} ${priority.toLowerCase()}`}
                >
                  <input
                    type="radio"
                    name="priority"
                    value={priority}
                    checked={formData.priority === priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  />
                  <span className="priority-radio-label">{priority}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="submit-btn">
            <Send size={18} />
            Abrir Chamado
          </button>
        </div>
      </form>
    </div>
  );
}

export default NovoChamado;