// 1. Load environment variables from .env file
require('dotenv').config();

const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON request bodies
app.use(express.json());

// --- Database Connection Setup (Placeholder - will be implemented in db.js) ---
const db = require('./config/db'); // We will create this file next

// Simple health check endpoint
app.get('/', (req, res) => {
    res.status(200).send('Fitness Tracker API is running.');
});
const authRoutes = require('./routes/authRoutes'); 
const trackingRoutes = require('./routes/trackingRoutes');
// <-- NEW LINE 1: Import the routes
app.use('/api/auth', authRoutes);

app.use('/api/track', trackingRoutes);

// Test DB connection on startup
db.getConnection()
    .then(() => {
        console.log('[Database] MySQL connected successfully.');

        // Start the server only if the database connection is successful
        app.listen(PORT, () => {
            console.log(`[Server] Server running on http://localhost:${PORT}`);
            console.log(`[Project] Goal: Implement Auth, Profiles, Tracking, and Scheduling.`);
        });
    })
    .catch(err => {
        console.error('[Database] MySQL connection failed:', err.message);
        console.error('Exiting application due to database error.');
        process.exit(1); // Exit process if DB connection fails
    });

// ---------------------------------------------------------------------
// 2. Route Definitions (Will be added in subsequent steps)
// app.use('/api/auth', require('./routes/authRoutes'));
// app.use('/api/profile', require('./routes/profileRoutes'));
// ... etc.

// ---------------------------------------------------------------------
// 3. Global Error Handler (Good practice)
app.use((err, req, res, next) => {
    console.error('[Global Error]', err.stack);
    res.status(err.statusCode || 500).json({
        status: 'error',
        message: err.message || 'An unexpected error occurred on the server.'
    });
});