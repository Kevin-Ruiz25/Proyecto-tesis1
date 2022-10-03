const express = require('express');
const usuario = require('../../bll/admin/usuario');
const router = express.Router();

router.get('/usuarios/obtener-todos', usuario.obtener_todos);
router.get('/usuarios/obtener/:id', usuario.obtener);
router.post('/usuarios/guardar', usuario.guardar);
router.put('/usuarios/actualizar/:id', usuario.actualizar);
router.delete('/usuarios/eliminar/:id', usuario.eliminar);

module.exports = router;