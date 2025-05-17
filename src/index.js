const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const axios = require('axios');
const mongoose = require('mongoose');
const PDFDocument = require('pdfkit');
const { users } = require('./data/users');
const authMiddleware = require('./authMiddleware');
const restrictAccessMiddleware = require('./restrictAccessMiddleware');
const Laboratorio = require('./models/Laboratorio');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const SECRET = process.env.JWT_SECRET || 'secret';
const DB_PASSWORD = process.env.DB_PASSWORD;

// Conexão com o MongoDB
mongoose.connect(`mongodb+srv://admin:${DB_PASSWORD}@clusterweb2.oibcn39.mongodb.net/?retryWrites=true&w=majority`, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('✅ Conectado ao MongoDB');
}).catch((err) => {
  console.error('❌ Erro ao conectar ao MongoDB:', err);
});

// Middlewares
app.use(express.json());
app.use(restrictAccessMiddleware);

// Rota raiz
app.get('/', (req, res) => {
  res.send('🚀 Bem-vindo à API de Gerenciamento de Salas!');
});

// Rota de login
app.post('/logar', async (req, res) => {
  const { email, senha } = req.body;

  const usuario = users.find(u => u.email === email);
  if (!usuario) return res.status(401).json({ erro: 'Usuário não encontrado' });

  const senhaValida = await bcrypt.compare(senha, usuario.senha);
  if (!senhaValida) return res.status(401).json({ erro: 'Senha incorreta' });

  const token = jwt.sign({ id: usuario.id, email: usuario.email }, SECRET, { expiresIn: '1h' });
  res.json({ token });
});

// Rota protegida: cadastrar laboratório
app.post('/laboratorio/novo', authMiddleware, async (req, res) => {
  const { nome, descricao, capacidade } = req.body;

  if (!nome || !descricao || !capacidade) {
    return res.status(400).json({ erro: 'Todos os campos são obrigatórios (exceto foto)' });
  }

  try {
    const novoLab = await Laboratorio.create({ nome, descricao, capacidade });
    res.status(201).json({ mensagem: 'Laboratório salvo no MongoDB', laboratorio: novoLab });
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao salvar no banco de dados', detalhes: err.message });
  }
});

// Rota protegida: gerar relatório PDF
app.get('/laboratorio/relatorio', authMiddleware, async (req, res) => {
  try {
    const laboratorios = await Laboratorio.find();
    const doc = new PDFDocument({ margin: 30, size: 'A4' });

    res.setHeader('Content-Disposition', 'attachment; filename="relatorio_laboratorios.pdf"');
    res.setHeader('Content-Type', 'application/pdf');

    doc.pipe(res);

    doc.fontSize(18).text('Relatório de Laboratórios', { align: 'center' });
    doc.moveDown();

    for (const lab of laboratorios) {
      doc.fontSize(14).text(`Nome: ${lab.nome}`);
      doc.fontSize(12).text(`Descrição: ${lab.descricao}`);
      doc.text(`Capacidade: ${lab.capacidade}`);

      if (lab.foto) {
        try {
          const response = await axios.get(lab.foto, { responseType: 'arraybuffer' });
          const imageBuffer = Buffer.from(response.data, 'base64');
          doc.image(imageBuffer, { fit: [250, 150] });
        } catch (error) {
          doc.text('Erro ao carregar imagem');
        }
      }

      doc.moveDown(2);
    }

    doc.end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao gerar o relatório', detalhes: err.message });
  }
});

// Inicialização do servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
