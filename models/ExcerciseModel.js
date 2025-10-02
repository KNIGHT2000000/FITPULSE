/**
 * models/ExerciseModel.js
 * Handles fetching exercise recommendations based on the user's goal.
 */
const { pool } = require('../config/db');

class ExerciseModel {
    /**
     * Fetches up to 3 exercises for a specific goal.
     * Selects name, description, and the image_url.
     * @param {string} goal - The user's primary goal (e.g., 'Weight Loss').
     * @returns {Promise<Array<object>>} A list of relevant exercises.
     */
    static async getTopExercisesByGoal(goal) {
        const normalizedGoal = typeof goal === 'string' ? goal.trim() : goal;
        
        // Selects the minimum required fields for the frontend display
        const query = `
            SELECT name, description, image_url, difficulty, focus_area
            FROM Exercises
            WHERE LOWER(goal_type) = LOWER(?)
            LIMIT 3
        `;
        
        const [rows] = await pool.query(query, [normalizedGoal]);
        
        return rows;
    }
}

module.exports = ExerciseModel;
