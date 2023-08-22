const database = require('../infra/database');



const buscarTodasTransacoesQuery = (id) => {
    return database.query('select * from transacoes where usuario_id = $1', [id])
}

const buscarUmaTransacaoQuery = (usuario_id, transacao_id) => {
    return database.query('select transacoes.id as "id", tipo, transacoes.descricao, valor, data, transacoes.usuario_id, categoria_id, categorias.descricao as "categoria_nome" from transacoes join categorias on transacoes.categoria_id = categorias.id where transacoes.id = $1 and transacoes.usuario_id = $2;', [transacao_id, usuario_id])
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

const buscarTodasTransacoes = (usuario_id) => {
    return database.query("SELECT 'entrada' AS tipo, SUM(CASE WHEN tipo = 'entrada' THEN valor ELSE 0 END) AS total FROM transacoes WHERE usuario_id = $1  UNION ALL  SELECT 'saida' AS tipo, SUM(CASE WHEN tipo = 'saida' THEN valor ELSE 0 END) AS total FROM transacoes WHERE usuario_id = $1;", [usuario_id])
}

const filtrarTransacoes = (usuario_id, filtro) => {
    const filtroFormatado = filtro.map(item => `%${item}%`);
    return database.query(`
    select 
    transacoes.id as "id", 
    tipo, 
    transacoes.descricao, 
    valor, 
    data, 
    transacoes.usuario_id, 
    categoria_id, 
    categorias.descricao as "categoria_nome" 
    from 
    transacoes join categorias on transacoes.categoria_id = categorias.id 
    where 
    transacoes.usuario_id = $1 
    and 
    categorias.descricao ilike any($2)`, [usuario_id, filtroFormatado]);
}

module.exports = {
    buscarTodasTransacoesQuery,
    buscarUmaTransacaoQuery,
    trasacaoExisteNoUsuario,
    cadastrarTransacaoQuery,
    editarUmaTransacaoQuery,
    excluirUmaTransacaoQuery,
    buscarTodasTransacoes,
    filtrarTransacoes
}
