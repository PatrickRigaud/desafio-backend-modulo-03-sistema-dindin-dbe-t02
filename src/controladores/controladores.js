const {cadastrarUsuarioQuery, buscarUsuarioPorEmail, buscarUsuarioID, alterarUsuarioQuery} = require('../data/usuariosData')
const { buscarTodasTransacoesQuery, buscarUmaTransacaoQuery, trasacaoExisteNoUsuario, cadastrarTransacaoQuery, editarUmaTransacaoQuery, excluirUmaTransacaoQuery, buscarTodasTransacoes} = require('../data/transacoesData')
const { prepararToken, verificarCamposPassados, verificarTransacaoExiste, verificarSeCategoriaFoiEncontrado, verificarTipoEntradaOuSaida} = require('./suporte')
const bcrypt = require('bcrypt')
const validator = require("email-validator");
const jwt = require('jsonwebtoken');
const { listarCategoriasQuery, detalharCategoriaQuery, cadastrarCategoriasQuery, atualizarCategoriaQuery, verificarTransacoesPorCategoria, excluirCategoriaQuery } = require('../data/categoriasData');
require('dotenv').config()


const cadastrarUsuario = async (req, res) => {
    const {nome, email, senha} = req.body

    verificarCamposPassados([nome, email, senha], res)

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
 
    verificarCamposPassados([email, senha], res)

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
        const validarToken = prepararToken(authorization)
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

const alterarUsuario = async (req, res) => {
    const {authorization} = req.headers
    const {nome, email, senha} = req.body

    try {
        const validarToken = prepararToken(authorization)

        if(!nome && !email && !senha){
            return res.status(400).json({message: 'Para alteração é necessário enviar ao menos um campo.'})
        }

        const emailValido = validator.validate(email)
        const {rows} = await buscarUsuarioPorEmail(email)
        const usuario = await buscarUsuarioID(validarToken.id)
        
        
        if(email && !emailValido){
            return res.status(400).json({message: 'Email inválido.'})
        }

        if(rows.length != 0){
            return res.status(400).json({message: 'Email já existe'})
        }

        let novoNome = ''
        let novoEmail = ''
        let novaSenha = ''

        if(senha){
            const senhaEncriptada = await bcrypt.hash(senha, 10)
            senha ? novaSenha = senhaEncriptada : novaSenha = usuario.rows[0].senha 
        }
        nome ? novoNome = nome : novoNome = usuario.rows[0].nome
        email ? novoEmail = email : novoEmail = usuario.rows[0].email
        

        await alterarUsuarioQuery(validarToken.id, novoNome, novoEmail, novaSenha)

        return res.status(204).json({message: 'Alteração realizada'})
    } catch (e) {
        console.log(e.message)
        return res.status(401).json({message: 'Para acessar este recurso um token de autenticação válido deve ser enviado.'})
    }   

}

const listarTransacoes = async (req, res) => {
    const {authorization} = req.headers

    try {
        const validarToken = prepararToken(authorization)
        const { rows } = await buscarTodasTransacoesQuery(validarToken.id)
        
        return res.status(200).json(rows)
    } catch (e) {
        console.log(e.message)
        return res.status(401).json({message: 'Para acessar este recurso um token de autenticação válido deve ser enviado.'})
    }

}

const buscarTransacao = async (req, res) => {
    const {authorization} = req.headers
    const {id} = req.params

    try {
        const validarToken = prepararToken(authorization)
        const {rows} = await buscarUmaTransacaoQuery(validarToken.id, id)
        
        if(rows.length == 0){
            return res.status(400).json({message: 'Transação não encontrada.'})
        }
        return res.status(200).json(rows)
    } catch (e) {
        console.log(e.message)
        return res.status(401).json({message: 'Para acessar este recurso um token de autenticação válido deve ser enviado.'})
    }
}

const cadastrarTransacao = async (req, res) => {
    const {authorization} = req.headers
    const {descricao, valor, data, categoria_id, tipo} = req.body

    try {
        const validarToken = prepararToken(authorization)
        const {rows} = await trasacaoExisteNoUsuario(validarToken.id, categoria_id)
        
        verificarCamposPassados([descricao, valor, data, categoria_id, tipo], res)

        verificarSeCategoriaFoiEncontrado(rows.length, res)

        verificarTipoEntradaOuSaida(tipo, res)

        const retornoCadastro = await cadastrarTransacaoQuery(descricao, valor, data, categoria_id, tipo, validarToken.id)
        retornoCadastro.rows[0].categoria_nome = rows[0].descricao

        return res.status(201).json(retornoCadastro.rows[0])
         
    } catch (e) {
        console.log(e.message)
        return res.status(401).json({message: 'Para acessar este recurso um token de autenticação válido deve ser enviado.'})
    }

}


const editarTransacao = async (req, res) => {
    const {authorization} = req.headers
    const {descricao, valor, data, categoria_id, tipo} = req.body
    const {id} = req.params

    try {
        const validarToken = prepararToken(authorization)
        const {rows} = await buscarUmaTransacaoQuery(validarToken.id, id)

        verificarTransacaoExiste(rows.length, res)

        verificarCamposPassados([descricao, valor, data, categoria_id, tipo], res)
        const transacaoExiste = await trasacaoExisteNoUsuario(validarToken.id, categoria_id)
        verificarSeCategoriaFoiEncontrado(transacaoExiste.rows.length, res)

        verificarTipoEntradaOuSaida(tipo, res)

       await editarUmaTransacaoQuery(descricao, valor, data, categoria_id, tipo, validarToken.id, id)

        return res.status(204).json()
    } catch (e) {
        console.log(e.message)
        return res.status(401).json({message: 'Para acessar este recurso um token de autenticação válido deve ser enviado.'})
    }
}

const excluirTransacao = async (req, res) => {
    const {authorization} = req.headers
    const {id} = req.params

    try {
        const validarToken = prepararToken(authorization)
        const {rows} = await buscarUmaTransacaoQuery(validarToken.id, id)

        verificarTransacaoExiste(rows.length, res)
        
        await excluirUmaTransacaoQuery(validarToken.id, id)
        return res.status(204).json()
    } catch (e) {
        console.log(e.message)
        return res.status(401).json({message: 'Para acessar este recurso um token de autenticação válido deve ser enviado.'})
    }
}

const extratoTransacoes = async (req, res) => {
    const {authorization} = req.headers

    try {
        const validarToken = prepararToken(authorization)

        const {rows} = await buscarTodasTransacoes(validarToken.id)
        
        res.status(200).json({
            "Entrada": rows[0].total,
            "Saida": rows[0].total
        })
        
    } catch (e) {
        console.log(e.message)
        return res.status(401).json({message: 'Para acessar este recurso um token de autenticação válido deve ser enviado.'})
    }
}

const listarCategorias = async (req, res) => {
    try {
        const resultado = await listarCategoriasQuery(req.usuario_id);
        return res.status(200).json(resultado.rows);
    } catch (error) {
        console.log(error.message);
        return res.status(401).json({message: 'Para acessar este recurso um token de autenticação válido deve ser enviado.'});
    }
};

const detalharCategoria = async (req, res) => {
    const {authorization} = req.headers;
    try {
        const validarToken = prepararToken(authorization);
        const resultado = await detalharCategoriaQuery(req.params.id, validarToken.id);
        if (resultado.rowCount === 0) {
            return res.status(404).json({mensagem: 'Nenhuma categoria encontrada'});
        } else {
            return res.status(200).json(resultado.rows);
        }
    } catch (error) {
        console.log(error.message)
        return res.status(401).json({message: 'Para acessar este recurso um token de autenticação válido deve ser enviado.'});
    }   
};

const criarCategoria = async (req, res) => {
    const {authorization} = req.headers;
    const {descricao} = req.body
    if (!descricao) {
        return res.status(401).json({message: 'A descrição da categoria deve ser informada.'})
    }
    try {
        const validarToken = prepararToken(authorization);
        const {rows} = await cadastrarCategoriasQuery(validarToken.id, descricao);
        return res.status(201).json(rows[0]);
    } catch (error) {
        console.log(error.message)
        return res.status(401).json({message: 'Para acessar este recurso um token de autenticação válido deve ser enviado.'});
    }   
}

const atualizarCategoria = async (req, res) => {
    const {authorization} = req.headers;
    const { descricao } = req.body;
    const { id } = req.params;
    if (!descricao) {
        return res.status(400).json({message: 'Informar descrição da categoria para alteração'});
    }
    try {
        const validarToken = prepararToken(authorization);
        const verificarCategoria = await detalharCategoriaQuery(id, validarToken.id);
        if (verificarCategoria.rowCount === 0 || validarToken.id != verificarCategoria.rows[0].usuario_id ){
            return res.status(403).json({message: 'Usuário não tem acesso a categoria informada.'});
        }
        await atualizarCategoriaQuery(descricao, id);
        return res.status(204).json();
    } catch (error) {
        console.log(error.message)
        return res.status(401).json({message: 'Para acessar este recurso um token de autenticação válido deve ser enviado.'});
    }  
}

const excluirCategoria = async (req, res) => {
    const {authorization} = req.headers;
    const { id } = req.params;

    try {
        const validarToken = prepararToken(authorization);
        const verificarCategoria = await detalharCategoriaQuery(id, validarToken.id);
        if (verificarCategoria.rowCount === 0 || validarToken.id != verificarCategoria.rows[0].usuario_id ){
            return res.status(403).json({message: 'Usuário não tem acesso a categoria informada.'});
        }
        const { rowCount } = await verificarTransacoesPorCategoria(id);
        if (rowCount > 0) {
            return res.status(401).json({message: 'Não é possivel excluir categoria associada a uma ou mais transações'})
        }
        await excluirCategoriaQuery(id);
        return res.status(204).json();
    } catch (error) {
        console.log(error.message)
        return res.status(401).json({message: 'Para acessar este recurso um token de autenticação válido deve ser enviado.'});
    }    
}


module.exports = {
    cadastrarUsuario,
    loginUsuario,
    detalharUsuario,
    alterarUsuario,
    listarTransacoes,
    buscarTransacao,
    cadastrarTransacao,
    editarTransacao,
    excluirTransacao,
    extratoTransacoes,
    listarCategorias,
    detalharCategoria,
    criarCategoria,
    atualizarCategoria,
    excluirCategoria
}