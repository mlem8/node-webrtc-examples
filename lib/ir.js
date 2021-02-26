'use strict';

const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');

router.use(bodyParser.json());
router.get('/', (req, res) => {
	console.log('received ir request!');
	console.log(req);
	res.send('we got your ir request');
});

module.exports = router;
