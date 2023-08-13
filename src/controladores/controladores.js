const {cadastrarUsuarioQuery, buscarUsuarioPorEmail, buscarUsuarioID} = require('../data/usuariosData')
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
      
    const token = jwt.sign({id: rows[0].id}, process.env.senha_jwt)
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


const detalharUsuario = async (req, res) => {
    const {authorization} = req.headers

    try {
        const token = authorization.split(' ')[1]
        const validarToken = jwt.verify(token, process.env.senha_jwt)
        const {rows} = await buscarUsuarioID(validarToken.id)
        const {id, nome, email} = rows[0]
        
        return res.status(200).json({
            id,
            nome,
            email
         })
    } catch (error) {
        return res.status(401).json({message: 'Para acessar este recurso um token de autenticação válido deve ser enviado.'})
    }
    
}




module.exports = {
    cadastrarUsuario,
    loginUsuario,
    detalharUsuario
}