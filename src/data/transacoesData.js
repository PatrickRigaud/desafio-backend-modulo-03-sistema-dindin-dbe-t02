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

module.exports = {
    buscarTodasTransacoesQuery,
    buscarUmaTransacaoQuery,
    trasacaoExisteNoUsuario,
    cadastrarTransacaoQuery
}
