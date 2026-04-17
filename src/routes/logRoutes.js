const express = require('express');
const logController = require('../controllers/logController');
const { asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();
router.get('/', asyncHandler(logController.list));

module.exports = router;
