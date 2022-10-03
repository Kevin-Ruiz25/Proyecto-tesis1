const express = require('express');
const direccion = require('../../bll/customer/direccion');
const router = express.Router();

//Rutas Vendedor
router.get('/direcciones/obtener-cobrador/:id_cobrador', direccion.obtener_direcciones_cobrador);
router.post('/direcciones/obtener', direccion.obtener_direcciones);
router.post('/direcciones/guardar', direccion.registrar_direccion);
router.put('/direcciones/actualizar/:id_cliente',direccion.actualizar_direccion);
router.delete('/direcciones/eliminar/:id_cliente/:id_direccion', direccion.eliminar_direccion);

//Rutas cobrador
router.post('/direcciones/registrar_visita',direccion.registrar_visita);
router.post('/direcciones/anular-visitas', direccion.anular_visitas);

module.exports = router;