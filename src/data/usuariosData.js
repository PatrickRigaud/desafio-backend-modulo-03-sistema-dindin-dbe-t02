const database = require('../infra/database')

const cadastrarUsuarioQuery = (nome, email, senha) => {
    return database.query('insert into usuarios (nome, email, senha) values ($1, $2, $3) RETURNING *;', [nome, email, senha])
}






    
module.exports = {
    cadastrarUsuarioQuery
}