/**
 * controllers/learningController.js
 * Handles API request/response for fetching the user's goal-specific learning module.
 */
const LearningService = require('../services/LearningService');

/**
 * Endpoint: GET /api/goals/my-module
 * Retrieves the learning content based on the user's goal.
 */
exports.getLearningModule = async (req, res, next) => {
    try {
        // req.user.id is set by the auth middleware
        const userId = req.user.id; 

        if (!userId) {
            // Should be caught by middleware, but good for safety
            return res.status(401).json({ message: 'Unauthorized access.' });
        }

        const moduleData = await LearningService.getLearningModule(userId);

        res.status(200).json({
            status: 'success',
            data: moduleData
        });
    } catch (error) {
        if (error.message.includes('goal is not set')) {
            error.statusCode = 404;
        }
        next(error); 
    }
};
