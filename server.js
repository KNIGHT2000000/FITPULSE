// 1. Load environment variables from .env file
require('dotenv').config();

const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON request bodies
app.use(express.json());

// CORS middleware to allow frontend to communicate with backend
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
    } else {
        next();
    }
});

// --- Database Connection Setup ---
const db = require('./config/db');

// Import routes
const authRoutes = require('./routes/authRoutes'); 
const trackingRoutes = require('./routes/trackingRoutes');
const learningRoutes = require('./routes/learningRoutes');
const exerciseRoutes = require('./routes/exerciseRoutes');
const schedulingRoutes = require('./routes/schedulingRoutes');
const NotificationWorker = require('./services/NotificationWorker');

// API Routes (must come before static files)
app.use('/api/auth', authRoutes);

app.use('/api/track', trackingRoutes);
app.use('/api/learning', learningRoutes);
app.use('/api/exercises', exerciseRoutes);
app.use('/api/schedule', schedulingRoutes);

// Serve static files from the flexi signin directory (after API routes)
app.use(express.static(path.join(__dirname, 'flexi signin')));

// Simple health check endpoint
app.get('/', (req, res) => {
    res.status(200).send('Fitness Tracker API is running.');
});

// Test DB connection on startup
db.getConnection()
    .then(() => {
        console.log('[Database] MySQL connected successfully.');

        // Start the server only if the database connection is successful
        app.listen(PORT, () => {
            console.log(`[Server] Server running on http://localhost:${PORT}`);
            console.log(`[Project] Goal: Implement Auth, Profiles, Tracking, and Scheduling.`);
            // Start background worker for notifications (every minute)
            NotificationWorker.start(60000);
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