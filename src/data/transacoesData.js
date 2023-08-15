const database = require('../infra/database');



const buscarTodasTransacoesQuery = (id) => {
    return database.query('select * from transacoes where usuario_id = $1', [id])
}

const buscarUmaTransacaoQuery = (usuario_id, transacao_id) => {
    return database.query('select * from transacoes where usuario_id = $1 and id = $2', [usuario_id, transacao_id])
}

const trasacaoExisteNoUsuario = (usuario_id, categoria_id) => {
    return database.query('select * from categorias where usuario_id = $1 and id = $2', [usuario_id, categoria_id])
}

const cadastrarTransacaoQuery = (descricao, valor, data, categoria_id, tipo, usuario_id) => {
    return database.query('insert into transacoes (descricao, valor, data, categoria_id, tipo, usuario_id) values ($1, $2, $3, $4, $5, $6) RETURNING *', [descricao, valor, data, categoria_id, tipo, usuario_id])
}

const editarUmaTransacaoQuery = (descricao, valor, data, categoria_id, tipo, usuario_id, id) => {
    return database.query('update transacoes set descricao = $1, valor = $2, data = $3, categoria_id = $4, tipo = $5 where usuario_id = $6 and id = $7', [descricao, valor, data, categoria_id, tipo, usuario_id, id])
}

const excluirUmaTransacaoQuery = (usuario_id, id) => {
    return database.query('delete from transacoes where usuario_id = $1 and id = $2', [usuario_id, id])
}

module.exports = {
    buscarTodasTransacoesQuery,
    buscarUmaTransacaoQuery,
    trasacaoExisteNoUsuario,
    cadastrarTransacaoQuery,
    editarUmaTransacaoQuery,
    excluirUmaTransacaoQuery
}
