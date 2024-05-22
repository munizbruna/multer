const express = require('express');
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const app = express();
const port = 3000;

// Função para gerar um nome de arquivo único
const generateUniqueFilename = (originalName) => {
    const ext = path.extname(originalName);
    const name = path.basename(originalName, ext);
    const uniqueSuffix = crypto.randomBytes(8).toString('hex');
    return `${name}-${uniqueSuffix}${ext}`;
};

//faz o express ler arquivos estaticos, sem isso não abre o css
app.use(express.static(path.join(__dirname)));

// Configuração do multer para armazenar os uploads no diretório especificado
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, 'uploads')); // Caminho relativo usando __dirname
    },
    filename: function (req, file, cb) {
        cb(null, generateUniqueFilename(file.originalname));
    }
});

// Filtro para aceitar apenas arquivos de imagem
const imageFileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb(new Error('Apenas arquivos de imagem são permitidos.'));
    }
};

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // Limite de tamanho do arquivo (10 MB)
    fileFilter: imageFileFilter
});

// Rota para o upload de arquivo
app.post('/upload', upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('Nenhum arquivo enviado ou o nome do campo do formulário está incorreto.');
    }

    const filePath = path.join('/uploads', req.file.filename); // Caminho relativo para o cliente
    res.json({ message: 'Arquivo enviado com sucesso!', filePath: filePath });



});

// Middleware para lidar com erros
app.use(function (err, req, res, next) {
    if (err instanceof multer.MulterError) {
        return res.status(400).send(`Erro no upload do arquivo: ${err.message}`);
    } else if (err) {
        return res.status(400).send(`Erro: ${err.message}`);
    }
    next();
});

// Rota para servir a página HTML de upload
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
