const express = require('express');
const app = express();
const rotas = require('./route/route')

app.use(express.json());
app.use(rotas);



app.listen(3000);