const express = require('express');
const rotas = express();
const {cadastrarUsuario, loginUsuario, detalharUsuario, alterarUsuario} = require('../controladores/controladores')
const {listarCategorias} = require('../data/categoriasData');


rotas.post('/usuario', cadastrarUsuario)
rotas.post('/login', loginUsuario)
rotas.get('/usuario', detalharUsuario)
rotas.put('/usuario', alterarUsuario)


rotas.get('categoria/:id', listarCategorias)



module.exports = rotas;

