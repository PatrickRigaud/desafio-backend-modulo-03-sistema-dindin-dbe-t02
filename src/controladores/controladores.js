const {cadastrarUsuarioQuery, buscarUsuarioPorEmail} = require('../data/usuariosData')
const bcrypt = require('bcrypt')
const validator = require("email-validator");
const jwt = require('jsonwebtoken')
require('dotenv').config()


const cadastrarUsuario = async (req, res) => {
    const {nome, email, senha} = req.body

    if(!nome || !email || !senha){
        return res.status(400).json({mensagem: "Preecha todos os campos"})
    }

  try{
    const senhaEncriptada = await bcrypt.hash(senha, 10)
    if(validator.validate(email)){
        const {rows} = await cadastrarUsuarioQuery(nome, email, senhaEncriptada)
        const {id} = rows[0]
    
        return res.status(201).json({id, nome, email})
    } else{
        return res.status(400).json({mensagem: "Email em formato inválido."})
    }
   
  }catch(e){
    console.log(e.message)
    return res.status(400).json({mensagem: "Já existe usuário cadastrado com o e-mail informado."})
  }   
}


const loginUsuario = async (req, res) => {
    try{
    const {email, senha} = req.body

    if(!email || !senha){
        return res.status(400).json({mensagem: "Preecha todos os campos"})
    }
    const {rows} = await buscarUsuarioPorEmail(email)

    if(rows.length === 0){
        return res.status(400).json({message: 'Usuário e/ou senha inválido(s).'})
    }

    const senhaValida = await bcrypt.compare(senha, rows[0].senha)

    if(!senhaValida){
        return res.status(400).json({message: 'Usuário e/ou senha inválido(s).'})
    }
      
    const token = jwt.sign({email}, process.env.senha_jwt)
    return res.status(200).json({usuario: {
        id: rows[0].id,
        nome: rows[0].nome,
        email
    },
    token})
        
    } catch (e) {
        console.log(e.message)
    return res.status(400).json({ message: 'Erro durante o login' });
  }
    
}




module.exports = {
    cadastrarUsuario,
    loginUsuario
}