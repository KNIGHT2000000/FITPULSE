/**
 * services/NotificationWorker.js
 * Periodically checks for due schedules and creates notifications if needed.
 */
const ScheduleModel = require('../models/ScheduleModel');
const NotificationModel = require('../models/NotificationModel');

function pad2(n) { return n.toString().padStart(2, '0'); }

function nowTimestamp() {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = pad2(d.getMonth() + 1);
    const dd = pad2(d.getDate());
    const hh = pad2(d.getHours());
    const mi = pad2(d.getMinutes());
    const ss = pad2(d.getSeconds());
    return `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}`;
}

function buildReminderMessage(row) {
    const details = row.activity_details ? ` (${row.activity_details})` : '';
    return `Reminder: ${row.activity_type}${details} at ${row.scheduled_time}`;
}

async function processDueSchedules() {
    const nowTs = nowTimestamp();
    const due = await ScheduleModel.listDueSchedules(nowTs);
    for (const row of due) {
        const sendTime = `${row.scheduled_date} ${row.scheduled_time}`;
        const message = buildReminderMessage(row);
        const exists = await NotificationModel.findExistingReminder(row.user_id, sendTime, message);
        if (!exists) {
            await NotificationModel.scheduleNotification(row.user_id, message, sendTime, 'Reminder');
        }
    }
}

function start(intervalMs = 60000) {
    const timer = setInterval(() => {
        processDueSchedules().catch(err => console.error('[Worker] processDueSchedules error:', err.message));
    }, intervalMs);
    console.log(`[Worker] Notification worker started. Interval: ${intervalMs}ms`);
    return timer;
}

module.exports = { start };


