/**
 * models/TrackingModel.js
 * Handles database interactions for CalorieEntries and SleepEntries tables.
 */
const { pool } = require('../config/db');

class TrackingModel {
    /**
     * Logs a new calorie entry (e.g., a meal or snack).
     * @param {string} userId - ID of the user.
     * @param {object} entryData - Meal details.
     */
    static async logCalorieEntry(userId, entryData) {
        const { entry_date, meal_type, food_item, calories, protein_g, carbs_g, fats_g } = entryData;
        
        // Use COALESCE for optional fields to ensure a proper value (or the default 0.00) is used
        const query = `
            INSERT INTO CalorieEntries 
            (user_id, entry_date, meal_type, food_item, calories, protein_g, carbs_g, fats_g) 
            VALUES (?, ?, ?, ?, ?, COALESCE(?, 0.00), COALESCE(?, 0.00), COALESCE(?, 0.00))
        `;
        
        await pool.query(query, [userId, entry_date, meal_type, food_item, calories, protein_g, carbs_g, fats_g]);
    }

    /**
     * Logs a new sleep cycle entry.
     * @param {string} userId - ID of the user.
     * @param {object} entryData - Sleep details.
     */
    static async logSleepEntry(userId, entryData) {
        const { sleep_date, start_time, end_time, duration_minutes, quality_rating, notes } = entryData;
        
        const query = `
            INSERT INTO SleepEntries 
            (user_id, sleep_date, start_time, end_time, duration_minutes, quality_rating, notes) 
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        
        try {
            await pool.query(query, [userId, sleep_date, start_time, end_time, duration_minutes, quality_rating, notes]);
        } catch (error) {
            if (error.code === 'ER_DUP_ENTRY') {
                throw new Error('A sleep entry for this date already exists.');
            }
            throw error;
        }
    }

    /**
     * Retrieves all calorie entries for a specific user and date.
     */
    static async getCalorieEntriesByDate(userId, date) {
        const query = 'SELECT * FROM CalorieEntries WHERE user_id = ? AND entry_date = ? ORDER BY entry_id ASC';
        const [rows] = await pool.query(query, [userId, date]);
        return rows;
    }

    /**
     * Retrieves the sleep entry for a specific user and date.
     */
    static async getSleepEntryByDate(userId, date) {
        const query = 'SELECT * FROM SleepEntries WHERE user_id = ? AND sleep_date = ? LIMIT 1';
        const [rows] = await pool.query(query, [userId, date]);
        return rows[0] || null;
    }
}

module.exports = TrackingModel;