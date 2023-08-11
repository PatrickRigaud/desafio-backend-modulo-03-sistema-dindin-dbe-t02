const database = require('../infra/database')

const buscarUsuariosQuery = () => {
	return database.query('select * from usuarios')}







    
module.exports = {
    buscarUsuariosQuery
}