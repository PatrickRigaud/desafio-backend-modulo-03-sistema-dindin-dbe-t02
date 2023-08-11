const { Pool } = require('pg');

const db = new Pool({
	user: 'postgres',
	password: 'qwe123qw',
	host: 'localhost',
	port: 5432,
	database: 'dindin'
});

module.exports = db;