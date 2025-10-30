/**
 * routes/scheduleRoutes.js
 * API routes for activity scheduling and management
 */

const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');
const auth = require('../middleware/auth');

// Apply authentication middleware to all routes
router.use(auth);

/**
 * GET /api/schedule/activities
 * Get all scheduled activities for the authenticated user
 */
router.get('/activities', async (req, res) => {
    try {
        const userId = req.user.id;
        console.log('Fetching activities for user:', userId);

        const query = `
            SELECT 
                schedule_id,
                scheduled_date,
                scheduled_time,
                activity_type,
                activity_details,
                is_completed
            FROM UserSchedules 
            WHERE user_id = ?
            ORDER BY scheduled_date ASC, scheduled_time ASC
        `;

        const [rows] = await pool.query(query, [userId]);
        console.log('Activities found:', rows.length);

        // Map database fields to expected frontend format
        const activities = rows.map(row => ({
            schedule_id: row.schedule_id,
            scheduled_date: row.scheduled_date,
            scheduled_time: row.scheduled_time,
            activity_type: row.activity_type,
            activity_details: row.activity_details,
            notes: '', // Default empty since column doesn't exist
            status: row.is_completed ? 'completed' : 'pending',
            created_at: row.created_at || new Date().toISOString()
        }));

        res.status(200).json({
            status: 'success',
            data: activities
        });
    } catch (error) {
        console.error('Error fetching scheduled activities:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch scheduled activities'
        });
    }
});

/**
 * POST /api/schedule/activities
 * Create a new scheduled activity
 */
router.post('/activities', async (req, res) => {
    try {
        const userId = req.user.id;
        const { scheduled_date, scheduled_time, activity_type, activity_details, notes } = req.body;

        console.log('Creating activity for user:', userId, req.body);

        // Validate required fields
        if (!scheduled_date || !scheduled_time || !activity_type || !activity_details) {
            return res.status(400).json({
                status: 'error',
                message: 'Missing required fields: scheduled_date, scheduled_time, activity_type, activity_details'
            });
        }

        // Validate activity type
        const validTypes = ['Exercise', 'Meal', 'Meditation', 'Sleep'];
        if (!validTypes.includes(activity_type)) {
            return res.status(400).json({
                status: 'error',
                message: 'Invalid activity type. Must be one of: Exercise, Meal, Meditation, Sleep'
            });
        }

        const query = `
            INSERT INTO UserSchedules (
                user_id, 
                scheduled_date, 
                scheduled_time, 
                activity_type, 
                activity_details, 
                is_completed
            ) VALUES (?, ?, ?, ?, ?, FALSE)
        `;

        const [result] = await pool.query(query, [
            userId,
            scheduled_date,
            scheduled_time,
            activity_type,
            activity_details
        ]);

        console.log('Activity created with ID:', result.insertId);

        // Schedule notification for this activity
        await scheduleNotification(userId, result.insertId, scheduled_date, scheduled_time, activity_details);

        res.status(201).json({
            status: 'success',
            message: 'Activity scheduled successfully',
            data: {
                schedule_id: result.insertId,
                scheduled_date,
                scheduled_time,
                activity_type,
                activity_details,
                notes: notes || '', // Store in response even if not in DB
                status: 'pending'
            }
        });
    } catch (error) {
        console.error('Error creating scheduled activity:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to create scheduled activity'
        });
    }
});

/**
 * PATCH /api/schedule/activities/:id/complete
 * Mark an activity as completed
 */
router.patch('/activities/:id/complete', async (req, res) => {
    try {
        const userId = req.user.id;
        const scheduleId = req.params.id;

        console.log('Marking activity as completed:', scheduleId, 'for user:', userId);

        const query = `
            UPDATE UserSchedules 
            SET is_completed = TRUE
            WHERE schedule_id = ? AND user_id = ?
        `;

        const [result] = await pool.query(query, [scheduleId, userId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                status: 'error',
                message: 'Activity not found or not authorized'
            });
        }

        console.log('Activity marked as completed');

        res.status(200).json({
            status: 'success',
            message: 'Activity marked as completed'
        });
    } catch (error) {
        console.error('Error marking activity as completed:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to update activity status'
        });
    }
});

/**
 * DELETE /api/schedule/activities/:id
 * Delete a scheduled activity
 */
