const {buscarUsuariosQuery} = require('../data/usuariosData')

const buscarUsuarios = async (req, res)=> {
    const a = await buscarUsuariosQuery()

    res.json({message:a.rows})
}









module.exports = {
    buscarUsuarios
}