/**
 * routes/authRoutes.js
 * Defines the public endpoints for user authentication.
 */
const express = require('express');
const authController = require('../controllers/authController');

const router = express.Router();

// Route for user registration (includes initial profile/goal data)
router.post('/register', authController.register);

// Route for user login
router.post('/login', authController.login);

module.exports = router;