/**
 * routes/exerciseRoutes.js
 * Defines routes for goal-based exercise recommendations.
 */
const express = require('express');
const router = express.Router();
const exerciseController = require('../controllers/exerciseController');
const auth = require('../middleware/auth');

// All exercise recommendation routes require authentication
router.use(auth);

// GET /api/exercises/top -> returns up to 3 exercises for the user's goal
router.get('/top', exerciseController.getTopExercises);

module.exports = router;


