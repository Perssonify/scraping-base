const express = require('express');
const pageController = require('../controllers/pageController');
const { asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();
router.get('/', asyncHandler(pageController.list));
router.get('/:id', asyncHandler(pageController.getOne));

module.exports = router;
