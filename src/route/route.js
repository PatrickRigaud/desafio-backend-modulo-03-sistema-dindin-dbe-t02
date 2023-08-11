const express = require('express');
const rotas = express();
const {buscarUsuarios} = require('../controladores/controladores')



rotas.get('/usuario', buscarUsuarios)


module.exports = rotas;

