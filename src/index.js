const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const multer = require('multer'); // Para lidar com uploads de arquivos
const { users } = require('./users');
const authMiddleware = require('./authMiddleware');
const restrictAccessMiddleware = require('./restrictAccessMiddleware');
const { cadastrarLaboratorio } = require('./laboratorioController');

const app = express();
app.use(express.json());
app.use(restrictAccessMiddleware); 

const SECRET = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJhZG1pbkB0ZXN0ZS5jb20iLCJpYXQiOjE3NDY5MDc2MDMsImV4cCI6MTc0NjkxMTIwM30.6vwu_HgL0hNkg9UP_1GuFMCzHs0kosG8QbeKaCsclbU"

// Configuração do Multer para upload de imagem
const upload = multer({ dest: 'uploads/' });

// Rota para login
app.post('/logar', async (req, res) => {
  const { email, senha } = req.body;

  const usuario = users.find(u => u.email === email);
  if (!usuario) return res.status(401).json({ erro: 'Usuário não encontrado' });

  const senhaValida = await bcrypt.compare(senha, usuario.senha);
  if (!senhaValida) return res.status(401).json({ erro: 'Senha incorreta' });

  const token = jwt.sign({ id: usuario.id, email: usuario.email }, SECRET, {
    expiresIn: '1h',
  });

  res.json({ token });
});

// Rota para cadastrar um novo laboratório
app.post('/laboratorio/novo', 
  authMiddleware, 
  upload.single('foto'), // Processa o arquivo enviado com o campo 'foto'
  cadastrarLaboratorio
);

app.listen(3000, () => console.log('Servidor rodando na porta 3000'));
