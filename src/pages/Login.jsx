import { useState } from 'react';
import { 
  Stethoscope, 
  Eye, 
  EyeOff, 
  LogIn,
  Hospital,
  Shield
} from 'lucide-react';
import '../styles/login.css';

function Login({ onLogin, error: externalError }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [internalError, setInternalError] = useState('');
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const error = externalError || internalError;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setInternalError('');
    setLoading(true);

    try {
      // Chama a função handleLogin passada via props do App.jsx
      await onLogin(email, password);
    } catch (err) {
      setInternalError(err.message || 'Usuário ou senha inválidos. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-left">
          <div className="login-brand">
            <div className="brand-icon">
              <Stethoscope size={48} color="#1677FF" />
            </div>
            <h1>Hospital<span className="brand-highlight">Care</span></h1>
            <p>Sistema de Chamados Técnicos</p>
          </div>
          
          <div className="login-features">
            <div className="feature-item">
              <div className="feature-icon">
                <Hospital size={20} />
              </div>
              <div>
                <span className="feature-title">Gestão Hospitalar</span>
                <span className="feature-desc">Controle completo dos chamados técnicos</span>
              </div>
            </div>
            <div className="feature-item">
              <div className="feature-icon">
                <Shield size={20} />
              </div>
              <div>
                <span className="feature-title">Segurança</span>
                <span className="feature-desc">Acesso restrito e dados protegidos</span>
              </div>
            </div>
          </div>

          <div className="login-illustration">
            <div className="pulse-circle">
              <div className="pulse-inner"></div>
            </div>
          </div>
        </div>

        <div className="login-right">
          <div className="login-form-container">
            <div className="login-form-header">
              <h2>Acessar Sistema</h2>
              <p>Entre com suas credenciais para continuar</p>
            </div>

            {error && (
              <div className="login-error">
                <Shield size={16} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="login-form">
              <div className="form-group">
                <label htmlFor="email">E-mail</label>
                <div className="input-wrapper">
                  <input
                    id="email"
                    type="email"
                    placeholder="Digite seu e-mail"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="password">Senha</label>
                <div className="input-wrapper password-wrapper">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Digite sua senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="toggle-password"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="form-options">
                <label className="remember-me">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <span>Lembrar-me</span>
                </label>
                <a href="#" className="forgot-password">Esqueceu a senha?</a>
              </div>

              <button 
                type="submit" 
                className="login-btn"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="spinner"></div>
                    Entrando...
                  </>
                ) : (
                  <>
                    <LogIn size={18} />
                    Entrar
                  </>
                )}
              </button>
            </form>

            <div className="login-help">
              <p>Credenciais do Banco de Dados:</p>
              <div className="demo-credentials">
                <div className="credential-card">
                  <span className="cred-role">Administrador</span>
                  <code>admin@hospital.com / 123456</code>
                </div>
                <div className="credential-card">
                  <span className="cred-role">Técnico</span>
                  <code>carlos@hospital.com / 123456</code>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
