const express = require('express');
const rotas = express();
const {cadastrarUsuario, loginUsuario} = require('../controladores/controladores')


rotas.post('/usuario', cadastrarUsuario)
rotas.post('/login', loginUsuario)


module.exports = rotas;

