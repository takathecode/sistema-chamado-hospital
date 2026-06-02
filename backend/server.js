const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Conexão MySQL
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'hospital_chamados',
  waitForConnections: true,
  connectionLimit: 5
});

// Middleware de autenticação
function autenticar(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ erro: 'Token não fornecido' });
  
  const token = authHeader.split(' ')[1];
  try {
    req.usuario = jwt.verify(token, process.env.JWT_SECRET || 'minha_chave_secreta_2026');
    next();
  } catch (erro) {
    return res.status(401).json({ erro: 'Token inválido' });
  }
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// LOGIN
app.post('/api/login', async (req, res) => {
  try {
    const { email, senha } = req.body;

    const [usuarios] = await pool.execute(
      'SELECT * FROM usuarios WHERE email = ?',
      [email]
    );

    if (usuarios.length === 0) {
      return res.status(401).json({ erro: 'Email ou senha inválidos' });
    }

    const usuario = usuarios[0];
    const senhaCorreta = await bcrypt.compare(senha, usuario.senha);

    if (!senhaCorreta) {
      return res.status(401).json({ erro: 'Email ou senha inválidos' });
    }

    const token = jwt.sign(
      { id: usuario.id, nome: usuario.nome, cargo: usuario.cargo },
      process.env.JWT_SECRET || 'minha_chave_secreta_2026',
      { expiresIn: '8h' }
    );

    res.json({
      sucesso: true,
      token,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        cargo: usuario.cargo
      }
    });

  } catch (erro) {
    console.error('Erro no login:', erro);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
});

// LISTAR CHAMADOS
app.get('/api/chamados', autenticar, async (req, res) => {
  try {
    const { status, prioridade, busca } = req.query;

    let sql = `
      SELECT c.*, s.nome AS setor_nome, t.nome AS tecnico_nome
      FROM chamados c
      JOIN setores s ON c.setor_id = s.id
      LEFT JOIN tecnicos t ON c.tecnico_id = t.id
      WHERE 1=1
    `;
    const params = [];

    if (status) { sql += ' AND c.status = ?'; params.push(status); }
    if (prioridade) { sql += ' AND c.prioridade = ?'; params.push(prioridade); }
    if (busca) {
      sql += ' AND (c.codigo LIKE ? OR c.titulo LIKE ? OR s.nome LIKE ?)';
      const termo = `%${busca}%`;
      params.push(termo, termo, termo);
    }

    sql += ' ORDER BY c.data_abertura DESC, c.hora_abertura DESC';

    const [chamados] = await pool.execute(sql, params);
    res.json({ sucesso: true, dados: chamados, total: chamados.length });

  } catch (erro) {
    console.error('Erro ao listar chamados:', erro);
    res.status(500).json({ erro: 'Erro ao buscar chamados' });
  }
});

// BUSCAR UM CHAMADO
app.get('/api/chamados/:id', autenticar, async (req, res) => {
  try {
    const [chamados] = await pool.execute(`
      SELECT c.*, s.nome AS setor_nome, t.nome AS tecnico_nome
      FROM chamados c
      JOIN setores s ON c.setor_id = s.id
      LEFT JOIN tecnicos t ON c.tecnico_id = t.id
      WHERE c.id = ?
    `, [req.params.id]);

    if (chamados.length === 0) {
      return res.status(404).json({ erro: 'Chamado não encontrado' });
    }

    res.json({ sucesso: true, dados: chamados[0] });
  } catch (erro) {
    res.status(500).json({ erro: 'Erro ao buscar chamado' });
  }
});

