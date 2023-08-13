const jwt = require('jsonwebtoken')


const prepararToken = (auth) => {
    const token = auth.split(' ')[1]
    return jwt.verify(token, process.env.senha_jwt)
}

module.exports = {
    prepararToken
}