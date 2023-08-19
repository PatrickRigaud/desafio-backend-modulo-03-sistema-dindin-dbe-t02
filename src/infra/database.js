const { Pool } = require('pg');
require('dotenv').config()

const db = new Pool({
	user: process.env.db_usuario,
	password: process.env.db_senha,
	host: process.env.db_host,
	port: process.env.db_port,
	database: process.env.db_nome_db
});

module.exports = db;