const express = require('express');
const rotas = express();
const {cadastrarUsuario, loginUsuario, detalharUsuario, alterarUsuario} = require('../controladores/controladores')


rotas.post('/usuario', cadastrarUsuario)
rotas.post('/login', loginUsuario)
rotas.get('/usuario', detalharUsuario)
rotas.put('/usuario', alterarUsuario)


module.exports = rotas;

