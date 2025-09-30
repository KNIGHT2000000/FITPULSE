/**
 * services/SchedulingService.js
 * Business logic to schedule meals/sleep and notifications.
 */
const ScheduleModel = require('../models/ScheduleModel');
const NotificationModel = require('../models/NotificationModel');

class SchedulingService {
    static async scheduleActivity(userId, data) {
        // Validate
        const required = ['scheduled_date', 'scheduled_time', 'activity_type'];
        for (const key of required) {
            if (!data[key]) {
                const err = new Error(`Missing required field: ${key}`);
                err.statusCode = 400;
                throw err;
            }
        }

        // Enforce allowed activity types (align with DB enum)
        const allowedTypes = ['Exercise', 'Meal', 'Meditation', 'Sleep'];
        const type = String(data.activity_type).trim();
        if (!allowedTypes.includes(type)) {
            const err = new Error(`Invalid activity_type. Allowed: ${allowedTypes.join(', ')}`);
            err.statusCode = 400;
            throw err;
        }
        data.activity_type = type;

        // Create schedule
        const schedule = await ScheduleModel.createSchedule(userId, data);

        // Optionally schedule a notification
        if (data.notify === true) {
            const sendTs = `${data.scheduled_date} ${data.scheduled_time}`; // MySQL TIMESTAMP-compatible string
            const message = SchedulingService.buildReminderMessage(data);
            await NotificationModel.scheduleNotification(userId, message, sendTs, 'Reminder');
        }
        return schedule;
    }

    static buildReminderMessage(data) {
        const label = data.activity_type;
        const details = data.activity_details ? ` (${data.activity_details})` : '';
        return `Reminder: ${label}${details} at ${data.scheduled_time}`;
    }

    static coerceToBoolean(value) {
        if (typeof value === 'boolean') return value;
        if (typeof value === 'number') return value === 1;
        if (typeof value === 'string') {
            const v = value.trim().toLowerCase();
            return v === '1' || v === 'true' || v === 'yes' || v === 'y';
        }
        return false;
    }

    static async markCompleted(userId, scheduleId, isCompletedRaw) {
        const isCompleted = SchedulingService.coerceToBoolean(isCompletedRaw);
        const affected = await ScheduleModel.markCompleted(userId, scheduleId, isCompleted);
        if (!affected) {
            const err = new Error('Schedule not found for this user.');
            err.statusCode = 404;
            throw err;
        }
        const updated = await ScheduleModel.getScheduleById(userId, scheduleId);
        return { message: 'Schedule updated.', schedule: updated };
    }

    static async listSchedulesForDate(userId, date) {
        const rows = await ScheduleModel.listSchedulesForDate(userId, date);
        return rows;
    }

    static async listDueNotifications(nowTs) {
        const rows = await NotificationModel.listDueNotifications(nowTs);
        return rows;
    }

    static async markNotificationRead(notificationId) {
        await NotificationModel.markRead(notificationId);
        return { message: 'Notification marked as read.' };
    }

    static async getScheduleById(userId, scheduleId) {
        return await ScheduleModel.getScheduleById(userId, scheduleId);
    }

    static async toggleCompleted(userId, scheduleId) {
        const row = await ScheduleModel.getScheduleById(userId, scheduleId);
        if (!row) {
            const err = new Error('Schedule not found for this user.');
            err.statusCode = 404;
            throw err;
        }
        const next = row.is_completed ? 0 : 1;
        const affected = await ScheduleModel.markCompleted(userId, scheduleId, next === 1);
        if (!affected) {
            const err = new Error('Failed to update schedule.');
            err.statusCode = 500;
            throw err;
        }
        const updated = await ScheduleModel.getScheduleById(userId, scheduleId);
        return { message: 'Schedule toggled.', schedule: updated };
    }
}

module.exports = SchedulingService;


