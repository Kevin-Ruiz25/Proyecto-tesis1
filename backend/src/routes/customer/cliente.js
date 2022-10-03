const express = require('express');
const cliente = require('../../bll/customer/cliente');
const router = express.Router();

router.get('/clientes/obtener/:id', cliente.obtener);
router.post('/clientes/obtener-todos', cliente.obtener_todos);
router.get('/clientes/obtener-por-vendedor/:id', cliente.obtener_por_vendedor);
router.post('/clientes/guardar', cliente.guardar);
router.put('/clientes/actualizar/:id', cliente.actualizar);
router.delete('/clientes/eliminar/:id', cliente.eliminar);

module.exports = router;