
/**
 * services/TrackingService.js
 * Contains business logic for data tracking, including calculating summaries.
 */
const TrackingModel = require('../models/TrackingModel');

class TrackingService {
    /**
     * Calculates sleep duration in minutes and logs the entry.
     * NOTE: This assumes start_time and end_time are simple time strings (HH:MM:SS) 
     * and the duration calculation happens in the database or relies on input.
     * For simplicity, the model now accepts duration_minutes directly, calculated by the controller/client.
     * @param {string} userId - The user ID.
     * @param {object} data - Sleep data including date, start/end times, and calculated duration.
     */
    static async logSleep(userId, data) {
        // Calculate duration in minutes (if not done by client/controller)
        // For now, we trust the duration_minutes provided by the client/controller for simplicity.
        // A more robust backend would recalculate this from start_time and end_time, handling rollover (midnight).
        if (typeof data.duration_minutes !== 'number' || data.duration_minutes <= 0) {
            throw new Error('Invalid or missing sleep duration in minutes.');
        }

        await TrackingModel.logSleepEntry(userId, data);
        return { message: 'Sleep entry logged successfully.' };
    }

    /**
     * Logs a calorie/meal entry.
     */
    static async logCalories(userId, data) {
        if (!data.calories || data.calories <= 0) {
            throw new Error('Calorie count must be a positive number.');
        }

        await TrackingModel.logCalorieEntry(userId, data);
        return { message: 'Calorie entry logged successfully.' };
    }

    /**
     * Retrieves the daily summary for calories and sleep.
     */
    static async getDailySummary(userId, date) {
        if (!date) {
            throw new Error('Date is required for daily summary.');
        }
        
        // 1. Get Calorie Entries
        const calorieEntries = await TrackingModel.getCalorieEntriesByDate(userId, date);

        let totalCalories = 0;
        let totalProtein = 0;
        let totalCarbs = 0;
        let totalFats = 0;

        calorieEntries.forEach(entry => {
            totalCalories += entry.calories;
            totalProtein += parseFloat(entry.protein_g);
            totalCarbs += parseFloat(entry.carbs_g);
            totalFats += parseFloat(entry.fats_g);
        });

        // 2. Get Sleep Entry
        const sleepEntry = await TrackingModel.getSleepEntryByDate(userId, date);

        return {
            date,
            calories: {
                total: totalCalories,
                entries: calorieEntries,
                macros: {
                    protein: totalProtein.toFixed(2),
                    carbs: totalCarbs.toFixed(2),
                    fats: totalFats.toFixed(2)
                }
            },
            sleep: sleepEntry
        };
    }
}

module.exports = TrackingService;