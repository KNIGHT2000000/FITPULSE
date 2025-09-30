/**
 * controllers/schedulingController.js
 * Request/response layer for scheduling and notifications.
 */
const SchedulingService = require('../services/SchedulingService');

exports.createSchedule = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const schedule = await SchedulingService.scheduleActivity(userId, req.body);
        res.status(201).json({ status: 'success', data: schedule });
    } catch (error) {
        error.statusCode = error.statusCode || 400;
        next(error);
    }
};

exports.markScheduleCompleted = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const scheduleId = parseInt(req.params.id, 10);
        const result = await SchedulingService.markCompleted(userId, scheduleId, req.body.is_completed);
        res.status(200).json({ status: 'success', ...result });
    } catch (error) {
        error.statusCode = error.statusCode || 400;
        next(error);
    }
};

exports.listSchedulesForDate = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const date = req.params.date; // YYYY-MM-DD
        const rows = await SchedulingService.listSchedulesForDate(userId, date);
        res.status(200).json({ status: 'success', data: rows });
    } catch (error) {
        error.statusCode = error.statusCode || 400;
        next(error);
    }
};

exports.getScheduleById = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const scheduleId = parseInt(req.params.id, 10);
        const row = await SchedulingService.getScheduleById(userId, scheduleId);
        if (!row) {
            return res.status(404).json({ status: 'error', message: 'Schedule not found.' });
        }
        res.status(200).json({ status: 'success', data: row });
    } catch (error) {
        error.statusCode = error.statusCode || 400;
        next(error);
    }
};

exports.toggleScheduleCompleted = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const scheduleId = parseInt(req.params.id, 10);
        const result = await SchedulingService.toggleCompleted(userId, scheduleId);
        res.status(200).json({ status: 'success', ...result });
    } catch (error) {
        error.statusCode = error.statusCode || 400;
        next(error);
    }
};

exports.listDueNotifications = async (req, res, next) => {
    try {
        const nowTs = req.query.now || new Date().toISOString().slice(0, 19).replace('T', ' ');
        const rows = await SchedulingService.listDueNotifications(nowTs);
        res.status(200).json({ status: 'success', data: rows });
    } catch (error) {
        error.statusCode = error.statusCode || 400;
        next(error);
    }
};

exports.markNotificationRead = async (req, res, next) => {
    try {
        const notificationId = parseInt(req.params.id, 10);
        if (!Number.isFinite(notificationId)) {
            const err = new Error('Invalid notification id. It must be a number.');
            err.statusCode = 400;
            throw err;
        }
        const result = await SchedulingService.markNotificationRead(notificationId);
        res.status(200).json({ status: 'success', ...result });
    } catch (error) {
        error.statusCode = error.statusCode || 400;
        next(error);
    }
};


