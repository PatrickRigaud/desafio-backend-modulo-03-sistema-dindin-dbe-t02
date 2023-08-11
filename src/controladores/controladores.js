const {cadastrarUsuarioQuery} = require('../data/usuariosData')
const bcrypt = require('bcrypt')
const validator = require("email-validator");


const cadastrarUsuario = async (req, res) => {
    const {nome, email, senha} = req.body 

  try{
    const senhaEncriptada = await bcrypt.hash(senha, 10)
    if(validator.validate(email)){
        const cadastro = await cadastrarUsuarioQuery(nome, email, senhaEncriptada)

        const dadosRetorno = cadastro.rows[0]
        const {id} = dadosRetorno
    
        res.status(201).json({id, nome, email})
    } else{
        res.status(400).json({mensagem: "Email em formato inválido."})
    }
   
  }catch(e){
    res.status(400).json({mensagem: "Já existe usuário cadastrado com o e-mail informado."})
  }   
}







module.exports = {
    cadastrarUsuario
}