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
        console.log('LearningModel: Getting goal for user:', userId); // Debug log
        const query = 'SELECT goal FROM UserProfiles WHERE user_id = ?';
        const [rows] = await pool.query(query, [userId]);
        console.log('LearningModel: UserProfiles query result:', rows); // Debug log
        
        if (!rows.length) {
            return null;
        }
        const goal = rows[0].goal;
        const trimmedGoal = typeof goal === 'string' ? goal.trim() : goal;
        console.log('LearningModel: Final goal:', trimmedGoal); // Debug log
        return trimmedGoal;
    }

    /**
     * Fetches the specific learning module content based on the goal.
     * @param {string} goal - The user's primary goal.
     * @returns {Promise<object|null>} The module title and content.
     */
    static async getModuleByGoal(goal) {
        const normalizedGoal = typeof goal === 'string' ? goal.trim() : goal;
        console.log('LearningModel: Getting module for goal:', normalizedGoal); // Debug log
        const query = 'SELECT title, content FROM learningmodules WHERE LOWER(goal) = LOWER(?) LIMIT 1';
        console.log('LearningModel: Executing query:', query, 'with goal:', normalizedGoal); // Debug log
        const [rows] = await pool.query(query, [normalizedGoal]);
        console.log('LearningModel: Learning module query result:', rows); // Debug log
        return rows.length ? rows[0] : null;
    }
}

module.exports = LearningModel;