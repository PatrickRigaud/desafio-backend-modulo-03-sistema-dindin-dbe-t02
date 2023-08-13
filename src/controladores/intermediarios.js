const jwt = require('jsonwebtoken');
const senhaToken = require('../senhaJwt');


const verificarUsuarioLogado = async (req, res, next) => {
    const {authorization} = req.headers; 

    if (!authorization) { 
        return res.status(401).json({mensagem:'Não autorizado'});
    }

    const token = authorization.split(' ')[1];

    try {
        const tokenUsuario = jwt.verify(token, senhaToken);
        next();  
    } catch (error) {
        return res.status(401).json({mensagem:'Não autorizado'});
    }
}

module.exports = verificarUsuarioLogado;