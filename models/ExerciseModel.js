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
        console.log('ExerciseModel: Getting exercises for goal:', normalizedGoal); // Debug log

        const query = `
            SELECT name, description, image_url, difficulty, focus_area
            FROM exercises
            WHERE LOWER(goal_type) = LOWER(?)
            ORDER BY exercise_id
            LIMIT 3
        `;

        console.log('ExerciseModel: Executing query:', query, 'with goal:', normalizedGoal); // Debug log
        const [rows] = await pool.query(query, [normalizedGoal]);
        console.log('ExerciseModel: Exercise query result:', rows.length, 'exercises found:', rows); // Debug log
        return rows;
    }
}

module.exports = ExerciseModel;
                                        

