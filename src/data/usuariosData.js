const database = require('../infra/database')

const cadastrarUsuarioQuery = (nome, email, senha) => {
    return database.query('insert into usuarios (nome, email, senha) values ($1, $2, $3) RETURNING *;', [nome, email, senha])
}

const buscarUsuarioPorEmail = (email) => {
    return database.query('select * from usuarios where email = $1', [email])
}

const buscarUsuarioID = (id) => {
    return database.query('select * from usuarios where id = $1', [id])
}

const alterarUsuarioQuery = (id, nome, email, senha) => {
    return database.query('update usuarios set nome = $1, email = $2, senha = $3 where id = $4', [nome, email, senha, id])
}
    
module.exports = {
    cadastrarUsuarioQuery,
    buscarUsuarioPorEmail,
    buscarUsuarioID,
    alterarUsuarioQuery
}