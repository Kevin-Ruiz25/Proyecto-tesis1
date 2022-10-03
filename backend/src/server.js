const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

const rol = require('./routes/admin/rol');
const usuario = require('./routes/admin/usuario');
const cliente = require('./routes/customer/cliente');
const direcciones = require('./routes/customer/direccion');
const auth = require('./routes/admin/auth');

const app = express();
const root = '/api';

app.use(express.json());
app.use(cors());
dotenv.config();

app.use(root,rol);
app.use(root,usuario);
app.use(root,cliente);
app.use(root,direcciones);
app.use(root,auth);

app.use('/', (req,res) =>{ res.sendFile(`${__dirname}/public/index.html`);});

app.listen(process.env.PORT || 3000, () =>{
    console.log('API REST - Visita Clientes');
});
