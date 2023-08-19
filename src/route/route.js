const express = require('express');
const rotas = express();
const {cadastrarUsuario, loginUsuario, detalharUsuario, alterarUsuario, listarTransacoes, buscarTransacao, cadastrarTransacao, editarTransacao, excluirTransacao, extratoTransacoes, listarCategorias, detalharCategoria, criarCategoria, atualizarCategoria, excluirCategoria, filtroTranscoes} = require('../controladores/controladores');
const { validador } = require('../controladores/intermediarios');

rotas.post('/usuario', cadastrarUsuario)
rotas.post('/login', loginUsuario)

rotas.use(validador);


rotas.get('/usuario', detalharUsuario)
rotas.put('/usuario', alterarUsuario)


rotas.get('/categoria', listarCategorias)
rotas.get('/categoria/:id', detalharCategoria)
rotas.post('/categoria', criarCategoria)
rotas.put('/categoria/:id', atualizarCategoria)
rotas.delete('/categoria/:id', excluirCategoria)

rotas.get('/transacao/extrato', extratoTransacoes)
rotas.get('/transacoes', listarTransacoes)
rotas.get('/transacoes/:id', buscarTransacao)
rotas.post('/transacao', cadastrarTransacao)
rotas.put('/transacao/:id', editarTransacao)
rotas.delete('/transacao/:id', excluirTransacao)

rotas.get('/transacao/produtos', filtroTranscoes)

module.exports = rotas;

