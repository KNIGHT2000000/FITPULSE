/**
 * services/LearningService.js
 * Contains business logic for determining and retrieving the user's learning module.
 */
const LearningModel = require('../models/LearningModel');

class LearningService {
    /**
     * Retrieves the specific learning module content for a user.
     * @param {string} userId - The ID of the authenticated user.
     * @returns {Promise<object>} The module content.
     */
    static async getLearningModule(userId) {
        // 1. Get the user's goal from their profile
        const goal = await LearningModel.getUserGoal(userId);

        if (!goal) {
            throw new Error('User profile not found or goal is not set.');
        }

        // 2. Get the content based on the goal
        const moduleContent = await LearningModel.getModuleByGoal(goal);

        if (!moduleContent) {
            const notFoundError = new Error('Learning module not found for goal.');
            notFoundError.statusCode = 404;
            throw notFoundError;
        }

        return { goal, ...moduleContent };
    }
}

module.exports = LearningService;