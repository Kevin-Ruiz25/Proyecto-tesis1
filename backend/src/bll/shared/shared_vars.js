const dotenv = require('dotenv');

dotenv.config();

var conexion_db = {
    host: process.env.PG_HOST,
    database: process.env.PG_DB,
    user: process.env.PG_USER,
    password: process.env.PG_PASSWORD,
    port: process.env.PG_PORT,
    ssl: { rejectUnauthorized: false }
};

var mensaje_generico = {
    exito : false,
    msj: 'Ha ocurrido un error'
};

module.exports = {
    conexion_db,
    mensaje_generico
}