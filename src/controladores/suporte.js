const jwt = require('jsonwebtoken')


const verificarSeCategoriaFoiEncontrado = (item, res) => {
    if(item == 0){
        return res.status(400).json({message: 'Categoria não encontrada.'})
    }
}

const prepararToken = (auth) => {
    const token = auth.split(' ')[1]
    return jwt.verify(token, process.env.senha_jwt)
}


const verificarCamposPassados = (listaCamposValidar, res) => {
    for(let item of listaCamposValidar){
        if(!item){
            return res.status(400).json({mensagem: "Todos os campos obrigatórios devem ser informados."})
        }
    }
}

const verificarTransacaoExiste = (transacao, res) => {
    if(transacao == 0){
        return res.status(400).json({message: 'Transação não encontrada.'})
    }
}

const verificarTipoEntradaOuSaida = (tipo, res) => {
    if(tipo != 'entrada' && tipo != 'saida'){
        return res.status(400).json({message: 'Tipo de transação inválida. Utilize Entrada ou Saída'})
    }

}


module.exports = {
    verificarSeCategoriaFoiEncontrado,
    prepararToken,
    verificarCamposPassados,
    verificarTransacaoExiste,
    verificarTipoEntradaOuSaida
}