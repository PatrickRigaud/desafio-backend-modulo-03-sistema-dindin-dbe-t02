const rotas = require('./route/route');
const app = require('./server');

app.use(rotas)

app.listen(3000);