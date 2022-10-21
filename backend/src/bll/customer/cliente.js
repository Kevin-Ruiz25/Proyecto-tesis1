const pg = require('pg');

const sv = require('../shared/shared_vars');
const v = require('../shared/validaciones');

const pool = new pg.Pool(sv.conexion_db);

function querySelect(){
    return `select c.id as id_cliente,
                nombres,
                apellidos,
                dpi,
                telefono,
                c.activo,
                c.visitado,
                ing_id_usuario as id_usuario_registro,
                u.nombre as usuario_registro,
                ing_fecha as fecha_registro,
                upd_id_usuario as id_usuario_actualiza,
                u2.nombre as usuario_actualiza,
                upd_fecha ultima_actualizacion
            from clt.Cliente c
                left join adm.usuario u on (c.ing_id_usuario = u.id)
                left join adm.usuario u2 on (c.upd_id_usuario = u2.id)`;
}

exports.obtener_todos = async(req,res) =>{
    const client = await pool.connect()
    try{
        let sql = querySelect() + (req.body.visitado == null ? "" : " where visitado=" + req.body.visitado);
        let clientes = await client.query(sql);
        if(clientes.rowCount > 0){res.json(clientes.rows);}
        else{res.send({msj: 'No se encontraron registros'});}
    }
    catch(err){
        console.log(err);
        res.send(sv.mensaje_generico);
    }
    finally{
        client.release();
    }
};

exports.obtener = async(req,res) =>{
    const client = await pool.connect()
    try{
        let sql = `${querySelect()} where c.id = $1`;
        let cliente = await client.query(sql,[req.params.id.toLocaleUpperCase()]);
        if(cliente.rowCount > 0){res.json(cliente.rows[0]);}
        else{res.json({msj:'No se encontró el cliente'});}
    }
    catch(err){
        console.log(err);
        res.send(sv.mensaje_generico);
    }
    finally{
        client.release();
    }
};

exports.obtener_por_vendedor = async(req,res) =>{
    const client = await pool.connect()
    try{
        let sql = `${querySelect()} where c.ing_id_usuario = $1`;
        let cliente = await client.query(sql,[req.params.id]);
        if(cliente.rowCount > 0){res.json(cliente.rows);}
        else{res.json({msj:'No se encontraron registros con este vendedor'});}
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
        let {error, value} = v.verificar_campos_cliente({
            nombres: req.body.nombres,
            apellidos: req.body.apellidos,
            dpi: req.body.dpi,
            telefono: req.body.telefono,
            activo: true,
            id_usuario: req.body.id_usuario
	    });
        if(error){return res.json({exito: false, msj:error.message});}

        var existe_dpi = await client.query('select 1 as existe from clt.cliente where dpi = $1', [value.dpi]);
        if(existe_dpi.rowCount > 0) { return res.json({exito: false, msj: 'Este dpi ya se encuentra registrado'});}

        var correlativo = await client.query("select nextval(pg_get_serial_sequence('clt.Cliente','correlativo')) as correlativo");
        var fecha = new Date().getFullYear();
        var iniciales = value.nombres.substring(0,1) + value.apellidos.substring(0,1);
        var id = correlativo.rows[0].correlativo + iniciales.toLocaleUpperCase() + fecha

        let sql_cliente = `insert into clt.Cliente(id,nombres,apellidos,dpi,telefono,ing_id_usuario)
                   values($1,$2,$3,$4,$5,$6)`;
        let valores_cliente = [
                      id,
                      req.body.nombres, 
                      req.body.apellidos,
                      req.body.dpi,
                      req.body.telefono,
                      req.body.id_usuario
                    ];

        let { error2, value2 } = v.verificar_campos_direccion({
            id_cliente: id,
            direccion: req.body.direccion,
            fotografia: req.body.fotografia,
            observaciones: req.body.observaciones,
            activa: true,
            id_usuario: req.body.id_usuario
        });
        if(error2){return res.json({error2: true, msj: error2.message});}

        let sql_direccion = `insert into clt.direccion_cliente (id_cliente,descripcion,fotografia,observaciones,ing_id_usuario)
                        values($1,$2,$3,$4,$5)`;
        let valores_direccion = [
            id, 
            req.body.direccion,
            req.body.fotografia,
            req.body.observaciones,
            req.body.id_usuario
        ];

        await client.query('BEGIN');
        await client.query(sql_cliente,valores_cliente);
        await client.query(sql_direccion,valores_direccion);
        await client.query('COMMIT');
        res.json({exito: true, msj:`Cliente almacenado correctamente, ID: ${id}`});
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
    const existe = await v.buscar_cliente(req.params.id);
    if(!existe){ return res.json({exito: false, msj: 'No se ha encontrado al cliente'});}

    const client = await pool.connect();
    try{
        let {error, value} = v.verificar_campos_cliente({
            nombres: req.body.nombres,
            apellidos: req.body.apellidos,
            dpi: req.body.dpi,
            telefono: req.body.telefono,
            activo: req.body.activo,
            id_usuario: req.body.id_usuario
	    });

        if(error){return res.json({exito: false, msj:error.message});}

        let sql = `update clt.Cliente
                    set nombres= $1,
                        apellidos= $2,
                        dpi= $3,
                        telefono= $4,
                        activo= $5,
                        upd_id_usuario = $6,
                        upd_fecha = now()
                    where id = $7`;
        let values = [value.nombres,
                      value.apellidos,
                      value.dpi,
                      value.telefono,
                      value.activo,
                      value.id_usuario,
                      req.params.id
                    ];
        await client.query('BEGIN');
        await client.query(sql,values);
        await client.query('COMMIT');

        res.json({exito: true, msj:'Cliente actualizado correctamente'});
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
    const existe = await v.buscar_cliente(req.params.id);
    if(!existe){ return res.json({exito: false, msj: 'No se ha encontrado al cliente'});}
    
    const client = await pool.connect();
    try{
        const cliente_sql = 'delete from clt.Cliente where id = $1';
        const direccon_sql = 'delete from clt.direccion_cliente where id_cliente = $1';
        await client.query('BEGIN');
        await client.query(direccon_sql,[req.params.id]);
        await client.query(cliente_sql,[req.params.id]);
        await client.query('COMMIT');
        
        res.json({exito: true, msj:'Cliente eliminado correctamente'});
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