const database = require('../infra/database');



const buscarTodasTransacoesQuery = (id) => {
    return database.query('select * from transacoes where usuario_id = $1', [id])
}

const buscarUmaTransacaoQuery = (usuario_id, transacao_id) => {
    return database.query('select * from transacoes where usuario_id = $1 and id = $2', [usuario_id, transacao_id])
}


module.exports = {
    buscarTodasTransacoesQuery,
    buscarUmaTransacaoQuery
}
