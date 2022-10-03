const pg = require('pg');

const sv = require('../shared/shared_vars');
const v = require('../shared/validaciones');

const pool = new pg.Pool(sv.conexion_db);

exports.login = async (req,res) =>{
    if(v.is_empty(req.body)) {return res.json({exito: false, msj: 'No se ha proporcionado usuario y contraseña'});}
    const client = await pool.connect();
    try{
        let {error,value} = v.verificar_login({
            usuario: req.body.usuario,
            password: req.body.password
        });

        if(error) return res.json({exito: false, msj: error.message});

        let sql = 'select id as id_usuario, pass, activo, sesion,primer_login from adm.usuario where usuario = $1';
        let resultado = await client.query(sql, [value.usuario]);
        if(resultado.rowCount > 0){
            let exito = await v.comparar_hash(value.password,resultado.rows[0].pass);
            if(!exito){ 
                res.status(401);
                return res.json({
                    exito: false,
                    msj: 'Usuario o contraseña incorrecta'
                });
            }
            
            if(resultado.rows[0].activo){
                await client.query('BEGIN')
                if(resultado.rows[0].primer_login){
                    await client.query('update adm.usuario set primer_login=false where id = $1',[resultado.rows[0].id_usuario]);
                }
                await client.query('update adm.usuario set sesion = true where id = $1',[resultado.rows[0].id_usuario]);
                await client.query('COMMIT');    

                let sql_usuario = `select u.id as id_usuario, u.nombre, u.apellido, u.usuario, u.id_rol, r.nombre as rol,fotografia, u.activo, primer_login, sesion
                                        from adm.usuario u
                                        inner join adm.rol r on (u.id_rol = r.id)
                                        where u.id = $1`;

                let r_usuario = await client.query(sql_usuario,[resultado.rows[0].id_usuario]);
                return res.json({
                    exito: true, 
                    msj: `Bienvenido ${r_usuario.rows[0].nombre} ${r_usuario.rows[0].apellido}`,
                    id_usuario: r_usuario.rows[0].id_usuario,
                    nombre: r_usuario.rows[0].nombre,
                    apellido: r_usuario.rows[0].apellido,
                    usuario: r_usuario.rows[0].usuario,
                    id_rol: r_usuario.rows[0].id_rol,
                    rol: r_usuario.rows[0].rol,
                    fotografia: r_usuario.rows[0].fotografia,
                    activo: r_usuario.rows[0].activo,
                    primer_login: r_usuario.rows[0].primer_login,
                    sesion: r_usuario.rows[0].sesion
                });
            }
            else{
                await client.query('ROLLBACK');    
                res.status(401);
                res.json({ exito: false, msj: 'El usuario no se encuentra activo'});
            }
        }
        else{
            res.status(204);
            return res.json({
                exito: false,
                msj: 'Ha ocurrido un error al intentar obtener datos'
            });
        }
    }
    catch(err){
        await client.query('ROLLBACK');
        console.log(err);
        res.json(sv.mensaje_generico);
    }
    finally{
        client.release();
    }
}

exports.logout = async (req,res) =>{
    if(v.is_empty(req.body)) {return res.json({exito: false, msj: 'No se ha proporcionado usuario para cerrar sesión'});}
    const client = await pool.connect();
    try{
        let {error,value} = v.verificar_login({
            usuario: req.body.usuario,
            password: "xxxxx"
        });
        
        await client.query('BEGIN')
        await client.query('update adm.usuario set sesion = false where usuario = $1',[value.usuario]);
        await client.query('COMMIT');
        res.json({
            exito: true,
            msj: 'Usuario desconectado correctamente'
        })
    }
    catch(err){
        await client.query('ROLLBACK');
        console.log(err);
        res.json(sv.mensaje_generico);
    }
    finally{
        client.release();
    }
}

exports.restablecer_logins = async(req,res) =>{
    const client = await pool.connect();
    try{
        await client.query('BEGIN');
        await client.query('update adm.usuario set sesion = false, primer_login = true');
        await client.query('COMMIT');
    }
    catch(err){
        console.log(err);
        res.json(sv.mensaje_generico);
    }
    finally{
        client.release();
    }
}