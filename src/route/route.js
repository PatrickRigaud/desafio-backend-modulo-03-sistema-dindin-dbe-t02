const express = require('express');
const rotas = express();
const {cadastrarUsuario, loginUsuario, detalharUsuario, alterarUsuario, listarTransacoes, buscarTransacao, cadastrarTransacao, editarTransacao, excluirTransacao, extratoTransacoes} = require('../controladores/controladores')
const {listarCategorias} = require('../data/categoriasData');


rotas.post('/usuario', cadastrarUsuario)
rotas.post('/login', loginUsuario)
rotas.get('/usuario', detalharUsuario)
rotas.put('/usuario', alterarUsuario)


rotas.get('categoria/:id', listarCategorias)

rotas.get('/transacao/extrato', extratoTransacoes)
rotas.get('/transacoes', listarTransacoes)
rotas.get('/transacoes/:id', buscarTransacao)
rotas.post('/transacao', cadastrarTransacao)
rotas.put('/transacao/:id', editarTransacao)
rotas.delete('/transacao/:id', excluirTransacao)



module.exports = rotas;

