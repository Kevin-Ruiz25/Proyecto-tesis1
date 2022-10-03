const pg = require('pg');

const sv = require('../shared/shared_vars');
const v = require('../shared/validaciones');

const pool = new pg.Pool(sv.conexion_db);

function querySelect(){
    return `select u.id,
                u.nombre,
                u.apellido,
                u.usuario,
                r.id as id_rol,
                r.nombre as rol,
                u.activo,
                u.sesion
            from adm.usuario u
            	inner join adm.rol r on (u.id_rol = r.id)`;
}

exports.obtener_todos = async(req,res) =>{
    const client = await pool.connect()
    try{
        let sql = querySelect();
        let usuarios = await client.query(sql);
        if(usuarios.rowCount > 0){res.json(usuarios.rows);}
        else{res.send({msj: 'Aún no se han registrado usuarios'});}
    }
    catch(err){
        console.log(err);
        res.send(sv.mensaje_generico);
    }
    finally{
	client.release();
    }
}

exports.obtener = async(req,res) =>{
    const client = await pool.connect()
    try{
        let sql = `${querySelect()} where u.id = $1`;
        let usuario = await client.query(sql,[req.params.id]);
        if(usuario.rowCount > 0){res.json(usuario.rows[0]);}
        else{res.json({msj:'No se encontró el usuario'});}
    }
    catch(err){
        console.log(err);
        res.send(sv.mensaje_generico);
    }
    finally{
	client.release();
    }
}

exports.guardar = async(req,res) =>{
    if(v.is_empty(req.body)) {return res.json({exito: false, msj: 'No se han enviado datos para guardar'});}

    let {error, value} = v.verificar_campos_usuario({
        id_rol: req.body.id_rol,
        nombre: req.body.nombre,
        apellido: req.body.apellido,
        usuario: req.body.usuario,
        pass: req.body.pass,
        activo: true,
        fotografia: req.body.fotografia
    });
    if(error){return res.json({exito: false, msj:error.message});}

    const usuario = await v.buscar_usuario(value.usuario);
    if(usuario){return res.json({exito: false, msj:'Este usuario ya está registrado en el sistema'});}
    
    const rol_activo = await v.buscar_rol_activo(value.usuario,value.id_rol);
    if(rol_activo) {return res.json({exito: false, msj: 'El usuario no puede tener registrado dos veces el mismo rol o tener dos roles activos'})}
    
    const client = await pool.connect();
    try{
        const hash = await v.construir_hash(value.pass);
        let sql = `insert into adm.usuario(id_rol, nombre, apellido, usuario, pass, fotografia)
                   values($1,$2,$3,$4,$5,$6)`;
        let values = [
                        value.id_rol,
                        value.nombre, 
                        value.apellido,
                        value.usuario,
                        hash.valor,
                        value.fotografia
                    ];

        await client.query('BEGIN');
        await client.query(sql,values);
        await client.query('COMMIT');
        res.json({exito: true, msj:'Usuario almacenado correctamente'});
    }
    catch(err){
        await client.query('ROLLBACK');
        console.log(err);
        res.send(sv.mensaje_generico);
    }
    finally{
        client.release();
    }
};

exports.actualizar = async(req,res) =>{
    if(v.is_empty(req.body)) {return res.json({exito: false, msj: 'No se han enviado datos para actualizar'});}
    const existe = await v.buscar_usuario(null,req.params.id);
    if(!existe){ return res.json({exito: false, msj: 'No se ha encontrado al usuario'});}

    const client = await pool.connect();
    try{
        let {error, value} = v.verificar_campos_usuario({
            id_rol: 0,
            nombre: "xxx",
            apellido: "xxx",
            usuario: "xxx",
            pass: req.body.pass,
            activo: req.body.activo,
            fotografia: req.body.fotografia
	    });

        if(error){return res.json({exito: false, msj:error.message});}

        let sql = `update adm.usuario
                    set pass = $1,
                        fotografia = $2,
                        activo = $3,
                        sesion = false
                where id = $4`;
        let values = [value.pass,
                      value.fotografia,
                      value.activo,
                      req.params.id
                    ];
        await client.query('BEGIN');
        await client.query(sql,values);
        await client.query('COMMIT');
        res.json({msj:'Usuario actualizado correctamente'});
    }
    catch(err){
        await client.query('ROLLBACK');
        console.log(err);
        res.send(sv.mensaje_generico);
    }
    finally{
        client.release();
    }
};

exports.eliminar = async(req,res) =>{
    const existe = await v.buscar_usuario(null,req.params.id);
    if(!existe){ return res.json({exito: false, msj: 'No se ha encontrado al usuario'});}

    const usuario_usado = await v.usuario_usado(req.params.id);
    if(usuario_usado) return res.json({exito: false, msj: 'No se puede eliminar el usuario porque está asociado a un registro de un cliente'});
    
    const client = await pool.connect();
    try{
        let sql = 'delete from adm.usuario where id = $1';
        await client.query('BEGIN');
        await client.query(sql,[req.params.id]);
        await client.query('COMMIT');
        res.json({msj:'Usuario eliminado correctamente'});
    }
    catch(err){
        await client.query('ROLLBACK');
        console.log(err);
        res.send(sv.mensaje_generico);
    }
    finally{
        client.release();
    }
};
