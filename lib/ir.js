'use strict';

const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const lirc = require('lirc-client')({ path: '/var/run/lirc/lircd' });

let lircVersion = '';

lirc.on('connect', () => {
	lirc.send('VERSION').then(res => {
		lircVersion = res[0];
		console.log('LIRC Version', lircVersion);
	});
});

router.use(bodyParser.json());
router.get('/', (req, res) => {
	res.send(`LIRC Version: ${lircVersion}`);
});
router.get('/remotes', async (req, res) => {
	const remotes = await lirc.list();
	res.json(remotes);
});
router.get('/:remote', async(req, res) => {
	const cmds = await lirc.list(req.params.remote);
	res.json(cmds);
});
router.post('/:remote/:cmd', async(req, res) => {
	await lirc.sendOnce(req.params.remote, req.params.cmd);
	res.send('OK');
});

module.exports = router;
