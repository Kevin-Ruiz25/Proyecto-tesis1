const express = require('express');
const ruta = require('../../bll/admin/ruta');
const router = express.Router();

router.get('/rutas/obtener-todos', ruta.obtener_todos);
router.get('/rutas/obtener/:id', ruta.obtener);
router.post('/rutas/guardar', ruta.guardar);
router.put('/rutas/actualizar/:id', ruta.actualizar);
router.delete('/rutas/eliminar/:id', ruta.eliminar);

module.exports = router;