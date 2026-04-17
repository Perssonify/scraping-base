const express = require('express');
const scrapeController = require('../controllers/scrapeController');
const { asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();
router.post('/', asyncHandler(scrapeController.trigger));

module.exports = router;
