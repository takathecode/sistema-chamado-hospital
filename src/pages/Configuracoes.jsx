import { useState, useEffect, useCallback } from 'react';
import { 
  Settings, 
  User, 
  Bell, 
  Shield, 
  Palette, 
  Database,
  Save,
  Moon,
  Sun,
  Globe,
  Volume2,
  Smartphone,
  Mail,
  Check,
  Monitor
} from 'lucide-react';
import '../styles/configuracoes.css';

function Configuracoes() {
  const [activeTab, setActiveTab] = useState('perfil');
  const [saved, setSaved] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  const [profile, setProfile] = useState(() => {
    const saved = localStorage.getItem('hospitalProfile');
    return saved ? JSON.parse(saved) : {
      name: 'Felippe Takahashi',
      email: 'felippe.takahashi@hospital.com',
      phone: '(11) 98765-4321',
      role: 'Administrador',
      department: 'TI'
    };
  });

  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem('hospitalNotifications');
    return saved ? JSON.parse(saved) : {
      emailAlerts: true,
      pushNotifications: true,
      soundAlerts: false,
      criticalOnly: false,
      dailySummary: true,
      weeklyReport: true
    };
  });

  const [appearance, setAppearance] = useState(() => {
    const saved = localStorage.getItem('hospitalAppearance');
    return saved ? JSON.parse(saved) : {
      theme: 'light',
      fontSize: 'medium',
      compactMode: false,
      animations: true
    };
  });

  const [security, setSecurity] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    twoFactor: false,
    sessionTimeout: '30'
  });

  // Aplicar tema
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', appearance.theme);
    localStorage.setItem('hospitalAppearance', JSON.stringify(appearance));
    
    // Aplicar tamanho da fonte
    const root = document.documentElement;
    switch(appearance.fontSize) {
      case 'small':
        root.style.fontSize = '13px';
        break;
      case 'medium':
        root.style.fontSize = '15px';
        break;
      case 'large':
        root.style.fontSize = '17px';
        break;
      default:
        root.style.fontSize = '15px';
    }
  }, [appearance]);

  // Aplicar modo compacto
  useEffect(() => {
    if (appearance.compactMode) {
      document.body.classList.add('compact-mode');
    } else {
      document.body.classList.remove('compact-mode');
    }
  }, [appearance.compactMode]);

  // Aplicar animações
  useEffect(() => {
    if (!appearance.animations) {
      document.body.classList.add('no-animations');
    } else {
      document.body.classList.remove('no-animations');
    }
  }, [appearance.animations]);

  const handleSave = (section) => {
    if (section === 'perfil') {
      localStorage.setItem('hospitalProfile', JSON.stringify(profile));
    } else if (section === 'notificacoes') {
      localStorage.setItem('hospitalNotifications', JSON.stringify(notifications));
    }
    
    setSaveMessage(`Configurações de ${getSectionName(section)} salvas com sucesso!`);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const getSectionName = (section) => {
    const names = {
      'perfil': 'Perfil',
      'notificacoes': 'Notificações',
      'aparencia': 'Aparência',
      'seguranca': 'Segurança',
      'sistema': 'Sistema'
    };
    return names[section] || section;
  };

  const handlePasswordChange = () => {
    if (security.newPassword !== security.confirmPassword) {
      alert('As senhas não conferem!');
      return;
    }
    if (security.newPassword.length < 6) {
      alert('A senha deve ter no mínimo 6 caracteres!');
      return;
    }
    setSaveMessage('Senha alterada com sucesso!');
    setSaved(true);
    setSecurity({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
      twoFactor: security.twoFactor,
      sessionTimeout: security.sessionTimeout
    });
    setTimeout(() => setSaved(false), 3000);
  };

  const tabs = [
    { id: 'perfil', label: 'Perfil', icon: User },
    { id: 'notificacoes', label: 'Notificações', icon: Bell },
    { id: 'aparencia', label: 'Aparência', icon: Palette },
    { id: 'seguranca', label: 'Segurança', icon: Shield },
    { id: 'sistema', label: 'Sistema', icon: Database }
  ];

  return (
    <div className="configuracoes-page">
      <div className="page-header">
        <div>
          <h1>Configurações</h1>
          <p>Gerencie as preferências do sistema</p>
        </div>
      </div>

      <div className="config-container">
        <div className="config-sidebar">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                className={`config-tab ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <Icon size={18} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div className="config-content">
          {saved && (
            <div className="save-success">
              <Check size={18} />
              {saveMessage}
            </div>
          )}

          {activeTab === 'perfil' && (
            <div className="config-section">
              <h2>Informações do Perfil</h2>
              <div className="profile-avatar-section">
                <div className="profile-avatar-large">
                  <span>{profile.name.split(' ').map(n => n[0]).join('')}</span>
                </div>
                <div>
                  <h3>{profile.name}</h3>
                  <p>{profile.role} - {profile.department}</p>
                </div>
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label>Nome Completo</label>
                  <input 
                    type="text" 
                    value={profile.name}
                    onChange={(e) => setProfile({...profile, name: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input 
                    type="email" 
                    value={profile.email}
                    onChange={(e) => setProfile({...profile, email: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Telefone</label>
                  <input 
                    type="tel" 
                    value={profile.phone}
                    onChange={(e) => setProfile({...profile, phone: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Departamento</label>
                  <input 
                    type="text" 
                    value={profile.department}
                    onChange={(e) => setProfile({...profile, department: e.target.value})}
                  />
                </div>
              </div>
              <button className="save-btn" onClick={() => handleSave('perfil')}>
                <Save size={16} />
                Salvar Alterações
              </button>
            </div>
          )}

          {activeTab === 'notificacoes' && (
            <div className="config-section">
              <h2>Preferências de Notificação</h2>
              <div className="settings-list">
                {[
                  { icon: Mail, label: 'Alertas por Email', desc: 'Receber notificações por email', key: 'emailAlerts' },
                  { icon: Smartphone, label: 'Notificações Push', desc: 'Receber notificações no navegador', key: 'pushNotifications' },
                  { icon: Volume2, label: 'Alertas Sonoros', desc: 'Emitir som ao receber notificações', key: 'soundAlerts' },
                  { icon: Shield, label: 'Apenas Críticos', desc: 'Notificar somente chamados críticos', key: 'criticalOnly' },
                  { icon: Bell, label: 'Resumo Diário', desc: 'Receber resumo diário dos chamados', key: 'dailySummary' },
                  { icon: Bell, label: 'Relatório Semanal', desc: 'Receber relatório semanal por email', key: 'weeklyReport' }
                ].map(item => {
                  const Icon = item.icon;
                  return (
                    <div className="setting-item" key={item.key}>
                      <div className="setting-info">
                        <Icon size={18} />
                        <div>
                          <span className="setting-label">{item.label}</span>
                          <span className="setting-desc">{item.desc}</span>
                        </div>
                      </div>
                      <label className="toggle-switch">
                        <input 
                          type="checkbox" 
                          checked={notifications[item.key]}
                          onChange={(e) => setNotifications({...notifications, [item.key]: e.target.checked})}
                        />
                        <span className="toggle-slider"></span>
                      </label>
                    </div>
                  );
                })}
              </div>
              <button className="save-btn" onClick={() => handleSave('notificacoes')}>
                <Save size={16} />
                Salvar Preferências
              </button>
            </div>
          )}

          {activeTab === 'aparencia' && (
            <div className="config-section">
              <h2>Aparência do Sistema</h2>
              
              <div className="appearance-section">
                <h3>Tema</h3>
                <p className="appearance-desc">Escolha entre tema claro ou escuro</p>
                <div className="theme-options">
                  <button 
                    className={`theme-option ${appearance.theme === 'light' ? 'selected' : ''}`}
                    onClick={() => setAppearance({...appearance, theme: 'light'})}
                  >
                    <div className="theme-preview light-preview">
                      <div className="preview-header"></div>
                      <div className="preview-sidebar"></div>
                      <div className="preview-content">
                        <div className="preview-card"></div>
                        <div className="preview-card"></div>
                      </div>
                    </div>
                    <div className="theme-label-group">
                      <Sun size={18} />
                      <span>Claro</span>
                    </div>
                  </button>
                  <button 
                    className={`theme-option ${appearance.theme === 'dark' ? 'selected' : ''}`}
                    onClick={() => setAppearance({...appearance, theme: 'dark'})}
                  >
                    <div className="theme-preview dark-preview">
                      <div className="preview-header"></div>
                      <div className="preview-sidebar"></div>
                      <div className="preview-content">
                        <div className="preview-card"></div>
                        <div className="preview-card"></div>
                      </div>
                    </div>
                    <div className="theme-label-group">
                      <Moon size={18} />
                      <span>Escuro</span>
                    </div>
                  </button>
                </div>
              </div>

              <div className="appearance-section">
                <h3>Tamanho da Fonte</h3>
                <p className="appearance-desc">Ajuste o tamanho do texto da interface</p>
                <div className="font-size-options">
                  {[
                    { value: 'small', label: 'Pequeno', preview: 'Aa' },
                    { value: 'medium', label: 'Médio', preview: 'Aa' },
                    { value: 'large', label: 'Grande', preview: 'Aa' }
                  ].map(option => (
                    <button
                      key={option.value}
                      className={`font-size-option ${appearance.fontSize === option.value ? 'selected' : ''}`}
                      onClick={() => setAppearance({...appearance, fontSize: option.value})}
                    >
                      <span className="font-preview" style={{ 
                        fontSize: option.value === 'small' ? '14px' : option.value === 'medium' ? '18px' : '24px' 
                      }}>
                        {option.preview}
                      </span>
                      <span className="font-label">{option.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="appearance-section">
                <h3>Opções de Layout</h3>
                <div className="settings-list">
                  <div className="setting-item">
                    <div className="setting-info">
                      <Monitor size={18} />
                      <div>
                        <span className="setting-label">Modo Compacto</span>
                        <span className="setting-desc">Reduzir espaçamentos entre elementos</span>
                      </div>
                    </div>
                    <label className="toggle-switch">
                      <input 
                        type="checkbox" 
                        checked={appearance.compactMode}
                        onChange={(e) => setAppearance({...appearance, compactMode: e.target.checked})}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                  <div className="setting-item">
                    <div className="setting-info">
                      <div>
                        <span className="setting-label">Animações</span>
                        <span className="setting-desc">Habilitar animações e transições</span>
                      </div>
                    </div>
                    <label className="toggle-switch">
                      <input 
                        type="checkbox" 
                        checked={appearance.animations}
                        onChange={(e) => setAppearance({...appearance, animations: e.target.checked})}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="appearance-preview-box">
                <h4>Pré-visualização</h4>
                <div className={`preview-demo ${appearance.theme}`} style={{
                  fontSize: appearance.fontSize === 'small' ? '0.85rem' : appearance.fontSize === 'large' ? '1.15rem' : '1rem'
                }}>
                  <div className="preview-text">
                    <h5>Título de exemplo</h5>
                    <p>Este é um texto de exemplo para visualizar as alterações de tema e tamanho de fonte em tempo real.</p>
                    <span className="preview-badge">Prioridade: Média</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'seguranca' && (
            <div className="config-section">
              <h2>Segurança da Conta</h2>
              <div className="form-grid">
                <div className="form-group">
                  <label>Senha Atual</label>
                  <input 
                    type="password" 
                    placeholder="••••••••"
                    value={security.currentPassword}
                    onChange={(e) => setSecurity({...security, currentPassword: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Nova Senha</label>
                  <input 
                    type="password" 
                    placeholder="Mínimo 6 caracteres"
                    value={security.newPassword}
                    onChange={(e) => setSecurity({...security, newPassword: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Confirmar Nova Senha</label>
                  <input 
                    type="password" 
                    placeholder="••••••••"
                    value={security.confirmPassword}
                    onChange={(e) => setSecurity({...security, confirmPassword: e.target.value})}
                  />
                </div>
              </div>

              <div className="setting-item">
                <div className="setting-info">
                  <Shield size={18} />
                  <div>
                    <span className="setting-label">Autenticação em Dois Fatores (2FA)</span>
                    <span className="setting-desc">Adicionar camada extra de segurança</span>
                  </div>
                </div>
                <label className="toggle-switch">
                  <input 
                    type="checkbox" 
                    checked={security.twoFactor}
                    onChange={(e) => setSecurity({...security, twoFactor: e.target.checked})}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>

              <div className="form-group">
                <label>Tempo de Inatividade para Logout</label>
                <select 
                  value={security.sessionTimeout}
                  onChange={(e) => setSecurity({...security, sessionTimeout: e.target.value})}
                >
                  <option value="15">15 minutos</option>
                  <option value="30">30 minutos</option>
                  <option value="60">1 hora</option>
                  <option value="120">2 horas</option>
                  <option value="480">8 horas</option>
                </select>
              </div>

              <button className="save-btn" onClick={handlePasswordChange}>
                <Save size={16} />
                Alterar Senha
              </button>
            </div>
          )}

          {activeTab === 'sistema' && (
            <div className="config-section">
              <h2>Informações do Sistema</h2>
              <div className="system-info-grid">
                <div className="system-info-card">
                  <Database size={24} color="#1677FF" />
                  <div>
                    <span className="si-label">Versão do Sistema</span>
                    <span className="si-value">v2.4.1</span>
                  </div>
                </div>
                <div className="system-info-card">
                  <Globe size={24} color="#52C41A" />
                  <div>
                    <span className="si-label">Ambiente</span>
                    <span className="si-value">Produção</span>
                  </div>
                </div>
                <div className="system-info-card">
                  <Shield size={24} color="#FFA940" />
                  <div>
                    <span className="si-label">Última Atualização</span>
                    <span className="si-value">26/05/2026</span>
                  </div>
                </div>
                <div className="system-info-card">
                  <Settings size={24} color="#6C757D" />
                  <div>
                    <span className="si-label">Build</span>
                    <span className="si-value">#2847-prod</span>
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label>Limite de Chamados por Técnico</label>
                <input type="number" defaultValue={10} min={1} max={50} />
              </div>
              <div className="form-group">
                <label>Prazo Máximo para Resolução (horas)</label>
                <input type="number" defaultValue={48} min={1} max={168} />
              </div>
              <div className="form-group">
                <label>Backup Automático</label>
                <select defaultValue="daily">
                  <option value="none">Desabilitado</option>
                  <option value="daily">Diário</option>
                  <option value="weekly">Semanal</option>
                </select>
              </div>

              <button className="save-btn" onClick={() => handleSave('sistema')}>
                <Save size={16} />
                Salvar Configurações
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Configuracoes;