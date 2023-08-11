const express = require('express');
const rotas = express();
const {cadastrarUsuario} = require('../controladores/controladores')


rotas.post('/usuario', cadastrarUsuario)


module.exports = rotas;

