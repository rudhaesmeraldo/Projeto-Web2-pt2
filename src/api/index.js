const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const multer = require('multer'); 
const path = require('path');
const axios = require('axios')
const { users } = require('./users');
const authMiddleware = require('./middlewares/authMiddleware');
const restrictAccessMiddleware = require('./middlewares/restrictAccessMiddleware');
const Laboratorio = require('../models/Laboratorio');
const PDFDocument = require('pdfkit');
const mongoose = require('mongoose');
const fs = require('fs');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // pasta onde os arquivos serão salvos
  },
  filename: (req, file, cb) => {
    const nomeArquivo = Date.now() + path.extname(file.originalname);
    cb(null, nomeArquivo);
  }
});

const upload = multer({ storage });

require('dotenv').config();
const PORT = process.env.PORT || 3000;
const SECRET = process.env.JWT_SECRET || 'secret';
const DB_PASSWORD = process.env.DB_PASSWORD || 'admin';

mongoose.connect(`mongodb+srv://admin:${DB_PASSWORD}@clusterweb2.oibcn39.mongodb.net/`, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('✅ Conectado ao MongoDB');
}).catch((err) => {
  console.error('❌ Erro ao conectar ao MongoDB:', err);
});


const app = express();

app.use(express.json());
app.use(restrictAccessMiddleware); 
app.use('/uploads', express.static('uploads'));

// Home
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

// Rota para cadastrar um novo laboratório
// authMiddleware,
app.post('/laboratorio/novo', authMiddleware, upload.single('foto'), async (req, res) => {
  const { nome, descricao, capacidade } = req.body;
  const foto = req.file ? req.file.path : null;

  if (!nome || !descricao || !capacidade) {
    return res.status(400).json({ erro: 'Nome, descrição e capacidade são obrigatórios' });
  }

  try {
    const novoLab = await Laboratorio.create({ nome, descricao, capacidade, foto });
    res.status(201).json({ mensagem: 'Laboratório cadastrado com foto', laboratorio: novoLab });
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao salvar no banco de dados', detalhes: err.message });
  }
});

// DELETE /laboratorio/:id
app.delete('/laboratorio/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const deletado = await Laboratorio.findByIdAndDelete(id);

    if (!deletado) {
      return res.status(404).json({ erro: 'Laboratório não encontrado' });
    }

    res.json({ mensagem: 'Laboratório deletado com sucesso' });
  } catch (err) {
    console.error('Erro ao excluir laboratório:', err);
    res.status(500).json({ erro: 'Erro ao excluir laboratório' });
  }
});


app.get('/laboratorio/relatorio', authMiddleware, async (req, res) => {
  try {
    const laboratorios = await Laboratorio.find();

    const doc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=relatorio.pdf');

    doc.pipe(res);

    doc.fontSize(18).text('Relatório de Laboratórios', { align: 'center' });
    doc.moveDown();

    for (const lab of laboratorios) {
      doc.fontSize(12).text(`Id: ${lab.id}`)
      doc.fontSize(14).text(`Nome: ${lab.nome}`);
      doc.fontSize(12).text(`Descrição: ${lab.descricao}`);
      doc.text(`Capacidade: ${lab.capacidade}`);
      doc.text('Foto:');

      // Caminho absoluto da imagem
      if (lab.foto) {
        const caminhoImagem = path.resolve(__dirname, lab.foto);
        if (fs.existsSync(caminhoImagem)) {
          doc.image(caminhoImagem, {
            width: 200,
            fit: [250, 250],
            align: 'left'
          });
        } else {
          doc.text('[Imagem não encontrada]');
        }
      }

      // Linha divisória
      doc.moveDown();
      doc.text('-------------------------------');
      doc.moveDown();
    }

    doc.end();
  } catch (err) {
    console.error('Erro ao gerar relatório:', err);
    res.status(500).json({ erro: 'Erro ao gerar relatório' });
  }
});

// Apenas para tests locais

app.listen(3000, () => console.log('Servidor rodando na porta 3000'));
