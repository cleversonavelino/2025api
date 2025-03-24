const express = require('express');
const app = express();
const PORT = 8080;

app.use(express.json());

const usuarios = [];

app.get('/api/usuario', function (req, res) {
    res.json(usuarios);
});

app.post('/api/usuario', function (req, res) {
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