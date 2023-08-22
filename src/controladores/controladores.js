const {cadastrarUsuarioQuery, buscarUsuarioPorEmail, buscarUsuarioID, alterarUsuarioQuery} = require('../data/usuariosData')
const { buscarTodasTransacoesQuery, buscarUmaTransacaoQuery, cadastrarTransacaoQuery, editarUmaTransacaoQuery, excluirUmaTransacaoQuery, buscarTodasTransacoes, filtrarTransacoes} = require('../data/transacoesData')
const { verificarCamposPassados, verificarTransacaoExiste, verificarSeCategoriaFoiEncontrado, verificarTipoEntradaOuSaida, objMensagens, usuarioAcessoCategoria,validacaoGeral} = require('./suporte')
const bcrypt = require('bcrypt')
const validator = require("email-validator");
const jwt = require('jsonwebtoken');
const { listarCategoriasQuery, detalharCategoriaQuery, cadastrarCategoriasQuery, atualizarCategoriaQuery, verificarTransacoesPorCategoria, excluirCategoriaQuery } = require('../data/categoriasData');
require('dotenv').config()


const cadastrarUsuario = async (req, res) => {
    const {nome, email, senha} = req.body;
    try {
        const verificarCampos = () => verificarCamposPassados([nome, email, senha], res, objMensagens.todosCamposObrigatorios)
        if (validacaoGeral([verificarCampos])) {
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
        const verificarCampos = () => verificarCamposPassados([email, senha], res, objMensagens.todosCamposObrigatorios)
        if (validacaoGeral([verificarCampos])) {
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
        const verificarCampos = () => verificarCamposPassados([nome, email, senha], res, objMensagens.todosCamposObrigatorios)
        if (validacaoGeral([verificarCampos])) {
            return
        }
        const emailValido = validator.validate(email)
        const {rows} = await buscarUsuarioPorEmail(email)
        if (email && !emailValido) {
            return res.status(400).json({message: objMensagens.emailInvalido})
        }
        if (rows.length != 0) {
            return res.status(400).json({message: objMensagens.emailJaExiste})
        }
        const senhaEncriptada = await bcrypt.hash(senha, 10)
    
        await alterarUsuarioQuery(req.usuario_id_token, nome, email, senhaEncriptada)
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
        const {rows} = await detalharCategoriaQuery(categoria_id, req.usuario_id_token);
        const verificarCampos = () => verificarCamposPassados([descricao, valor, data, categoria_id, tipo], res, objMensagens.todosCamposObrigatorios)
        const verificarCategoriaExiste = () => verificarSeCategoriaFoiEncontrado(rows.length, res)
        const verificarTipo = () => verificarTipoEntradaOuSaida(tipo, res)
        if (validacaoGeral ([verificarCampos, verificarCategoriaExiste, verificarTipo])) {
            return
        };
     
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
        const categoriaExiste = await detalharCategoriaQuery(categoria_id, req.usuario_id_token)
        const {rows} = await buscarUmaTransacaoQuery(req.usuario_id_token, id)
       
        if(validacaoGeral([
            () => verificarTransacaoExiste(rows.length, res), 
            () => verificarCamposPassados([descricao, valor, data, categoria_id, tipo], res, objMensagens.todosCamposObrigatorios),
            () => verificarSeCategoriaFoiEncontrado(categoriaExiste.rows.length, res),
            () => verificarTipoEntradaOuSaida(tipo, res)])){
            return
        };
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
        const verificarTransacao = () => verificarTransacaoExiste(rows.length, res)
        if (validacaoGeral([verificarTransacao])) {
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
            "Entrada": rows[0].total == null ? 0 : rows[0].total,
            "Saida": rows[1].total == null ? 0 : rows[1].total
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
        const verificarCategoriaExiste = () => verificarSeCategoriaFoiEncontrado(resultado.rows.length, res)
        if (validacaoGeral([verificarCategoriaExiste])) {
            return
        };
        return res.status(200).json(resultado.rows);
    } catch (error) {
        console.log(error.message)
        return res.status(401).json({message: objMensagens.tokenInvalido});
    }   
};

const criarCategoria = async (req, res) => {
    const {descricao} = req.body
    try {
        const verificarCampos = () => verificarCamposPassados([descricao], res, objMensagens.categoriaDeveSerInformada)
        if (validacaoGeral([verificarCampos])) {
            return
        };        
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
        const verificarCampos = () => verificarCamposPassados([descricao], res, objMensagens.todosCamposObrigatorios)
        if (validacaoGeral([verificarCampos])) {
            return
        };  
        const {rowCount} = await detalharCategoriaQuery(id, req.usuario_id_token);
        if (rowCount < 1) {
            return res.status(404).json({message: objMensagens.categoriaNaoEncontrada})
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
        const {rowCount} = await detalharCategoriaQuery(id, req.usuario_id_token);
        if (rowCount < 1) {
            return res.status(404).json({message: objMensagens.categoriaNaoEncontrada})
        }
        const verificarTransacao = await verificarTransacoesPorCategoria(id);
        if (verificarTransacao.rowCount > 0) {
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

const transacaoVerificar = (req, res) => {
    const queryParams = req.query;
    if (Object.keys(queryParams).length === 0) {
      listarTransacoes(req, res);
    } else {
      filtroTranscoes(req, res);
    }
}

module.exports = {
    cadastrarUsuario,
    loginUsuario,
    detalharUsuario,
    alterarUsuario,
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
    transacaoVerificar
}