const express = require('express');
const websiteController = require('../controllers/websiteController');
const { asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();
router.post('/import', asyncHandler(websiteController.importMany));
router.get('/', asyncHandler(websiteController.list));

module.exports = router;
