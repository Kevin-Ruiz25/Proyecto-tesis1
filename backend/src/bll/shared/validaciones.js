const pg = require('pg');
const Joi = require('joi');
const bcrypt = require('bcrypt');

const sv = require('../shared/shared_vars');

const pool = new pg.Pool(sv.conexion_db);

//-----------------Validaciones

function is_empty (obj) {
    for(var prop in obj) {
        if(obj.hasOwnProperty(prop)) return false;
    }
    return JSON.stringify(obj) === JSON.stringify({});
};

async function buscar_cliente(id) {
    const client = await pool.connect();
    try{
        const sql = "select 1 as cliente " +
                    "from clt.Cliente c " +
                       "inner join clt.direccion_cliente dc on (c.id = dc.id_cliente) " +
                    "where c.id = $1";
        const cliente = await client.query(sql,[id]);
        return (cliente.rowCount > 0 ? true : false);
    }
    catch(error){
        console.log(error);
    }
    finally{
        client.release();
    }
};

async function buscar_rol(id){
    const client = await pool.connect();
    try{
        const sql = 'select 1 as rol from adm.rol where id = $1';
        const rol = await client.query(sql,[id]);
        return (rol.rowCount > 0 ? true : false);
    }
    catch(err){
        console.log(err);
    }
    finally{
        client.release();
    }
};

async function buscar_rol_activo(usuario,rol){
    const client = await pool.connect();
    try{
        const sql = `select 1 as usuario
                    from adm.usuario u 
                    where usuario = $1
                    and (id_rol = $2 and activo = true)`;
        const rol_activo = await client.query(sql,[usuario,rol]);
        return (rol_activo.rowCount > 0 ? true : false);
    }
    catch(err){
        console.log(err);
    }
    finally{
        client.release();
    }
};

async function consultar_direccion(id_cliente,id_direccion){
    const client = await pool.connect();
    try{
        const sql = 'select 1 as direccion from clt.direccion_cliente where id_cliente = $1 and id = $2';
        const direccion = await client.query(sql,[id_cliente,id_direccion]);
        return (direccion.rowCount > 0 ? true : false);
    }
    catch(err){
        console.log(err);
    }
    finally{
        client.release();
    }
};

async function buscar_usuario(usuario,id_usuario){
    const client = await pool.connect();
    try{
        var sql = 'select 1 as usuario from adm.usuario where usuario = $1 or id = $2';
        var usuario = await client.query(sql,[usuario,id_usuario]);
        return (usuario.rowCount > 0 ? true : false);
    }
    catch(err){
        console.log(err);
    }
    finally{
        client.release();
    }
}

async function usuario_usado(id_usuario){
    const client = await pool.connect();
    try{
        var sql = `select 1 as usuario
                    from clt.cliente c 
                        inner join clt.direccion_cliente dc on (c.id = dc.id_cliente)
                    where c.ing_id_usuario = $1
                        or c.upd_id_usuario = $1
                        or dc.ing_id_usuario = $1
                        or dc.upd_id_usuario = $1
                        or dc.visita_id_usuario = $1`;
        const usuario = await client.query(sql,[id_usuario]);
        return (usuario.rowCount > 0 ? true:false);
    }
    catch(err){
        console.log();
    }
    finally{
        client.release();
    }
}

async function construir_hash(password){
    try{
        const saltRounds = 10;
        let valor = await bcrypt.hash(password, saltRounds)
        return {valor};
    }
    catch(err){
        console.log(err);
        return {exito: false};
    }
}

async function comparar_hash(password,hash){
    let exito = await bcrypt.compare(password, hash);
    console.log(exito);
    return exito;
} 

async function asignar_cobrador(){
    const client = await pool.connect();
    try{
        let sql = "select u.id " +
                  "from adm.usuario u " + 
                     "inner join adm.rol r on (u.id_rol = r.id and r.nombre = 'Cobrador') " + 
                     "left join clt.direccion_cliente dc on (u.id = dc.visita_id_usuario) " + 
                  "group by u.id " + 
                  "order by count(dc.visita_id_usuario), u.id desc " +
                  "limit 1";
        let resultado = await client.query(sql);
        return (resultado.rowCount > 0 ? {id: resultado.rows[0].id} : {exito: false});
    }
    catch(err){
        console.log(err);
        return {exito: false};
    }
    finally{
        client.release();
    }
}

async function buscar_cobrador(id) {
    const client = await pool.connect();
    try{
        const sql = "select 1 as cobrador " +
                    "from adm.usuario u " +
                       "inner join adm.rol r on (u.id_rol = r.id and r.nombre = 'Cobrador')" +
                    "where u.id = $1";
        const cobrador = await client.query(sql,[id]);
        return (cobrador.rowCount > 0 ? true : false);
    }
    catch(error){
        console.log(error);
    }
    finally{
        client.release();
    }
};

//---------------Validaciones con Joi

function verificar_campos_cliente(cliente){
    const schema = Joi.object({
        nombres: Joi.string().min(3).max(50).required(),
        apellidos: Joi.string().min(3).max(50).required(),
        dpi: Joi.string().required(),
        telefono: Joi.string().min(3).max(50).required(),
        activo: Joi.boolean().required(),
        id_usuario: Joi.number().required()
    });
    return schema.validate(cliente);
};

function verificar_campos_direccion(direccion){
    const schema = Joi.object({
        id_cliente: Joi.string().required(),
        direccion: Joi.string().max(250).required(),
        fotografia: Joi.string().max(400).required(),
        observaciones: Joi.string().min(3).max(250).required(),
        id_usuario: Joi.number().required()
    });
    return schema.validate(direccion);
};

function verificar_campos_rol(rol){
    const schema = Joi.object({
        nombre: Joi.string().min(3).max(50).required(),
        descripcion: Joi.string().min(3).max(200).required(),
        activo: Joi.boolean().required()
    });
    return schema.validate(rol);
};

function verificar_campos_usuario(cliente){
    const schema = Joi.object({
        id_rol: Joi.number().required(),
        nombre: Joi.string().min(3).max(50).required(),
        apellido: Joi.string().min(3).max(50).required(),
        usuario: Joi.string().min(3).max(20).required(),
        pass: Joi.string().min(5).max(800).required(),
        activo: Joi.boolean().required(),
        fotografia: Joi.string().min(3).max(400).required(),
    });
    return schema.validate(cliente);
};

function verificar_campos_visita(visita){
    const schema = Joi.object({
        longitud: Joi.number().precision(5).required(),
        latitud: Joi.number().precision(5).required(),
        id_usuario: Joi.number().required(),
        id_cliente: Joi.string().required(),
        id_direccion: Joi.number().required()
    });
    return schema.validate(visita);
};

function verificar_campos_ruta(ruta){
    const schema = Joi.object({
        id_rol: Joi.number().required(),
        path: Joi.string().required(),
        titulo: Joi.string().required(),
        autorizado: Joi.boolean().required()
    });
    return schema.validate(ruta);
};

function verificar_login(login) {
    const schema = Joi.object({
        usuario: Joi.string().min(3).required(),
        password: Joi.string().min(3).required(),
    });
    return schema.validate(login);
}

module.exports = {
    is_empty,
    buscar_cliente,
    buscar_rol,
    buscar_rol_activo,
    buscar_usuario,
    consultar_direccion,
    usuario_usado,
    construir_hash,
    comparar_hash,
    asignar_cobrador,
    buscar_cobrador,
    verificar_campos_rol,
    verificar_campos_usuario,
    verificar_campos_ruta,
    verificar_campos_cliente,
    verificar_campos_direccion,
    verificar_campos_visita,
    verificar_login
};