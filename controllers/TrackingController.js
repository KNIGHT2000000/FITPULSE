/**
 * controllers/trackingController.js
 * Handles API requests for calorie and sleep tracking.
 * All endpoints are protected by the auth middleware.
 */
const TrackingService = require('../services/TrackingService');

// Helper to validate common entry data
const validateRequiredFields = (data, fields) => {
    for (const field of fields) {
        if (!data[field]) {
            throw new Error(`Missing required field: ${field}`);
        }
    }
};

/**
 * Logs a new calorie entry.
 * Endpoint: POST /api/track/calories
 */
exports.logCalories = async (req, res, next) => {
    try {
        const userId = req.user.id; // From JWT middleware
        const data = req.body;

        validateRequiredFields(data, ['entry_date', 'meal_type', 'food_item', 'calories']);

        const result = await TrackingService.logCalories(userId, data);

        res.status(201).json({ status: 'success', message: result.message, entry: data });
    } catch (error) {
        error.statusCode = 400; // Bad request for validation errors
        next(error);
    }
};

/**
 * Logs a new sleep cycle entry.
 * Endpoint: POST /api/track/sleep
 */
exports.logSleep = async (req, res, next) => {
    try {
        const userId = req.user.id; // From JWT middleware
        const data = req.body;
        
        validateRequiredFields(data, ['sleep_date', 'start_time', 'end_time', 'duration_minutes']);
        
        // Note: duration_minutes should ideally be calculated on the backend or highly trusted
        if (typeof data.duration_minutes !== 'number' || data.duration_minutes <= 0) {
            return res.status(400).json({ status: 'error', message: 'Duration must be a positive number.' });
        }

        const result = await TrackingService.logSleep(userId, data);

        res.status(201).json({ status: 'success', message: result.message, entry: data });
    } catch (error) {
        if (error.message.includes('A sleep entry for this date already exists')) {
            error.statusCode = 409;
        } else {
            error.statusCode = 400;
        }
        next(error);
    }
};

/**
 * Retrieves the daily summary for calories and sleep.
 * Endpoint: GET /api/track/summary/:date
 */
exports.getDailySummary = async (req, res, next) => {
    try {
        const userId = req.user.id; // From JWT middleware
        const date = req.params.date; // Date in YYYY-MM-DD format

        if (!date) {
            return res.status(400).json({ status: 'error', message: 'Date parameter is required.' });
        }
        
        const summary = await TrackingService.getDailySummary(userId, date);

        res.status(200).json({ status: 'success', data: summary });
    } catch (error) {
        error.statusCode = 500;
        next(error);
    }
};