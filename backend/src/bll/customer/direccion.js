const pg = require('pg');

const sv = require('../shared/shared_vars');
const v = require('../shared/validaciones');

const pool = new pg.Pool(sv.conexion_db);

function actualiza_visita(){
    return 'update clt.cliente set visitado = $1 where id = $2';
}

function inhabilitar_direcciones(){
    return 'update clt.direccion_cliente set activa = false where id_cliente = $1';
}

function query_direcciones(){
    return `select id_cliente,
            dc.id as id_direccion,
            dc.descripcion as direccion,
            u.fotografia,
            observaciones,
            activa,
            dc.ing_id_usuario as id_usuario_registra,
            u.nombre as usuario_registro,
            ing_fecha as fecha_registro,
            dc.upd_id_usuario as id_usuario_actualiza,
            u2.nombre as usuario_actualiza,
            dc.upd_fecha as fecha_actualiza,
            dc.longitud as longitud,
            dc.latitud as latitud,
            dc.visitado visitado,
            dc.visita_id_usuario as id_usuario_visita,
            u3.nombre as usuario_visita,
            dc.visita_fecha as fecha_visita
        from clt.direccion_cliente dc
        inner join adm.usuario u on (dc.ing_id_usuario = u.id)
          left join adm.usuario u2 on (dc.upd_id_usuario = u.id)
          left join adm.usuario u3 on (dc.visita_id_usuario = u.id)`
}

exports.obtener_direcciones = async(req,res) =>{
    const client = await pool.connect();
    try{
        let sql = `${query_direcciones()} where ing_id_usuario = $1 and id_cliente = $2 order by dc.id`;        
        let direcciones = await client.query(sql,[req.body.id_usuario,req.body.id_cliente]);
        if(direcciones.rowCount > 0){res.json(direcciones.rows);}
        else{res.send({msj: 'No se han encontrado registros'});}
    }
    catch(err){
        console.log(err);
        res.json(sv.mensaje_generico);
    }
    finally{
        client.release();
    }
};

exports.obtener_direcciones_cobrador = async(req,res) =>{
    let cobrador = await v.buscar_cobrador(req.params.id_cobrador);
    if(!cobrador) {return res.status(401).json({exito: false, msj: 'Usuario no autorizado'});}
    
    const client = await pool.connect();
    try{

        let sql = `${query_direcciones()} where visita_id_usuario = $1 order by dc.id`;            
        let direcciones = await client.query(sql,[req.params.id_cobrador]);
        if(direcciones.rowCount > 0){res.json(direcciones.rows);}
        else{res.send({msj: 'No se han encontrado registros'});}
    }
    catch(err){
        console.log(err);
        res.json(sv.mensaje_generico);
    }
    finally{
        client.release();
    }
};

