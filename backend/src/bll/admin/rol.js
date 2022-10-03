const pg = require('pg');

const sv = require('../shared/shared_vars');
const v = require('../shared/validaciones');

const pool = new pg.Pool(sv.conexion_db);

function querySelect(){
    return 'select id,nombre,descripcion, activo from adm.rol';
}

exports.obtener_todos = async(req,res) =>{
    const client = await pool.connect()
    try{
        let sql = querySelect();
        let roles = await client.query(sql);
        if(roles.rowCount > 0){res.json(roles.rows);}
        else{res.send({msj: 'Aún no se han registrado roles'});}
    }
    catch(err){
        console.log(err)
        res.send(sv.mensaje_generico);
    }
    finally{
        client.release();
    }
};

exports.obtener = async(req,res) =>{
    const client = await pool.connect()
    try{
        let sql = `${querySelect()} where id = $1`;
        let rol = await client.query(sql,[req.params.id]);
        if(rol.rowCount > 0){res.json(rol.rows[0]);}
        else{res.json({msj:'No se encontró el rol'});}
    }
    catch(err){
        console.log(err);
        res.send(sv.mensaje_generico);
    }
    finally{
        client.release();
    }
};

exports.guardar = async(req,res) =>{
    if(v.is_empty(req.body)) {return res.json({exito: false, msj: 'No se han enviado datos para guardar'});}
    const client = await pool.connect()
    try{
        let {error, value} = v.verificar_campos_rol({
            nombre: req.body.nombre,
            descripcion: req.body.descripcion,
            activo: true,
	    });
        if(error){return res.json({exito: false, msj:error.message});}

        let sql = 'insert into adm.rol(nombre,descripcion) values($1,$2)';
        let values = [value.nombre, value.descripcion];

        await client.query('BEGIN');
        await client.query(sql,values);
        await client.query('COMMIT');

        res.json({exito: true, msj:'Rol almacenado correctamente'});
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
    const existe = await v.buscar_rol(req.params.id);
    if(!existe){ return res.json({exito: false, msj: 'No se ha encontrado al rol'});}

    const client = await pool.connect();
    try{
        let {error, value} = v.verificar_campos_rol({
            nombre: req.body.nombre,
            descripcion: req.body.descripcion,
            activo: req.body.activo
	    });

        if(error){return res.json({exito: false, msj:error.message});}

        let sql = `update adm.rol
                        set nombre= $1,
                        descripcion= $2,
                        activo= $3
                    where id = $4`;

        let values = [value.nombre,
                      value.descripcion,
                      value.activo,
                      req.params.id
                    ];
        
        await client.query('BEGIN');
        await client.query(sql,values);
        await client.query('COMMIT');

        res.json({exito: true, msj:'Rol actualizado correctamente'});
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
    const existe = await v.buscar_rol(req.params.id);
    if(!existe){ return res.json({exito: false, msj: 'No se ha encontrado al rol'});}
    
    const client = await pool.connect();
    try{
        let sql = 'delete from adm.rol where id = $1';
        await client.query('BEGIN');
        await client.query(sql,[req.params.id]);
        await client.query('COMMIT');
        res.json({exito: true, msj:'Rol eliminado correctamente'});
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