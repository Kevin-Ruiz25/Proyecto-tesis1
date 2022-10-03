const pg = require('pg');

const sv = require('../shared/shared_vars');
const v = require('../shared/validaciones');

const pool = new pg.Pool(sv.conexion_db);

function querySelect(){
    return `select r.id, id_rol, rl.nombre as rol, path, titulo, autorizado 
            from adm.ruta r
                inner join adm.rol rl on (r.id_rol = rl.id);`;
}

exports.obtener_todos = async(req,res) =>{
    const client = await pool.connect()
    try{
        let sql = querySelect();
        let rutas = await client.query(sql);
        if(rutas.rowCount > 0){res.json(rutas.rows);}
        else{res.send({msj: 'Aún no se han registrado rutas'});}
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
        let sql = `${querySelect()} where r.id = $1`;
        let ruta = await client.query(sql,[req.params.id]);
        if(ruta.rowCount > 0){res.json(ruta.rows[0]);}
        else{res.json({msj:'No se encontró el ruta'});}
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

    let {error, value} = v.verificar_campos_ruta({
        id_rol: req.body.id_rol,
        path: req.body.path,
        tituo: req.body.titulo,
        autorizado: req.body.autorizado
    });
    if(error){return res.json({exito: false, msj:error.message});}

    if(!v.buscar_rol(value.id_rol)){return res.json({exito:false, msj: 'No se encontró el rol para asignar permiso'});}

    const client = await pool.connect()
    try{
        let sql = 'insert into adm.ruta(id_rol,path,titulo,autorizado) values($1,$2)';
        let values = [value.id_rol,
                      value.path,
                      value.titulo,
                      value.autorizado];

        await client.query('BEGIN');
        await client.query(sql,values);
        await client.query('COMMIT');

        res.json({exito: true, msj:'Ruta almacenada correctamente'});
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
    const existe = await v.buscar_ruta(req.params.id);
    if(!existe){ return res.json({exito: false, msj: 'No se ha encontrado la ruta'});}

    const client = await pool.connect();
    try{
        let {error, value} = v.verificar_campos_ruta({
            id_rol: req.body.id_rol,
            path: req.body.path,
            tituo: req.body.titulo,
            autorizado: req.body.autorizado
	    });

        if(error){return res.json({exito: false, msj:error.message});}

        let sql = `update adm.ruta
                        set id_rol = $1,
                            path = $2,
                            titulo = $3,
                            autorizado = $4
                    where id = $5`;

        let values = [value.id_rol,
                      value.path,
                      value.titulo,
                      value.autorizado,
                      req.params.id
                    ];
        
        await client.query('BEGIN');
        await client.query(sql,values);
        await client.query('COMMIT');

        res.json({exito: true, msj:'Ruta actualizada correctamente'});
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
    const existe = await v.buscar_ruta(req.params.id);
    if(!existe){ return res.json({exito: false, msj: 'No se ha encontrado la ruta'});}
    
    const client = await pool.connect();
    try{
        let sql = 'delete from adm.ruta where id = $1';
        await client.query('BEGIN');
        await client.query(sql,[req.params.id]);
        await client.query('COMMIT');
        res.json({exito: true, msj:'Ruta eliminada correctamente'});
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