router.delete('/activities/:id', async (req, res) => {
    try {
        const userId = req.user.id;
        const scheduleId = req.params.id;

        console.log('Deleting activity:', scheduleId, 'for user:', userId);

        const query = `
            DELETE FROM UserSchedules 
            WHERE schedule_id = ? AND user_id = ?
        `;

        const [result] = await pool.query(query, [scheduleId, userId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                status: 'error',
                message: 'Activity not found or not authorized'
            });
        }

        console.log('Activity deleted');

        res.status(200).json({
            status: 'success',
            message: 'Activity deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting activity:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to delete activity'
        });
    }
});

/**
 * GET /api/schedule/upcoming
 * Get upcoming activities for notifications
 */
router.get('/upcoming', async (req, res) => {
    try {
        const userId = req.user.id;
        const now = new Date();
        const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour from now

        console.log('Fetching upcoming activities for user:', userId);

        const query = `
            SELECT 
                schedule_id,
                scheduled_date,
                scheduled_time,
                activity_type,
                activity_details
            FROM UserSchedules 
            WHERE user_id = ? 
            AND is_completed = FALSE
            AND CONCAT(scheduled_date, ' ', scheduled_time) BETWEEN ? AND ?
            ORDER BY scheduled_date ASC, scheduled_time ASC
        `;

        const [rows] = await pool.query(query, [
            userId,
            now.toISOString().slice(0, 19).replace('T', ' '),
            oneHourFromNow.toISOString().slice(0, 19).replace('T', ' ')
        ]);

        res.status(200).json({
            status: 'success',
            data: rows
        });
    } catch (error) {
        console.error('Error fetching upcoming activities:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch upcoming activities'
        });
    }
});

/**
 * GET /api/schedule/stats
 * Get scheduling statistics for the user
 */
router.get('/stats', async (req, res) => {
    try {
        const userId = req.user.id;
        const now = new Date();
        const startOfWeek = getStartOfWeek(now);
        const endOfWeek = new Date(startOfWeek.getTime() + 6 * 24 * 60 * 60 * 1000);

        console.log('Fetching schedule stats for user:', userId);

        // Get weekly stats
        const weeklyQuery = `
            SELECT 
                COUNT(*) as total_scheduled,
                SUM(CASE WHEN is_completed = TRUE THEN 1 ELSE 0 END) as completed,
                activity_type,
                COUNT(*) as type_count
            FROM UserSchedules 
            WHERE user_id = ? 
            AND scheduled_date BETWEEN ? AND ?
            GROUP BY activity_type
        `;

        const [weeklyStats] = await pool.query(weeklyQuery, [
            userId,
            startOfWeek.toISOString().split('T')[0],
            endOfWeek.toISOString().split('T')[0]
        ]);

        // Get streak data (simplified)
        const streakQuery = `
            SELECT DISTINCT scheduled_date
            FROM UserSchedules 
            WHERE user_id = ? 
            AND is_completed = TRUE
            AND scheduled_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
            ORDER BY scheduled_date DESC
        `;

        const [streakData] = await pool.query(streakQuery, [userId]);

        res.status(200).json({
            status: 'success',
            data: {
                weekly_stats: weeklyStats,
                streak_days: streakData.length
            }
        });
    } catch (error) {
        console.error('Error fetching schedule stats:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch schedule statistics'
        });
    }
});

/**
 * Helper function to schedule notifications
 */
async function scheduleNotification(userId, scheduleId, scheduledDate, scheduledTime, activityDetails) {
    try {
        // Calculate notification time (15 minutes before activity)
        const activityDateTime = new Date(`${scheduledDate}T${scheduledTime}`);
        const notificationTime = new Date(activityDateTime.getTime() - 15 * 60 * 1000); // 15 minutes before
        
        // Only schedule if notification time is in the future
        if (notificationTime > new Date()) {
            const query = `
                INSERT INTO Notifications (
                    user_id,
                    title,
                    message,
                    scheduled_time,
                    type,
                    reference_id
                ) VALUES (?, ?, ?, ?, 'activity_reminder', ?)
            `;

            await pool.query(query, [
                userId,
                'Activity Reminder',
                `Don't forget: ${activityDetails} is scheduled in 15 minutes`,
                notificationTime.toISOString().slice(0, 19).replace('T', ' '),
                scheduleId
            ]);

            console.log('Notification scheduled for activity:', scheduleId);
        }
    } catch (error) {
        console.error('Error scheduling notification:', error);
        // Don't fail the main request if notification scheduling fails
    }
}

/**
 * Helper function to get start of week (Monday)
 */
function getStartOfWeek(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    return new Date(d.setDate(diff));
}

module.exports = router;
