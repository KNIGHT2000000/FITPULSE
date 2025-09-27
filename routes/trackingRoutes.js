/**
 * routes/trackingRoutes.js
 * Defines routes for calorie and sleep tracking.
 */
const express = require('express');
const router = express.Router();
const trackingController = require('../controllers/TrackingController');
const auth = require('../middleware/auth'); // Import the auth middleware

// All routes here require authentication (JWT)
router.use(auth); 

// Log a new calorie entry
router.post('/calories', trackingController.logCalories);

// Log a new sleep entry
router.post('/sleep', trackingController.logSleep);

// Get a daily summary (calories + sleep)
router.get('/summary/:date', trackingController.getDailySummary);

module.exports = router;
