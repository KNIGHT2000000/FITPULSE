/**
 * controllers/exerciseController.js
 * Handles API request/response for fetching the user's top goal-based exercises and learning modules.
 */
const ExerciseService = require('../services/ExerciseService');
const LearningService = require('../services/LearningService');

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

/**
 * Endpoint: GET /api/exercises/dashboard
 * Retrieves exercises and learning module for the exercise dashboard page.
 */
exports.getExerciseDashboard = async (req, res, next) => {
    try {
        const userId = req.user && req.user.id;
        console.log('Exercise dashboard request for user:', userId); // Debug log
        
        // Get exercises and learning module in parallel
        const [exerciseData, learningData] = await Promise.all([
            ExerciseService.getTopExercisesForUser(userId),
            LearningService.getLearningModule(userId)
        ]);

        console.log('Exercise data retrieved:', exerciseData); // Debug log
        console.log('Learning data retrieved:', learningData); // Debug log

        res.status(200).json({ 
            status: 'success', 
            data: {
                goal: exerciseData.goal,
                exercises: exerciseData.exercises,
                learningModule: learningData
            }
        });
    } catch (error) {
        console.error('Exercise dashboard error:', error); // Debug log
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }
};


