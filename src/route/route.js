const express = require('express');
const rotas = express();
const {cadastrarUsuario, loginUsuario, detalharUsuario} = require('../controladores/controladores')


rotas.post('/usuario', cadastrarUsuario)
rotas.post('/login', loginUsuario)
rotas.get('/usuario', detalharUsuario)

module.exports = rotas;

