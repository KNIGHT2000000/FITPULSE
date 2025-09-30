
const express = require('express');
const router = express.Router();
const learningController = require('../controllers/learningController');
const auth = require('../middleware/auth'); // Check this path if you get Module Not Found

// THE ROUTE DEFINITION IS HERE:
router.get('/my-module', auth, learningController.getLearningModule);

module.exports = router;