exports.registrar_direccion = async(req, res) =>{
    if(v.is_empty(req.body)) {return res.json({exito: false, msj: 'No se han enviado datos para registrar'});}
    
    const existe = await v.buscar_cliente(req.body.id_cliente);
    if(!existe){ return res.json({exito :false, msj: 'No se ha encontrado al cliente'});}

    let cobrador = await v.asignar_cobrador();
    if(cobrador.error) {return res.json({exito: false, msj: 'Ha ocurrido un error buscando un cobrador para asignar'});}

    const client = await pool.connect();
    try{
        let { error, value } = v.verificar_campos_direccion({
            id_cliente: req.body.id_cliente,
            direccion: req.body.direccion,
            fotografia: req.body.fotografia,
            observaciones: req.body.observaciones,
            id_usuario: req.body.id_usuario
        });
        if(error){return res.json({exito: false, msj: error.message});}

        let sql_direccion = `insert into clt.direccion_cliente (id_cliente,descripcion,fotografia,observaciones,ing_id_usuario,visita_id_usuario)
                        values($1,$2,$3,$4,$5,$6,$7)`;
        let valores_direccion = [value.id_cliente, value.direccion, value.fotografia, value.observaciones, value.id_usuario, cobrador.id];

        await client.query('BEGIN');
        await client.query(inhabilitar_direcciones(),[value.id_cliente]);
        await client.query(sql_direccion,valores_direccion);
        await client.query(actualiza_visita(),[false,value.id_cliente]);
        await client.query('COMMIT');
        
        res.json({exito: true, msj: 'Dirección almacenada correctamente'});
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

exports.actualizar_direccion = async(req,res) =>{
    if(v.is_empty(req.body)) {return res.json({exito: false, msj: 'No se han enviado datos para registrar'});}

    let { error, value } = v.verificar_campos_direccion({
        id_cliente: req.body.id_cliente,
        direccion: req.body.direccion,
        fotografia: req.body.fotografia,
        observaciones: req.body.observaciones,
        id_usuario: req.body.id_usuario
    });

    if(error){return res.json({exito: false, msj: error.message});}

    if(!v.consultar_direccion(value.id_cliente,req.body.id_direccion)){ return res.json({exito: false, msj:'No se encontró la dirección'});}

    const client = await pool.connect();
    try{
        let sql = `update clt.direccion_cliente
                        set direccion = $1,
                            fotografia = $2,
                            observaciones = $3,
                            upd_id_usuario = $4
                            upd_fecha = now()
                    where id_cliente = $5
                        and id = $6`;
        let valores = [
            value.direccion,
            value.fotografia,
            value.observaciones,
            value.id_usuario,
            value.id_cliente,
            req.body.id_direccion
        ]
        await client.query('BEGIN');
        await client.query(sql,valores);
        await client.query(actualiza_visita(),[false,value.id_cliente]);
        await client.query('COMMIT');
        res.json({exito: true, msj: 'Dirección actualizada con éxito'});
    }
    catch(err){
        await client.query('ROLLBACK');
        console.log(err);
        res.json(sv.mensaje_generico);
    }
    finally{
        client.release();
    }
};

exports.eliminar_direccion = async(req,res) =>{
    if(!v.consultar_direccion(value.id_cliente,req.body.id_direccion)){ return res.json({exito: false, msj:'No se encontró la dirección'});}
    const client = await pool.connect();
    try{
        let sql = 'delete from clt.direccion_cliente where id_cliente = $1 and id = $2';
        await client.query('BEGIN');
        await client.query(sql,[req.params.id_cliente,req.params.id_direccion]);
        await client.query(actualiza_visita(),[false,id_cliente]);
        await client.query('COMMIT');
        res.json({exito: true, msj: 'Dirección eliminada correctamente'});
    }
    catch(err){
        await client.query('ROLLBACK');
        console.log(err);
        res.json(sv.mensaje_generico);
    }
    finally{
        client.release();
    }
};

exports.registrar_visita = async(req,res) =>{
    if(v.is_empty(req.body)) {return res.json({exito: false, msj: 'No se han enviado datos para registrar'});}

    let {error, value} = v.verificar_campos_visita({
        longitud: req.body.longitud,
        latitud: req.body.latitud,
        id_usuario: req.body.id_usuario,
        id_cliente: req.body.id_cliente,
        id_direccion: req.body.id_direccion
    });
    if(error){ return res.json({exito: false, msj: error.message});}

    if(!v.consultar_direccion(value.id_cliente, value.id_direccion)){ return res.json({exito: false, msj:'No se encontró la dirección'});}
    const client = await pool.connect();
    try{    
        let sql = `update clt.direccion_cliente
                        set longitud = $1,
                            latitud = $2,
                            visitado = true,
                            visita_id_usuario = $3,
                            visita_fecha= now()
                    where id_cliente = $4
                        and id = $5`;
        let valores = [
            value.longitud,
            value.latitud,
            value.id_usuario,
            value.id_cliente,
            value.id_direccion
        ];

        await client.query('BEGIN');
        await client.query(sql,valores);
        await client.query(actualiza_visita(),[true,value.id_cliente]);
        await client.query('COMMIT');
        res.json({exito: true, msj: 'Se ha registrado exitosamente la visita'});
    }
    catch(err){
        await client.query('ROLLBACK');
        console.log(err);
        res.json(sv.mensaje_generico);
    }
    finally{
        client.release();
    }
};

exports.anular_visitas = async(req,res) =>{
    const client = await pool.connect();
    try{
        await client.query('BEGIN');
        await client.query(`update clt.direccion_cliente dc 
                            set visitado = false,
                                longitud = null,
                                latitud = null,
                                visita_fecha = null,
                                visita_id_usuario = null`);
        await client.query('update clt.cliente set visitado = false');
        await client.query('COMMIT');
        res.send('Listo :v')
    }
    catch(err){
        console.log(err);
        res.end('error');
    }
    finally{
        client.release();
    }
}