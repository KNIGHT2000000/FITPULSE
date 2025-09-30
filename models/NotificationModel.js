/**
 * models/NotificationModel.js
 * Data access for notifications.
 */
const { pool } = require('../config/db');

class NotificationModel {
    static async scheduleNotification(userId, message, sendTime, type) {
        const query = `
            INSERT INTO Notifications (user_id, message, send_time, type)
            VALUES (?, ?, ?, ?)
        `;
        const [result] = await pool.query(query, [userId, message, sendTime, type]);
        return { notification_id: result.insertId, user_id: userId, message, send_time: sendTime, type };
    }

    static async listDueNotifications(nowTs) {
        const query = `
            SELECT notification_id, user_id, message, send_time, type, is_read
            FROM Notifications
            WHERE send_time <= ? AND is_read = FALSE
            ORDER BY send_time ASC
        `;
        const [rows] = await pool.query(query, [nowTs]);
        return rows;
    }

    static async markRead(notificationId) {
        const query = `
            UPDATE Notifications SET is_read = TRUE
            WHERE notification_id = ?
        `;
        await pool.query(query, [notificationId]);
    }

    static async findExistingReminder(userId, sendTime, message) {
        const query = `
            SELECT notification_id FROM Notifications
            WHERE user_id = ? AND send_time = ? AND message = ? AND type = 'Reminder'
            LIMIT 1
        `;
        const [rows] = await pool.query(query, [userId, sendTime, message]);
        return rows.length ? rows[0] : null;
    }
}

module.exports = NotificationModel;


