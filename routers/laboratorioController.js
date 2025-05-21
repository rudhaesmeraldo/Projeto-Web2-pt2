const express = require("express");
const modelLab = require("../models/Laboratorio");
const authMiddleware = require("../middlewares/auth");
const PDFDocument = require("pdfkit");
const axios = require("axios")
const { upload } = require("../config");
const router = express.Router();
const { uploadToCloudinary } = require("../config/cloudinary")

router.get("/api/laboratorio/relatorio", authMiddleware, async (_, res) => {
  try {
    const laboratorios = await modelLab.find();

    const doc = new PDFDocument();
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=relatorio.pdf");

    doc.pipe(res);

    doc.fontSize(18).text("Relatório de Laboratórios", { align: "center" });
    doc.moveDown();

    for (const lab of laboratorios) {
      doc.fontSize(12).text(`Id: ${lab.id}`);
      doc.fontSize(14).text(`Nome: ${lab.nome}`);
      doc.fontSize(12).text(`Descrição: ${lab.descricao}`);
      doc.text(`Capacidade: ${lab.capacidade}`);

      doc.text("Foto:");
      if (lab.foto) {
        try {
          const response = await axios.get(lab.foto, { responseType: 'arraybuffer' });
          const buffer = Buffer.from(response.data, 'binary');
          doc.image(buffer, { width: 200, height: 200, align: 'center' });
        } catch (err) {
          doc.text('[Erro ao carregar imagem]');
        }
      }
      
      //doc.image(lab.foto, { width: 200, fit: [250, 250], align: "left" });

      // Linha divisória
      doc.moveDown();
      doc.text("-------------------------------");
      doc.moveDown();
    }

    doc.end();
  } catch (err) {
    console.error("Erro ao gerar relatório:", err);
    res.status(500).json({ erro: "Erro ao gerar relatório" });
  }
});

// Rota para cadastrar um novo laboratório
// authMiddleware,
router.post(
  "/api/laboratorio/novo",
  authMiddleware,
  upload.single("foto"),
  async (req, res) => {
    const { nome, descricao, capacidade } = req.body;
    const foto = req.file;

    if (!foto) {
      return res.status(400).json({ erro: "Falta foto" });
    }

    //const formData = new FormData();

    // formData.append("image", foto.buffer); // Adiciona a foto ao FormData com o nome "image"
    console.log("tentando upar foto para o cloudinary")

    try {
      const result = await uploadToCloudinary(foto.buffer);
      console.log(`url: ${result.secure_url}`)

      if (!nome || !descricao || !capacidade) {
        return res
          .status(400)
          .json({ erro: "Nome, descrição e capacidade são obrigatórios" });
      }

      const novoLab = await modelLab.create({
        nome,
        descricao,
        capacidade,
        foto: result.secure_url || null,
      });
      res.status(201).json({
        mensagem: "Laboratório cadastrado com foto",
        laboratorio: novoLab,
      });
    } catch (err) {
      console.error(err)
      res.status(500).json({
        erro: "Erro ao salvar no banco de dados",
        detalhes: err.message,
      });
    }
  }
);

router.delete("/api/laboratorio/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const deletado = await modelLab.findByIdAndDelete(id);

    if (!deletado) {
      return res.status(404).json({ erro: "Laboratório não encontrado" });
    }

    res.json({ mensagem: "Laboratório deletado com sucesso" });
  } catch (err) {
    console.error("Erro ao excluir laboratório:", err);
    res.status(500).json({ erro: "Erro ao excluir laboratório" });
  }
});

module.exports = router;
