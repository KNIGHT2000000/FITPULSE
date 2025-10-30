/**
 * controllers/dashboardController.js
 * Handles dashboard-related API requests and responses.
 */
const { pool } = require('../config/db');

/**
 * Get user profile and goal information for dashboard rendering
 * Endpoint: GET /api/dashboard/profile
 */
exports.getUserProfile = async (req, res, next) => {
    try {
        const userId = req.user.id;

        // Query to get user info and profile data
        const query = `
            SELECT 
                u.name, 
                u.email, 
                u.age, 
                u.diet_type,
                p.goal, 
                p.medical_history,
                p.target_weight_kg,
                p.target_body_fat
            FROM Users u
            LEFT JOIN UserProfiles p ON u.user_id = p.user_id
            WHERE u.user_id = ?
        `;

        const [rows] = await pool.query(query, [userId]);

        if (rows.length === 0) {
            return res.status(404).json({
                status: 'error',
                message: 'User profile not found.'
            });
        }

        const userProfile = rows[0];

        res.status(200).json({
            status: 'success',
            data: {
                user: {
                    name: userProfile.name,
                    email: userProfile.email,
                    age: userProfile.age,
                    diet_type: userProfile.diet_type
                },
                profile: {
                    goal: userProfile.goal,
                    medical_history: userProfile.medical_history,
                    target_weight_kg: userProfile.target_weight_kg,
                    target_body_fat: userProfile.target_body_fat
                }
            }
        });

    } catch (error) {
        console.error('Dashboard profile fetch error:', error);
        next(error);
    }
};

/**
 * Get dashboard statistics based on user's goal
 * Endpoint: GET /api/dashboard/stats
 */
exports.getDashboardStats = async (req, res, next) => {
    try {
        const userId = req.user.id;

        // Get recent calorie entries (last 7 days)
        const calorieQuery = `
            SELECT 
                DATE(entry_date) as entry_date,
                SUM(calories) as daily_calories,
                SUM(protein_g) as daily_protein,
                SUM(carbs_g) as daily_carbs,
                SUM(fats_g) as daily_fats
            FROM CalorieEntries 
            WHERE user_id = ? AND entry_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
            GROUP BY DATE(entry_date)
            ORDER BY entry_date DESC
        `;

        // Get recent sleep entries (last 7 days)
        const sleepQuery = `
            SELECT 
                sleep_date,
                duration_minutes,
                quality_rating
            FROM SleepEntries 
            WHERE user_id = ? AND sleep_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
            ORDER BY sleep_date DESC
        `;

        // Get completed activities (last 7 days)
        const activityQuery = `
            SELECT 
                scheduled_date,
                activity_type,
                activity_details,
                is_completed
            FROM UserSchedules 
            WHERE user_id = ? AND scheduled_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
            ORDER BY scheduled_date DESC
        `;

        const [calorieData] = await pool.query(calorieQuery, [userId]);
        const [sleepData] = await pool.query(sleepQuery, [userId]);
        const [activityData] = await pool.query(activityQuery, [userId]);

        console.log('Dashboard stats - User ID:', userId); // Debug log
        console.log('Dashboard stats - Calorie data:', calorieData); // Debug log
        console.log('Dashboard stats - Sleep data:', sleepData); // Debug log

        res.status(200).json({
            status: 'success',
            data: {
                calories: calorieData,
                sleep: sleepData,
                activities: activityData,
                summary: {
                    total_days_tracked: calorieData.length,
                    avg_sleep_hours: sleepData.length > 0 
                        ? (sleepData.reduce((sum, entry) => sum + entry.duration_minutes, 0) / sleepData.length / 60).toFixed(1)
                        : 0,
                    completed_activities: activityData.filter(activity => activity.is_completed).length,
                    total_activities: activityData.length
                }
            }
        });

    } catch (error) {
        console.error('Dashboard stats fetch error:', error);
        next(error);
    }
};
