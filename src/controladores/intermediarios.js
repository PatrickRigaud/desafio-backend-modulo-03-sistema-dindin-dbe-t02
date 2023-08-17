const { prepararToken } = require("./suporte");

const validador = async (req, res, next) => {
    const {authorization} = req.headers;
    const validarToken = prepararToken(authorization);
    req.usuario_id = validarToken.id;
    if (!validarToken) {
        return res.status(401).json({message: 'Para acessar este recurso um token de autenticação válido deve ser enviado.'});
    } else {
        next()
    }
};

module.exports = { validador }






