const db = require('../infra/database');

const listarCategorias = async (req, res) => {
    const {id} = req.params;
    try {
        const query = 'select * from categorias where usuario_id = $1';
        const params = [id]
        const resultado = await db.query(query, params);
        if (resultado.rowCount === 0) {
            return res.status(404).json({mensagem: 'Nenhuma categoria encontrada'});
        } else {
            return res.status(200).json(resultado.rows);
        }
    } catch (error) {
        console.log(error.message);
    }
};


module.exports = { listarCategorias }