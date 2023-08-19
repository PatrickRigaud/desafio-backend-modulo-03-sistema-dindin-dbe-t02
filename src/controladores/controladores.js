const {cadastrarUsuarioQuery, buscarUsuarioPorEmail, buscarUsuarioID, alterarUsuarioQuery} = require('../data/usuariosData')
const { buscarTodasTransacoesQuery, buscarUmaTransacaoQuery, trasacaoExisteNoUsuario, cadastrarTransacaoQuery, editarUmaTransacaoQuery, excluirUmaTransacaoQuery, buscarTodasTransacoes, filtrarTransacoes} = require('../data/transacoesData')
const { verificarCamposPassados, verificarTransacaoExiste, verificarSeCategoriaFoiEncontrado, verificarTipoEntradaOuSaida, objMensagens, usuarioAcessoCategoria} = require('./suporte')
const bcrypt = require('bcrypt')
const validator = require("email-validator");
const jwt = require('jsonwebtoken');
const { listarCategoriasQuery, detalharCategoriaQuery, cadastrarCategoriasQuery, atualizarCategoriaQuery, verificarTransacoesPorCategoria, excluirCategoriaQuery } = require('../data/categoriasData');
require('dotenv').config()


const cadastrarUsuario = async (req, res) => {
    const {nome, email, senha} = req.body;
    try {
        const validacaoCampos = () => {
            return verificarCamposPassados([nome, email, senha], res, objMensagens.todosCamposObrigatorios)
        }
        if(validacaoCampos()){
            return
        }
        const senhaEncriptada = await bcrypt.hash(senha, 10)
        if (validator.validate(email)) {
            const {rows} = await cadastrarUsuarioQuery(nome, email, senhaEncriptada)
            const {id} = rows[0]
            return res.status(201).json({id, nome, email})
        } else {
            return res.status(400).json({mensagem: objMensagens.emailInvalido})
        }
    } catch(e) {
        console.log(e.message)
        return res.status(400).json({mensagem: objMensagens.emailJaExiste})
    }
};


