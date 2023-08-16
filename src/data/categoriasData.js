const db = require("../infra/database")


const listarCategoriasQuery = (id) => {
    return db.query('select * from categorias where usuario_id = $1', [id]);
};

const detalharCategoriaQuery = (id, usuario_id) => {
    return db.query('select * from categorias where id = $1 and usuario_id = $2', [id, usuario_id]);
}

const cadastrarCategoriasQuery = (id, descricao) => {
    return db.query('insert into categorias (usuario_id, descricao) values ($1, $2) returning *', [id, descricao]);
}

module.exports = { listarCategoriasQuery, detalharCategoriaQuery, cadastrarCategoriasQuery };