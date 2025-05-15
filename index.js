const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const fs = require('fs');
const app = express();
const PORT = 8080;

//require('dotenv').config();

app.use(express.json());
app.use(cors());

//storage do multer
//configuração necessária para saber onde o arquivo temporário
//ficará salvo no servidor
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'imagens')
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now())
  }
});

//criação do objeto multer que faz 
//com que seja possível ler o arquivo que vem do frontend
const upload = multer({ storage });

//importante o modulo de mysql
var mysql = require('mysql2');

//criando a variável conn que vai ter a referência de conexão
//com o banco de dados
var conn = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "phpmyadmin",
    port: "3306"
});

//tentando connectar
//a variável con tem a conexão agora
conn.connect(function (err) {
    if (err) throw err;
    console.log("Connected!");
});

const generateToken = (id, email) => {
    return jwt.sign({ id: id, email: email, permissoes: ['USUARIO','PRODUTO'] }, 'meusegredoabc', {
        expiresIn: '1h'
    });
};

const verifyToken = (token) => {
    return jwt.verify(token, 'meusegredoabc');
};

app.post('/api/login', function (req, res) {
    let usuario = req.body;
    let sql = `SELECT u.id, u.senha FROM usuario u where u.email = '${usuario.email}'`;

    conn.query(sql, function (err, result) {
        if (err) throw err; 
        usuario.id = result[0]?.id;
        usuario.senha = result[0]?.senha;       
    });

    //TODO validar se encontrou o usuário
    //if (!usuario.id) {
    // res.status(401).send("login inválido")
    //}

    //TODO validar senha

    //gerando o token
    token = generateToken(usuario.id, usuario.email);
    res.json({token: token});
});

function authenticate(req, res, next) {
    //captura o token que vem no header
    const token = req.headers.authorization?.split(' ')[1];
    
    //valida se o token existe
    if (!token) {
      return res.status(401).json({ error: 'Token não fornecido' });
    }
    
    try {
      //verica se o token foi gerado por este servidor
      //validando a palavra chave
      const decoded = verifyToken(token);
      req.userId = decoded.id;
      next();
    } catch (err) {
      res.status(401).json({ error: 'Token inválido' });
    }
  }

app.get('/api/usuario', authenticate, function (req, res) {
    //cria a string the consulta no baco do tipo select
    let sql = "SELECT u.id, u.nome FROM usuario u";
    //executando o comando sql com a função query
    //nela passamos a string de consulta
    //após a execução ele retorna o function que vai ter a variável err e result
    //se deu algum erro a variável err terá o erro obtivo
    //caso contrário o result terá dos dados do banco 
    conn.query(sql, function (err, result) {
        if (err) res.status(500).json(err);
        res.status(200).json(result);
    });
});

//endpoint para salvar um usuário
app.post('/api/usuario', function (req, res) {
    //captura o json com os dados do usuário
    var usuario = req.body;
    //variável sql par armazenar o comando que vai rodar no banco
    var sql = '';
    //valido se o usuário existe pelo id -> caso exista é um update    
    if (usuario.id) {
        sql = `UPDATE usuario SET nome = '${usuario.nome}'
        WHERE id = ${usuario.id}`;
    } else {
        sql = `INSERT INTO usuario (nome) VALUES 
    ('${usuario.nome}')`;
    }
    //executa o comando de insert ou update
    conn.query(sql, function (err, result) {
        if (err) throw err;
    });
    res.status(201).json(usuario);
});

//endpoint para capturar um usuário por id
app.get('/api/usuario/:id', (req, res) => {
    const { id } = req.params;

    console.log(id)

    let sql = `SELECT u.id, u.nome FROM usuario u WHERE u.id = ${id}`;
    conn.query(sql, function (err, result) {
        if (err) throw err;
        console.log(result)
        res.status(200).json(result[0]);
    });
});

//método para upload de arquivo
//chama o upload.single para capturar o arquivo que veio do front
app.post('/api/upload', upload.single('file'), function (req, res) {
    console.log(req.file);
    res.send('foi')
});

app.get('/api/image', function(req,res) {
    console.log('chegou o request');

    //caminho da imagem salva
    var caminhoArquivo = "C:\\Users\\CleversonAvelinoFerr\\aulapuc\\2025api\\imagens\\file-1747265484319";

    // Configura os headers apropriados
    res.setHeader('Content-Disposition', `attachment; filename=Captura de tela 2024-08-23 080725.png`);
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Content-Length', 13269);

    // Cria um stream do arquivo e envia para o cliente
    const fileStream = fs.createReadStream(caminhoArquivo);
    fileStream.pipe(res);

    // Trata erros no stream
    fileStream.on('error', (err) => {
      console.error('Erro no stream:', err);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Erro ao enviar o arquivo' });
      }
    });

});

app.listen(PORT, function (err) {
    if (err) console.log(err);
    console.log("Server listening on PORT", PORT);
});