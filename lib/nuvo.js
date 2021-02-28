'use strict';

const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const SerialPort = require('serialport');
const Readline = require('@serialport/parser-readline');

const SERIAL_PORT = process.env.SERIAL_PORT || '/dev/tty.usbserial';
const port = new SerialPort(SERIAL_PORT);
const parser = port.pipe(new Readline({ delimiter: '\r' }));

const GLOBAL_COMMANDS = {
	ALLOFF: 'ALLOFF',
	VERSION: 'VER',
};
const ZONE_COMMANDS = {
	STATUS: 'STATUS',
	POWER_ON: 'ON',
	POWER_OFF: 'OFF',
	POWER_TOGGLE: 'ONOFF',
	SETTINGS: 'SETSR',		// Zone Settings Status Request
	AUX_SETTINGS: 'SETAUX',	// Zone Aux Settings Request
	VOLUME: 'VOL',			// 00-78: new volume level (0=loudest, 78=quietest)
	SOURCE: 'SRC',			// 1-6: source number (1=3.5mm Pi output, 2=AVR)
};
const ZONE_PROPERTIES = {
	Z: 'zone',
	SRC: 'source',
	GRP: 'group',
	VOL: 'volume',
	BASS: 'bass',
	TREB: 'treble',
};

function attachListener(res) {
	console.log('sending command...');
	parser.once('data', data => {
		console.log('sending response:', data);
		res.end(data);
	});
}

router.use(bodyParser.json());
router.use((req, res, next) => {
	attachListener(res);
	next();
});
router.param('zone_id', (req, res, next, value, name) => {
	req.zone_id = `Z0${value}`;
	next();
});
router.param('zone_cmd', (req, res, next, value, name) => {
	req.zone_cmd = ZONE_COMMANDS[value.toUpperCase()];
	next();
});
router.get('/', (req, res) => {
	port.write('*VER\r');
});
router.post('/poweroff', (req, res) => {
	port.write('*ALLOFF\r');
});
router.get('/:zone_id', (req, res) => {
	const cmd = ['*', req.zone_id, 'STATUS', '\r'].join('');
	port.write(cmd);
});
router.post('/:zone_id/:zone_cmd', (req, res) => {
	const cmd_params = req.body.cmd_params || '';
	const cmd = ['*', req.zone_id, req.zone_cmd, cmd_params, '\r'].join('');
	port.write(cmd);
});

module.exports = router;