const loginUsuario = async (req, res) => {
    try {
        const {email, senha} = req.body
        const validacaoCampos = () => {
            return verificarCamposPassados([email, senha], res, objMensagens.todosCamposObrigatorios)
        }
        if (validacaoCampos()) {
            return
        }
        const {rows} = await buscarUsuarioPorEmail(email)
        if (rows.length === 0) {
            return res.status(400).json({message: objMensagens.usuarioSenhaInvalidos})
        }
        const senhaValida = await bcrypt.compare(senha, rows[0].senha)
        if (!senhaValida) {
            return res.status(400).json({message: objMensagens.usuarioSenhaInvalidos})
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
    try {
        const {rows} = await buscarUsuarioID(req.usuario_id_token)
        const {id, nome, email} = rows[0]
        return res.status(200).json({
            id,
            nome,
            email
        })
    } catch (error) {
        return res.status(401).json({message: objMensagens.tokenInvalido})
    }
};

const alterarUsuario = async (req, res) => {
    const {nome, email, senha} = req.body
    try {
        if (!nome && !email && !senha) {
            return res.status(400).json({message: objMensagens.informarAoMenosUmCampo})
        }
        const emailValido = validator.validate(email)
        const {rows} = await buscarUsuarioPorEmail(email)
        const usuario = await buscarUsuarioID(req.usuario_id_token)
        if (email && !emailValido) {
            return res.status(400).json({message: objMensagens.emailInvalido})
        }
        if (rows.length != 0) {
            return res.status(400).json({message: objMensagens.emailJaExiste})
        }
        let novoNome = ''
        let novoEmail = ''
        let novaSenha = ''
        if (senha) {
            const senhaEncriptada = await bcrypt.hash(senha, 10)
            senha ? novaSenha = senhaEncriptada : novaSenha = usuario.rows[0].senha 
        }
        nome ? novoNome = nome : novoNome = usuario.rows[0].nome
        email ? novoEmail = email : novoEmail = usuario.rows[0].email
        await alterarUsuarioQuery(req.usuario_id_token, novoNome, novoEmail, novaSenha)
        return res.status(204).json()
    } catch (e) {
        console.log(e.message)
        return res.status(401).json({message: objMensagens.tokenInvalido})
    }
};

const listarTransacoes = async (req, res) => {
    try {
        const { rows } = await buscarTodasTransacoesQuery(req.usuario_id_token)
        return res.status(200).json(rows)
    } catch (e) {
        console.log(e.message)
        return res.status(401).json({message: objMensagens.tokenInvalido})
    }
};

const buscarTransacao = async (req, res) => {
    const {id} = req.params
    try {
        const {rows} = await buscarUmaTransacaoQuery(req.usuario_id_token, id)
        if (rows.length == 0) {
            return res.status(400).json({message: 'Transação não encontrada.'})
        }
        return res.status(200).json(rows)
    } catch (e) {
        console.log(e.message)
        return res.status(401).json({message: objMensagens.tokenInvalido})
    }
};

const cadastrarTransacao = async (req, res) => {
    const {descricao, valor, data, categoria_id, tipo} = req.body
    try {
        const {rows} = await trasacaoExisteNoUsuario(req.usuario_id_token, categoria_id)
        const validacaoCampos = () => {
            return verificarCamposPassados([descricao, valor, data, categoria_id, tipo], res, objMensagens.todosCamposObrigatorios)
        };
        const validacaoCategoria = () => {
            return verificarSeCategoriaFoiEncontrado(rows.length, res)
        }
        const validacaoTipo = () => {
            return verificarTipoEntradaOuSaida(tipo, res)
        }
        for ( item of [validacaoCampos, validacaoCategoria, validacaoTipo] ) {
            if (item()) {
                return
            }
        }
        const retornoCadastro = await cadastrarTransacaoQuery(descricao, valor, data, categoria_id, tipo, req.usuario_id_token)
        retornoCadastro.rows[0].categoria_nome = rows[0].descricao
        return res.status(201).json(retornoCadastro.rows[0])
    } catch (e) {
        console.log(e.message)
        return res.status(401).json({message: objMensagens.tokenInvalido})
    }
};

const editarTransacao = async (req, res) => {
    const {descricao, valor, data, categoria_id, tipo} = req.body
    const {id} = req.params
    try {
        const {rows} = await buscarUmaTransacaoQuery(req.usuario_id_token, id)
        const validacaoTransacao = () => {
            return verificarTransacaoExiste(rows.length, res)}
        const validacaoCampos = () => {
            return verificarCamposPassados([descricao, valor, data, categoria_id, tipo], res, objMensagens.todosCamposObrigatorios)
        }
        const transacaoExiste = await trasacaoExisteNoUsuario(req.usuario_id_token, categoria_id)
        const validacaoCategoria = () => {
            return verificarSeCategoriaFoiEncontrado(transacaoExiste.rows.length, res)
        }
        const validacaoTipo = () => {
            return verificarTipoEntradaOuSaida(tipo, res)
        }
        for ( item of [validacaoTransacao, validacaoCampos, validacaoCategoria, validacaoTipo] ) {
            if (item()) {
               return
            }
        }
        await editarUmaTransacaoQuery(descricao, valor, data, categoria_id, tipo, req.usuario_id_token, id)
        return res.status(204).json()
    } catch (e) {
        console.log(e.message)
        return res.status(401).json({message: objMensagens.tokenInvalido})
    }
}

const excluirTransacao = async (req, res) => {
    const {id} = req.params
    try {
        const {rows} = await buscarUmaTransacaoQuery(req.usuario_id_token, id)
        const validacaoTransacao = () => {
            return verificarTransacaoExiste(rows.length, res)
        }
        if(validacaoTransacao()){
            return
        }
        await excluirUmaTransacaoQuery(req.usuario_id_token, id)
        return res.status(204).json()
    } catch (e) {
        console.log(e.message)
        return res.status(401).json({message: objMensagens.tokenInvalido})
    }
};

const extratoTransacoes = async (req, res) => {
    try {
        const {rows} = await buscarTodasTransacoes(req.usuario_id_token)
        res.status(200).json({
            "Entrada": rows[0].total,
            "Saida": rows[0].total
        })
    } catch (e) {
        console.log(e.message)
        return res.status(401).json({message: objMensagens.tokenInvalido})
    }
};

const listarCategorias = async (req, res) => {
    try {
        const resultado = await listarCategoriasQuery(req.usuario_id_token);
        return res.status(200).json(resultado.rows);
    } catch (error) {
        console.log(error.message);
        return res.status(401).json({message: objMensagens.tokenInvalido});
    }
};

const detalharCategoria = async (req, res) => {
    try {
        const resultado = await detalharCategoriaQuery(req.params.id, req.usuario_id_token);
        const validacaoCategoria = () => {
            return verificarSeCategoriaFoiEncontrado(resultado.rows, res)
        }
        if (validacaoCategoria()) {
            return
        }
        return res.status(200).json(resultado.rows);
    } catch (error) {
        console.log(error.message)
        return res.status(401).json({message: objMensagens.tokenInvalido});
    }   
};

const criarCategoria = async (req, res) => {
    const {descricao} = req.body
    try {
        const validacaoCategoria = () => {
            return verificarCamposPassados([descricao], res, objMensagens.categoriaDeveSerInformada)
        }
        if (validacaoCategoria()) {
            return
        }
        const {rows} = await cadastrarCategoriasQuery(req.usuario_id_token, descricao);
        return res.status(201).json(rows[0]);
    } catch (error) {
        console.log(error.message)
        return res.status(401).json({message: objMensagens.tokenInvalido});
    }   
};

const atualizarCategoria = async (req, res) => {
    const { descricao } = req.body;
    const { id } = req.params;
    try {
        const validacaoCampos = () => {
            return verificarCamposPassados([descricao], res, objMensagens.informarCategoria)
        }
        const verificarCategoria = await detalharCategoriaQuery(id, req.usuario_id_token);
        const validacaoCategoria = () => {
            return usuarioAcessoCategoria(verificarCategoria.rowCount, req.usuario_id_token, verificarCategoria.rows[0].usuario_id, res )
        }
        for (item of [validacaoCampos, validacaoCategoria]) {
            if (item()) {
                return
            }
        }
        await atualizarCategoriaQuery(descricao, id);
        return res.status(204).json();
    } catch (error) {
        console.log(error.message)
        return res.status(401).json({message: objMensagens.tokenInvalido});
    }  
};

const excluirCategoria = async (req, res) => {
    const { id } = req.params;
    try {
        const verificarCategoria = await detalharCategoriaQuery(id, req.usuario_id_token);
        const validacaoCategoria = () => {
            return usuarioAcessoCategoria(verificarCategoria.rowCount, req.usuario_id_token, verificarCategoria.rows[0].usuario_id, res )
        }
        if (validacaoCategoria()) {
            return
        }
        const { rowCount } = await verificarTransacoesPorCategoria(id);
        if (rowCount > 0) {
            return res.status(401).json({message: 'Não é possivel excluir categoria associada a uma ou mais transações'})
        }
        await excluirCategoriaQuery(id);
        return res.status(204).json();
    } catch (error) {
        console.log(error.message)
        return res.status(401).json({message: objMensagens.tokenInvalido});
    }    
};

const filtroTranscoes = async (req, res) => {
    try {
        const {rows} = await filtrarTransacoes(req.usuario_id_token, req.query.filtro);
        return res.status(200).json(rows)
    } catch (error) {
        console.log(error.message)
        return res.status(401).json({message: 'Para acessar este recurso um token de autenticação válido deve ser enviado.'});
    }
};

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
    excluirCategoria,
    filtroTranscoes
}