const jwt = require('jsonwebtoken')


const objMensagens = {
    todosCamposObrigatorios: "Todos os campos obrigatórios devem ser informados.",
    categoriaDeveSerInformada: "A descrição da categoria deve ser informada.",
    tokenInvalido: "Para acessar este recurso um token de autenticação válido deve ser enviado.",
    emailInvalido: "Email no formato inválido.",
    emailJaExiste: "Já existe usuário cadastrado com o e-mail informado.",
    usuarioSenhaInvalidos: "Usuário e/ou senha inválido(s).",
    informarCategoria: "Informar descrição da categoria para alteração",
    informarAoMenosUmCampo: 'Para alteração é necessário enviar ao menos um campo.',
    categoriaNaoEncontrada: 'Categoria não encontrada'
}


const verificarSeCategoriaFoiEncontrado = (item, res) => {
    if(item == 0){
        res.status(400).json({message: objMensagens.categoriaNaoEncontrada})
        return true
    }
}

const prepararToken = (auth) => {
    const token = auth.split(' ')[1]
    return jwt.verify(token, process.env.senha_jwt)
}


const verificarCamposPassados = (listaCamposValidar, res, message) => {
    for(let item of listaCamposValidar){
        if(!item || item == null || item == undefined || item == " "){
            res.status(400).json({mensagem: message})
            return true
        }
    }

}


const verificarTransacaoExiste = (transacao, res) => {
    if(transacao == 0){
        res.status(400).json({message: 'Transação não encontrada.'})
        return true
    }
}

const verificarTipoEntradaOuSaida = (tipo, res) => {
    if(tipo != 'entrada' && tipo != 'saida'){
        res.status(400).json({message: 'Tipo de transação inválida. Utilize Entrada ou Saída'})
        return true
    }

}


const usuarioAcessoCategoria = (categoria, id, usuario_id, res) => {
    if (categoria === 0 || id != usuario_id ){
         res.status(403).json({message: 'Usuário não tem acesso a categoria informada.'});
         return true    
    }
}

const validacaoGeral = (arrayValidacoes) => {
    for(let item of arrayValidacoes){
        if(item()) {
            return true
        }
    }
}




module.exports = {
    verificarSeCategoriaFoiEncontrado,
    prepararToken,
    verificarCamposPassados,
    verificarTransacaoExiste,
    verificarTipoEntradaOuSaida,
    objMensagens,
    usuarioAcessoCategoria,
    validacaoGeral
}