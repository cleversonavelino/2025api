const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 8080;

app.use(express.json());
app.use(cors());

const usuarios = [];

app.get('/api/usuario', function (req, res) {
    res.json(usuarios);
});

app.post('/api/usuario', function (req, res) {
    console.log('/api/usuario');
    console.log(req.body.nome);
    const lenght = usuarios.filter(usuario => usuario.id === req.body.id).length;
    console.log(lenght);
    if (lenght === 0) {
        usuarios.push(req.body);
    } else {
        res.status(400).end();
    }
    
    res.end();
});

app.listen(PORT, function (err) {
    if (err) console.log(err);
    console.log("Server listening on PORT", PORT);
});