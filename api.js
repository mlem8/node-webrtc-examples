'use strict';

const express = require('express');
const router = express.Router();

// TODO:
//  - integrate nuvo commands
//  - integrate IR commands

router.use('/ir', require('./lib/ir'));
router.use('/nuvo', require('./lib/nuvo'));

module.exports = router;
