const express = require('express');

const auth = require('../../bll/admin/auth');

const router = express.Router();

router.post('/auth/login', auth.login);
router.post('/auth/restablecer-logins', auth.restablecer_logins);
router.post('/auth/logout', auth.logout);

module.exports = router;