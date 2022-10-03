const express = require('express');
const rol = require('../../bll/admin/rol');
const router = express.Router();

router.get('/roles/obtener-todos', rol.obtener_todos);
router.get('/roles/obtener/:id', rol.obtener);
router.post('/roles/guardar', rol.guardar);
router.put('/roles/actualizar/:id', rol.actualizar);
router.delete('/roles/eliminar/:id', rol.eliminar);

module.exports = router;