// CRIAR CHAMADO
app.post('/api/chamados', autenticar, async (req, res) => {
  try {
    const { titulo, descricao, setor_id, tipo, prioridade } = req.body;

    if (!titulo || !setor_id || !tipo) {
      return res.status(400).json({ erro: 'Título, setor e tipo são obrigatórios' });
    }

    const [ultimo] = await pool.execute('SELECT codigo FROM chamados ORDER BY id DESC LIMIT 1');
    let numero = 1;
    if (ultimo.length > 0) {
      numero = parseInt(ultimo[0].codigo.replace('#CH-', '')) + 1;
    }
    const codigo = `#CH-${String(numero).padStart(4, '0')}`;

    const agora = new Date();
    const data = agora.toISOString().slice(0, 10);
    const hora = agora.toTimeString().slice(0, 8);

    const [resultado] = await pool.execute(
      `INSERT INTO chamados (codigo, titulo, descricao, setor_id, tipo, prioridade, data_abertura, hora_abertura)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [codigo, titulo, descricao || '', setor_id, tipo, prioridade || 'Média', data, hora]
    );

    res.status(201).json({
      sucesso: true,
      mensagem: 'Chamado criado com sucesso!',
      id: resultado.insertId,
      codigo
    });

  } catch (erro) {
    console.error('Erro ao criar chamado:', erro);
    res.status(500).json({ erro: 'Erro ao criar chamado' });
  }
});

// ATUALIZAR CHAMADO
app.put('/api/chamados/:id', autenticar, async (req, res) => {
  try {
    const { titulo, descricao, setor_id, tipo, prioridade, status, tecnico_id } = req.body;
    const chamadoId = req.params.id;

    const [existe] = await pool.execute('SELECT id FROM chamados WHERE id = ?', [chamadoId]);
    if (existe.length === 0) {
      return res.status(404).json({ erro: 'Chamado não encontrado' });
    }

    await pool.execute(
      `UPDATE chamados SET 
        titulo = COALESCE(?, titulo),
        descricao = COALESCE(?, descricao),
        setor_id = COALESCE(?, setor_id),
        tipo = COALESCE(?, tipo),
        prioridade = COALESCE(?, prioridade),
        status = COALESCE(?, status),
        tecnico_id = ?
       WHERE id = ?`,
      [titulo, descricao, setor_id, tipo, prioridade, status, tecnico_id || null, chamadoId]
    );

    if (status === 'Resolvido') {
      const agora = new Date();
      await pool.execute(
        'UPDATE chamados SET data_resolucao = ?, hora_resolucao = ? WHERE id = ?',
        [agora.toISOString().slice(0, 10), agora.toTimeString().slice(0, 8), chamadoId]
      );
    }

    res.json({ sucesso: true, mensagem: 'Chamado atualizado!' });

  } catch (erro) {
    console.error('Erro ao atualizar:', erro);
    res.status(500).json({ erro: 'Erro ao atualizar chamado' });
  }
});

// EXCLUIR CHAMADO
app.delete('/api/chamados/:id', autenticar, async (req, res) => {
  try {
    const [resultado] = await pool.execute('DELETE FROM chamados WHERE id = ?', [req.params.id]);
    if (resultado.affectedRows === 0) {
      return res.status(404).json({ erro: 'Chamado não encontrado' });
    }
    res.json({ sucesso: true, mensagem: 'Chamado excluído!' });
  } catch (erro) {
    res.status(500).json({ erro: 'Erro ao excluir chamado' });
  }
});

// DASHBOARD
app.get('/api/dashboard', autenticar, async (req, res) => {
  try {
    const [porStatus] = await pool.execute('SELECT status, COUNT(*) as total FROM chamados GROUP BY status');
    const [porPrioridade] = await pool.execute(
      "SELECT prioridade, COUNT(*) as total FROM chamados WHERE status IN ('Pendente', 'Em andamento') GROUP BY prioridade"
    );
    const [hoje] = await pool.execute('SELECT COUNT(*) as total FROM chamados WHERE data_abertura = CURDATE()');

    res.json({
      sucesso: true,
      dados: {
        total: porStatus.reduce((s, i) => s + i.total, 0),
        pendentes: porStatus.find(s => s.status === 'Pendente')?.total || 0,
        em_andamento: porStatus.find(s => s.status === 'Em andamento')?.total || 0,
        resolvidos: porStatus.find(s => s.status === 'Resolvido')?.total || 0,
        criticos: porPrioridade.find(p => p.prioridade === 'Crítica')?.total || 0,
        hoje: hoje[0].total
      }
    });
  } catch (erro) {
    res.status(500).json({ erro: 'Erro ao buscar dashboard' });
  }
});

// TÉCNICOS
app.get('/api/tecnicos', autenticar, async (req, res) => {
  try {
    const [tecnicos] = await pool.execute(`
      SELECT t.*, COUNT(c.id) as chamados_ativos
      FROM tecnicos t
      LEFT JOIN chamados c ON t.id = c.tecnico_id AND c.status IN ('Pendente', 'Em andamento')
      GROUP BY t.id
      ORDER BY t.nome
    `);
    res.json({ sucesso: true, dados: tecnicos });
  } catch (erro) {
    res.status(500).json({ erro: 'Erro ao buscar técnicos' });
  }
});

app.post('/api/tecnicos', autenticar, async (req, res) => {
  try {
    const { nome, especialidade, telefone, email } = req.body;
    if (!nome || !especialidade) {
      return res.status(400).json({ erro: 'Nome e especialidade são obrigatórios' });
    }
    const [resultado] = await pool.execute(
      'INSERT INTO tecnicos (nome, especialidade, telefone, email) VALUES (?, ?, ?, ?)',
      [nome, especialidade, telefone || '', email || '']
    );
    res.status(201).json({ sucesso: true, id: resultado.insertId });
  } catch (erro) {
    res.status(500).json({ erro: 'Erro ao cadastrar técnico' });
  }
});

// SETORES
app.get('/api/setores', autenticar, async (req, res) => {
  try {
    const [setores] = await pool.execute('SELECT * FROM setores ORDER BY nome');
    res.json({ sucesso: true, dados: setores });
  } catch (erro) {
    res.status(500).json({ erro: 'Erro ao buscar setores' });
  }
});

// Iniciar servidor
const PORTA = process.env.PORT || 3001;
app.listen(PORTA, () => {
  console.log('=========================================');
  console.log(`🚀 Servidor rodando na porta ${PORTA}`);
  console.log(`📡 http://localhost:${PORTA}`);
  console.log('=========================================');
  console.log('Rotas:');
  console.log('  POST   /api/login');
  console.log('  GET    /api/chamados');
  console.log('  POST   /api/chamados');
  console.log('  PUT    /api/chamados/:id');
  console.log('  DELETE /api/chamados/:id');
  console.log('  GET    /api/dashboard');
  console.log('  GET    /api/tecnicos');
  console.log('  GET    /api/setores');
  console.log('=========================================');
});