var routerExpress = require('express');
var router = routerExpress.Router();

const baseUrl = '/api';

// Basic routes
router.get(baseUrl, (req, res) => res.send({hello: 'there'}));

module.exports = router;