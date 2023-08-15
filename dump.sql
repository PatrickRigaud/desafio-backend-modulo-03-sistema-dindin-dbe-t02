
create database dindin;

create table usuarios (
	id serial primary key,
	nome varchar(60),
	email varchar(60) unique,
	senha varchar(250)
);

create table categorias (
	id serial primary key,
	usuario_id integer references usuarios(id),
	descricao varchar(250)
);

create table transacoes (
	id serial primary key,
	descricao varchar(250),
    valor integer,
    data timestamptz DEFAULT now(),
    usuario_id integer references usuarios(id),
    categoria_id integer references categorias(id),
    tipo varchar(100)
);

