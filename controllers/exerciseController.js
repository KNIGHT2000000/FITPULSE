/**
 * controllers/exerciseController.js
 * Handles API request/response for fetching the user's top goal-based exercises.
 */
const ExerciseService = require('../services/ExerciseService');

/**
 * Endpoint: GET /api/exercises/top
 * Retrieves up to 3 exercises for the authenticated user's goal.
 */
exports.getTopExercises = async (req, res, next) => {
    try {
        const userId = req.user && req.user.id;
        const payload = await ExerciseService.getTopExercisesForUser(userId);

        res.status(200).json({ status: 'success', data: payload });
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }
};


