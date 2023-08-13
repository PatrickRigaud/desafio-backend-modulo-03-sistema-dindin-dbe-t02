const express = require('express');
const rotas = express();
const verificarUsuarioLogado = require('../controladores/intermediarios');
const listarCategorias = require('../data/categoriasData');
const { cadastrarUsuario, buscarUsuariosQuery, login } = require('../data/usuariosData');

rotas.post('/usuario', cadastrarUsuario)
rotas.post('/login', login)

rotas.use(verificarUsuarioLogado)

// rotas.get('/usuario', buscarUsuariosQuery)
rotas.get('/:id', listarCategorias)


module.exports = rotas;

