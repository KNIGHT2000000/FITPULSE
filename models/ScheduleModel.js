/**
 * models/ScheduleModel.js
 * Data access for user schedules (meals, sleep, exercise, meditation).
 */
const { pool } = require('../config/db');

class ScheduleModel {
    static async createSchedule(userId, data) {
        const query = `
            INSERT INTO UserSchedules (user_id, scheduled_date, scheduled_time, activity_type, activity_details)
            VALUES (?, ?, ?, ?, ?)
        `;
        const params = [userId, data.scheduled_date, data.scheduled_time, data.activity_type, data.activity_details || null];
        const [result] = await pool.query(query, params);
        return { schedule_id: result.insertId, ...data };
    }

    static async markCompleted(userId, scheduleId, isCompleted) {
        const query = `
            UPDATE UserSchedules SET is_completed = ?
            WHERE schedule_id = ? AND user_id = ?
        `;
        const [result] = await pool.query(query, [isCompleted ? 1 : 0, scheduleId, userId]);
        return result.affectedRows;
    }

    static async listSchedulesForDate(userId, date) {
        const query = `
            SELECT schedule_id, scheduled_date, scheduled_time, activity_type, activity_details, is_completed
            FROM UserSchedules
            WHERE user_id = ? AND scheduled_date = ?
            ORDER BY scheduled_time ASC
        `;
        const [rows] = await pool.query(query, [userId, date]);
        return rows;
    }

    static async listDueSchedules(nowTs) {
        // nowTs is TIMESTAMP string 'YYYY-MM-DD HH:MM:SS'
        const query = `
            SELECT schedule_id, user_id, scheduled_date, scheduled_time, activity_type, activity_details, is_completed
            FROM UserSchedules
            WHERE TIMESTAMP(scheduled_date, scheduled_time) <= ?
              AND is_completed = FALSE
            ORDER BY scheduled_date ASC, scheduled_time ASC
        `;
        const [rows] = await pool.query(query, [nowTs]);
        return rows;
    }

    static async getScheduleById(userId, scheduleId) {
        const query = `
            SELECT schedule_id, user_id, scheduled_date, scheduled_time, activity_type, activity_details, is_completed
            FROM UserSchedules
            WHERE schedule_id = ? AND user_id = ?
            LIMIT 1
        `;
        const [rows] = await pool.query(query, [scheduleId, userId]);
        return rows.length ? rows[0] : null;
    }
}

module.exports = ScheduleModel;


