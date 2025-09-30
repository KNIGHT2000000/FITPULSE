/**
 * models/LearningModel.js
 * Handles fetching the user's goal from UserProfiles and retrieving the goal-specific module content.
 */
const { pool } = require('../config/db');

class LearningModel {
    /**
     * Finds the user's registered goal from the UserProfiles table.
     * @param {string} userId - The ID of the authenticated user.
     * @returns {Promise<string|null>} The user's goal (e.g., 'Weight Loss') or null.
     */
    static async getUserGoal(userId) {
        const query = 'SELECT goal FROM UserProfiles WHERE user_id = ?';
        const [rows] = await pool.query(query, [userId]);
        if (!rows.length) {
            return null;
        }
        const goal = rows[0].goal;
        return typeof goal === 'string' ? goal.trim() : goal;
    }

    /**
     * Fetches the specific learning module content based on the goal.
     * @param {string} goal - The user's primary goal.
     * @returns {Promise<object|null>} The module title and content.
     */
    static async getModuleByGoal(goal) {
        const normalizedGoal = typeof goal === 'string' ? goal.trim() : goal;
        const query = 'SELECT title, content FROM learningmodules WHERE LOWER(goal) = LOWER(?) LIMIT 1';
        const [rows] = await pool.query(query, [normalizedGoal]);
        return rows.length ? rows[0] : null;
    }
}

module.exports = LearningModel;