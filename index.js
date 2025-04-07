const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 8080;

app.use(express.json());
app.use(cors());

//importante o modulo de mysql
var mysql = require('mysql');

//criando a variável conn que vai ter a referência de conexão
//com o banco de dados
var conn = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "123456",
    database: "aula",
    port:"3306"
});

//tentando connectar
//a variável con tem a conexão agora
conn.connect(function (err) {
    if (err) throw err;
    console.log("Connected!");
});

app.get('/api/usuario', function (req, res) {
    //cria a string the consulta no baco do tipo select
    let sql = "SELECT u.id, u.email, u.status FROM usuario u";
    //executando o comando sql com a função query
    //nela passamos a string de consulta
    //após a execução ele retorna o function que vai ter a variável err e result
    //se deu algum erro a variável err terá o erro obtivo
    //caso contrário o result terá dos dados do banco 
    conn.query(sql, function (err, result) {
        if (err) throw err;
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
        sql = `UPDATE usuario SET email = '${usuario.email}', 
        senha = '${usuario.senha}', status = '${usuario.status ? 1 : 0}' 
        WHERE id = ${usuario.id}`; 
    } else {
        sql = `INSERT INTO usuario (email, senha, status) VALUES 
    ('${usuario.email}', '${usuario.senha}','${usuario.status ? 1 : 0}')`;
    }
    //executa o comando de insert ou update
    conn.query(sql, function (err, result) {
        if (err) throw err;
    });
    res.status(201).json(usuario);
});

//endpoint para capturar um usuário por id
app.get('/api/usuario/:id', (req, res) => {
    const id = req.param("id");

    let sql = `SELECT u.id, u.email, u.status FROM usuario u WHERE u.id = ${id}`;
    conn.query(sql, function (err, result) {
        if (err) throw err;
        console.log(result)
        res.status(200).json(result[0]);
    });
});

app.listen(PORT, function (err) {
    if (err) console.log(err);
    console.log("Server listening on PORT", PORT);
});