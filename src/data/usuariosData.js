const bcrypt = require('bcrypt');
const database = require('../infra/database');
const jwt = require('jsonwebtoken');
const senhaToken = require('../senhaJwt');

// só criei esses endpoints pois eu preciso deles para poder fazer e testar as categorias.
// mas não consegui concluir o login, o cadastro tem mais coisas a fazer.

const cadastrarUsuario = async (req, res) => {
    const {nome, email, senha} = req.body;
    try {
        
        const senhaCriptografada = await bcrypt.hash(senha, 10);
        const novoUsuario = await database.query('insert into usuarios (nome, email, senha) values ($1, $2, $3) returning *', [nome, email, senhaCriptografada]);
        return res.status(201).json(novoUsuario.rows[0]) // tem que arrumar isso

    } catch (error) { 
        return res.status(500).json({mensagem: 'Erro interno do servidor'});
    }
}

const login = async (req, res) => {
    console.log(req.body)
    const { email } = req.body;
    const { senha } = req.body; //não to conseguindo usar a const senha, por mais que use no código não fica branca.
    try {

        const verificandoUsuario = await database.query('select * from usuarios where email = $1', [email]);
        console.log(verificandoUsuario)        
        if (verificandoUsuario.rowCount === 0) { 
            return res.status(404).json({mensagem: 'Email ou senha inválidos'})
        }
        console.log(1)
        //não ta passando daqui (muito sono)

        const verificandoSenha = await bcrypt.compare( senha, verificandoUsuario.rows[0].senha);
        console.log(verificandoSenha)
        if (!verificandoSenha) {
            return res.status(404).json({mensagem: 'Email ou senha inválidos.'})
        }
        console.log(verificandoSenha)
        const token = jwt.sign({id: verificandoUsuario.rows[0].id}, senhaToken, { expiresIn: '8h'});
        console.log(token);
        const { senha, ...usuario } = verificandoUsuario.rows[0];

        return res.status(200).json({
            usuario: usuario, token
        })
    } catch (error) {
        console.log(error.mensage)
        return res.status(500).json({mensagem: 'Erro interno do servidor'});
    }
}

const buscarUsuariosQuery = () => {
	return database.query('select * from usuarios')}







    
module.exports = {
    cadastrarUsuario,
    login,
    buscarUsuariosQuery
}