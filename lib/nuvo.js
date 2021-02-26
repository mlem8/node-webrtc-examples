'use strict';

const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const SerialPort = require('serialport');
const Readline = require('@serialport/parser-readline');

const SERIAL_PORT = process.env.SERIAL_PORT || '/dev/tty.usbserial';
const port = new SerialPort(SERIAL_PORT);
const parser = port.pipe(new Readline({ delimiter: '\r' }));
let buffer = null;

const GLOBAL_COMMANDS = {
	ALLOFF: 'ALLOFF',
	VERSION: 'VER',
};
const ZONE_COMMANDS = {
	STATUS: 'STATUS',
	POWER_ON: 'ON',
	POWER_OFF: 'OFF',
	POWER_TOGGLE: 'ONOFF',
	SETTINGS: 'SETSR',
	AUX_SETTINGS: 'SETAUX',
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
router.get('/', (req, res) => {
	attachListener(res);
	port.write('*VER\r');
});
router.post('/poweroff', (req, res) => {
	attachListener(res);
	port.write('*ALLOFF\r');
});
router.get('/:zone_id', (req, res) => {
	attachListener(res);
	port.write(`*Z0${req.params.zone_id}STATUS\r`);
});
router.post('/:zone_id/:cmd', (req, res) => {
	attachListener(res);
	port.write(`*Z0${req.params.zone_id}${ZONE_COMMANDS[req.params.cmd.toUpperCase()]}\r`);
});

module.exports = router;
