const database = require('../infra/database')

const cadastrarUsuarioQuery = (nome, email, senha) => {
    return database.query('insert into usuarios (nome, email, senha) values ($1, $2, $3) RETURNING *;', [nome, email, senha])
}

const buscarUsuarioPorEmail = (email) => {
    return database.query('select * from usuarios where email = $1', [email])
}




    
module.exports = {
    cadastrarUsuarioQuery,
    buscarUsuarioPorEmail
}