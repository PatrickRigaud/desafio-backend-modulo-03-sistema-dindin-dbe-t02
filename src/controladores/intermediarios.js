const { prepararToken, objMensagens } = require("./suporte");

const validador = async (req, res, next) => {
    const {authorization} = req.headers;
    const validarToken = prepararToken(authorization);
    req.usuario_id_token = validarToken.id;
    if (!validarToken) {
        return res.status(401).json({message: objMensagens.tokenInvalido});
    } 
     next()
    
};

module.exports = { validador }







